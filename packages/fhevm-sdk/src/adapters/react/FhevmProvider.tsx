/**
 * FhevmProvider - React Context Provider
 * 
 * Wagmi-like provider pattern for FHEVM SDK
 * Usage:
 * 
 * ```tsx
 * <FhevmProvider config={config}>
 *   <App />
 * </FhevmProvider>
 * ```
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { FhevmClient, createFhevmClient, FhevmClientConfig, FhevmClientStatus } from '../../core';

export interface FhevmProviderConfig extends FhevmClientConfig {
  // React-specific config can be added here
}

export interface FhevmContextValue {
  client: FhevmClient | undefined;
  status: FhevmClientStatus;
  isReady: boolean;
  error: Error | undefined;
  reconnect: () => Promise<void>;
}

const FhevmContext = createContext<FhevmContextValue | undefined>(undefined);

export interface FhevmProviderProps {
  config: FhevmProviderConfig;
  children: React.ReactNode;
  
  // Optional callbacks
  onStatusChange?: (status: FhevmClientStatus) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
}

/**
 * FHEVM Provider Component
 */
export function FhevmProvider({ 
  config, 
  children, 
  onStatusChange,
  onError,
  onConnected 
}: FhevmProviderProps) {
  const [client, setClient] = useState<FhevmClient | undefined>(undefined);
  const [status, setStatus] = useState<FhevmClientStatus>('idle');
  const [error, setError] = useState<Error | undefined>(undefined);

  // Initialize client once
  useEffect(() => {
    const newClient = createFhevmClient(config);
    setClient(newClient);

    // Subscribe to client events
    const unsubscribeStatus = newClient.on('statusChange', ({ status: newStatus }) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    });

    const unsubscribeError = newClient.on('error', (err) => {
      setError(err);
      onError?.(err);
    });

    const unsubscribeConnected = newClient.on('connected', () => {
      onConnected?.();
    });

    // Update initial status
    setStatus(newClient.status);

    return () => {
      unsubscribeStatus();
      unsubscribeError();
      unsubscribeConnected();
      newClient.disconnect();
    };
  }, [
    config.network,
    config.provider,
    config.autoInit,
    onStatusChange,
    onError,
    onConnected,
  ]);

  // Reconnect handler
  const reconnect = useCallback(async () => {
    if (client) {
      try {
        await client.reconnect();
        setError(undefined);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    }
  }, [client]);

  const contextValue = useMemo<FhevmContextValue>(() => ({
    client,
    status,
    isReady: status === 'ready' && client !== undefined,
    error,
    reconnect,
  }), [client, status, error, reconnect]);

  return (
    <FhevmContext.Provider value={contextValue}>
      {children}
    </FhevmContext.Provider>
  );
}

/**
 * Hook to access FHEVM context
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { client, isReady } = useFhevmContext();
 *   
 *   if (!isReady) return <div>Loading...</div>;
 *   
 *   return <div>Ready!</div>;
 * }
 * ```
 */
export function useFhevmContext(): FhevmContextValue {
  const context = useContext(FhevmContext);
  
  if (context === undefined) {
    throw new Error('useFhevmContext must be used within a FhevmProvider');
  }
  
  return context;
}

/**
 * Hook to access FHEVM client directly
 * Throws if not ready
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const client = useFhevmClient();
 *   // client is guaranteed to be ready here
 * }
 * ```
 */
export function useFhevmClient(): FhevmClient {
  const { client, isReady } = useFhevmContext();
  
  if (!isReady || !client) {
    throw new Error('FHEVM client is not ready. Check isReady before using useFhevmClient.');
  }
  
  return client;
}

