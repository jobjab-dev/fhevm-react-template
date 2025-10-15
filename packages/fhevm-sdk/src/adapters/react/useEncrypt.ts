/**
 * useEncrypt - React Hook for Encryption
 * 
 * Wagmi-like encryption hook with loading states and error handling
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { encrypt, isEncrypting, error } = useEncrypt();
 *   
 *   const handleEncrypt = async () => {
 *     const result = await encrypt({
 *       contractAddress: '0x...',
 *       userAddress: '0x...',
 *       value: { type: 'euint32', value: 42 }
 *     });
 *   };
 * }
 * ```
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useFhevmClient } from './FhevmProvider';
import type { EncryptionValue, EncryptionResult } from '../../core';
import { isFhevmError, formatErrorMessage } from '../../core';

export interface UseEncryptOptions {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  
  // Optional callbacks
  onSuccess?: (result: EncryptionResult) => void;
  onError?: (error: Error) => void;
}

export interface UseEncryptReturn {
  // Single value encryption
  encrypt: (value: EncryptionValue) => Promise<EncryptionResult | undefined>;
  
  // Batch encryption
  encryptBatch: (values: EncryptionValue[]) => Promise<EncryptionResult | undefined>;
  
  // Struct encryption
  encryptStruct: <T extends Record<string, EncryptionValue>>(
    struct: T
  ) => Promise<{ result: EncryptionResult; fields: (keyof T)[] } | undefined>;
  
  // State
  isEncrypting: boolean;
  error: Error | undefined;
  data: EncryptionResult | undefined;
  
  // Helpers
  reset: () => void;
}

export function useEncrypt(options?: Partial<UseEncryptOptions>): UseEncryptReturn {
  const client = useFhevmClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<EncryptionResult | undefined>(undefined);

  const reset = useCallback(() => {
    setIsEncrypting(false);
    setError(undefined);
    setData(undefined);
  }, []);

  const encrypt = useCallback(async (value: EncryptionValue): Promise<EncryptionResult | undefined> => {
    if (!options?.contractAddress || !options?.userAddress) {
      const err = new Error('contractAddress and userAddress are required');
      setError(err);
      options?.onError?.(err);
      return undefined;
    }

    setIsEncrypting(true);
    setError(undefined);

    try {
      const result = await client.encrypt(
        options.contractAddress,
        options.userAddress,
        value
      );
      
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      
      if (isFhevmError(error)) {
        console.error('[useEncrypt]', formatErrorMessage(error));
      }
      
      return undefined;
    } finally {
      setIsEncrypting(false);
    }
  }, [client, options]);

  const encryptBatch = useCallback(async (values: EncryptionValue[]): Promise<EncryptionResult | undefined> => {
    if (!options?.contractAddress || !options?.userAddress) {
      const err = new Error('contractAddress and userAddress are required');
      setError(err);
      options?.onError?.(err);
      return undefined;
    }

    setIsEncrypting(true);
    setError(undefined);

    try {
      const result = await client.encryptBatch(
        options.contractAddress,
        options.userAddress,
        values
      );
      
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      
      if (isFhevmError(error)) {
        console.error('[useEncrypt]', formatErrorMessage(error));
      }
      
      return undefined;
    } finally {
      setIsEncrypting(false);
    }
  }, [client, options]);

  const encryptStruct = useCallback(async <T extends Record<string, EncryptionValue>>(
    struct: T
  ): Promise<{ result: EncryptionResult; fields: (keyof T)[] } | undefined> => {
    if (!options?.contractAddress || !options?.userAddress) {
      const err = new Error('contractAddress and userAddress are required');
      setError(err);
      options?.onError?.(err);
      return undefined;
    }

    setIsEncrypting(true);
    setError(undefined);

    try {
      const result = await client.encryptStruct(
        options.contractAddress,
        options.userAddress,
        struct
      );
      
      setData(result.result);
      options?.onSuccess?.(result.result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options?.onError?.(error);
      
      if (isFhevmError(error)) {
        console.error('[useEncrypt]', formatErrorMessage(error));
      }
      
      return undefined;
    } finally {
      setIsEncrypting(false);
    }
  }, [client, options]);

  return useMemo(() => ({
    encrypt,
    encryptBatch,
    encryptStruct,
    isEncrypting,
    error,
    data,
    reset,
  }), [encrypt, encryptBatch, encryptStruct, isEncrypting, error, data, reset]);
}

/**
 * Simplified hook that doesn't require options upfront
 * Useful when addresses are dynamic
 * 
 * @example
 * ```tsx
 * const { encryptValue } = useEncryptMutation();
 * 
 * const result = await encryptValue({
 *   contractAddress: '0x...',
 *   userAddress: '0x...',
 *   value: { type: 'euint32', value: 42 }
 * });
 * ```
 */
export interface EncryptMutationArgs extends UseEncryptOptions {
  value: EncryptionValue;
}

export function useEncryptMutation() {
  const client = useFhevmClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const encryptValue = useCallback(async (args: EncryptMutationArgs): Promise<EncryptionResult | undefined> => {
    setIsEncrypting(true);
    setError(undefined);

    try {
      const result = await client.encrypt(
        args.contractAddress,
        args.userAddress,
        args.value
      );
      
      args.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      args.onError?.(error);
      return undefined;
    } finally {
      setIsEncrypting(false);
    }
  }, [client]);

  return useMemo(() => ({
    encryptValue,
    isEncrypting,
    error,
  }), [encryptValue, isEncrypting, error]);
}

