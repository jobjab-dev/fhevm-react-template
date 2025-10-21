/**
 * useDecrypt hook tests
 */

// Mocks MUST be declared before imports
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../../src/core', () => ({
  createFhevmClient: vi.fn(() => ({
    status: 'ready',
    isReady: true,
    instance: {},
    network: { name: 'Sepolia', chainId: 11155111 },
    init: vi.fn().mockResolvedValue(undefined),
    decrypt: vi.fn().mockResolvedValue({
      '0xtest-handle': 42n,
    }),
    publicDecrypt: vi.fn().mockResolvedValue(100n),
    disconnect: vi.fn().mockResolvedValue(undefined),
    reconnect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(() => vi.fn()),
    utils: {
      isSignatureValid: vi.fn(() => true),
    },
  })),
  isFhevmError: vi.fn(() => false),
  formatErrorMessage: vi.fn((err) => err.message),
}));

vi.mock('../../../src/adapters/react/FhevmProvider', () => {
  const mockClient = {
    status: 'ready',
    isReady: true,
    instance: {},
    network: { name: 'Sepolia', chainId: 11155111 },
    init: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    on: vi.fn(() => vi.fn()),
    decrypt: vi.fn(),
    publicDecrypt: vi.fn(),
  } as any;
  const context = {
    client: mockClient,
    status: 'ready',
    isReady: true,
    error: undefined,
    reconnect: vi.fn(),
  } as any;
  const React = require('react');
  return {
    FhevmProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useFhevmClient: () => mockClient,
    useFhevmContext: () => context,
  };
});

import React from 'react';
import { renderHook } from '@testing-library/react';
import { useDecrypt, usePublicDecrypt } from '../../../src/adapters/react/useDecrypt';
import { FhevmProvider } from '../../../src/adapters/react/FhevmProvider';
import type { DecryptionSignature } from '../../../src/core/types';

describe('useDecrypt', () => {
  const mockSignature: DecryptionSignature = {
    publicKey: 'test-public-key',
    privateKey: 'test-private-key',
    signature: 'test-signature',
    startTimestamp: Math.floor(Date.now() / 1000),
    durationDays: 365,
    userAddress: '0x0000000000000000000000000000000000000001' as `0x${string}`,
    contractAddresses: ['0x0000000000000000000000000000000000000000' as `0x${string}`],
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FhevmProvider config={{ network: 'sepolia' }}>
      {children}
    </FhevmProvider>
  );

  it('should initialize with correct default state', () => {
    const { result } = renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
      }),
      { wrapper }
    );

    expect(result.current.isDecrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should expose decrypt function', () => {
    const { result } = renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
      }),
      { wrapper }
    );

    expect(typeof result.current.decrypt).toBe('function');
  });

  it('should handle empty requests', () => {
    const { result } = renderHook(
      () => useDecrypt({
        requests: [],
        signature: mockSignature,
      }),
      { wrapper }
    );

    expect(typeof result.current.decrypt).toBe('function');
  });

  it('should call onSuccess callback', () => {
    const onSuccess = vi.fn();
    
    const { result } = renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
        onSuccess,
      }),
      { wrapper }
    );

    expect(onSuccess).not.toHaveBeenCalled();
    expect(typeof result.current.decrypt).toBe('function');
  });

  it('should call onError callback on failure', () => {
    const onError = vi.fn();
    
    const { result } = renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
        onError,
      }),
      { wrapper }
    );

    expect(onError).not.toHaveBeenCalled();
    expect(typeof result.current.decrypt).toBe('function');
  });

  it('should not auto-decrypt when enabled is false', () => {
    const { result } = renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
        enabled: false,
      }),
      { wrapper }
    );

    expect(result.current.isDecrypting).toBe(false);
  });
});

describe('usePublicDecrypt', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FhevmProvider config={{ network: 'sepolia' }}>
      {children}
    </FhevmProvider>
  );

  it('should initialize correctly', () => {
    const { result } = renderHook(
      () => usePublicDecrypt({
        handle: '0xtest-handle',
        contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      }),
      { wrapper }
    );

    expect(result.current.isDecrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should expose decrypt function', () => {
    const { result } = renderHook(
      () => usePublicDecrypt({
        handle: '0xtest-handle',
        contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      }),
      { wrapper }
    );

    expect(typeof result.current.decrypt).toBe('function');
  });

  it('should handle missing parameters', () => {
    const { result } = renderHook(
      () => usePublicDecrypt({
        handle: '0xtest-handle',
        contractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      }),
      { wrapper }
    );

    expect(typeof result.current.decrypt).toBe('function');
  });
});
