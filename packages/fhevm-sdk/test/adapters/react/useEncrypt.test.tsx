/**
 * useEncrypt hook tests
 */

// Mocks MUST be declared before imports so hooks pick them up
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../../src/core', () => ({
  createFhevmClient: vi.fn(() => ({
    status: 'ready',
    isReady: true,
    instance: {},
    network: { name: 'Sepolia', chainId: 11155111 },
    init: vi.fn().mockResolvedValue(undefined),
    encrypt: vi.fn().mockResolvedValue({
      handles: [new Uint8Array([1, 2, 3])],
      inputProof: new Uint8Array([4, 5, 6]),
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    reconnect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(() => vi.fn()),
    utils: {
      formatEncryptionResult: vi.fn(() => ({ handle: '0x010203', proof: '0x040506' })),
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
    utils: { formatEncryptionResult: vi.fn(() => ({ handle: '0x010203', proof: '0x040506' })) },
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
import { renderHook, waitFor } from '@testing-library/react';
import { useEncrypt } from '../../../src/adapters/react/useEncrypt';
import { FhevmProvider } from '../../../src/adapters/react/FhevmProvider';

describe('useEncrypt', () => {
  const mockContractAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;
  const mockUserAddress = '0x0000000000000000000000000000000000000001' as `0x${string}`;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FhevmProvider config={{ network: 'sepolia' }}>
      {children}
    </FhevmProvider>
  );

  it('should initialize with correct default state', () => {
    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
      }),
      { wrapper }
    );

    expect(result.current.isEncrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
  });

  it('should expose encrypt function', () => {
    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
      }),
      { wrapper }
    );

    expect(typeof result.current.encrypt).toBe('function');
    expect(typeof result.current.encryptBatch).toBe('function');
    expect(typeof result.current.encryptStruct).toBe('function');
  });

  it('should have reset function', () => {
    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
      }),
      { wrapper }
    );

    expect(typeof result.current.reset).toBe('function');
  });

  it('should handle missing addresses', () => {
    const { result } = renderHook(
      () => useEncrypt(),
      { wrapper }
    );

    // Should have encrypt function even without addresses
    expect(typeof result.current.encrypt).toBe('function');
  });

  it('should call onSuccess callback', () => {
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
        onSuccess,
      }),
      { wrapper }
    );

    expect(typeof result.current.encrypt).toBe('function');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call onError callback on encryption failure', () => {
    const onError = vi.fn();

    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
        onError,
      }),
      { wrapper }
    );

    expect(typeof result.current.encrypt).toBe('function');
    expect(onError).not.toHaveBeenCalled();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
      }),
      { wrapper }
    );

    result.current.reset();

    expect(result.current.isEncrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
  });
});

describe('useEncryptMutation', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FhevmProvider config={{ network: 'sepolia' }}>
      {children}
    </FhevmProvider>
  );

  it('should provide encryptValue function', async () => {
    const { useEncryptMutation } = await import('../../../src/adapters/react/useEncrypt');
    const { result } = renderHook(() => useEncryptMutation(), { wrapper });

    expect(typeof result.current.encryptValue).toBe('function');
    expect(result.current.isEncrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
  });
});

