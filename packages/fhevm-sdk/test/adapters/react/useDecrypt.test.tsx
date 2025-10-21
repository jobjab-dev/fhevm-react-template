/**
 * useDecrypt hook tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDecrypt, usePublicDecrypt } from '../../../src/adapters/react/useDecrypt';
import { FhevmProvider } from '../../../src/adapters/react/FhevmProvider';
import React from 'react';
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
    <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
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
    expect(result.current.data).toBeUndefined();
  });

  it('should expose decrypt function', () => {
    const { result } = renderHook(
      () => useDecrypt({
        requests: [],
        signature: mockSignature,
      }),
      { wrapper }
    );

    expect(typeof result.current.decrypt).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should handle empty requests', async () => {
    const { result } = renderHook(
      () => useDecrypt({
        requests: [],
        signature: mockSignature,
      }),
      { wrapper }
    );

    const decryptResult = await result.current.decrypt();

    expect(decryptResult).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('No decryption requests');
  });

  it('should call onSuccess callback', () => {
    const onSuccess = vi.fn();

    renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
        onSuccess,
      }),
      { wrapper }
    );

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call onError callback on failure', async () => {
    const onError = vi.fn();

    const { result } = renderHook(
      () => useDecrypt({
        requests: [{ handle: '0xtest', contractAddress: mockSignature.contractAddresses[0] }],
        signature: mockSignature,
        onError,
      }),
      { wrapper }
    );

    await result.current.decrypt();

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
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
    <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
      {children}
    </FhevmProvider>
  );

  it('should initialize correctly', () => {
    const { result } = renderHook(
      () => usePublicDecrypt({
        handle: '0xtest',
        contractAddress: '0x0000000000000000000000000000000000000000',
      }),
      { wrapper }
    );

    expect(result.current.isDecrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeUndefined();
  });

  it('should expose decrypt function', () => {
    const { result } = renderHook(
      () => usePublicDecrypt({
        handle: '0xtest',
        contractAddress: '0x0000000000000000000000000000000000000000',
      }),
      { wrapper }
    );

    expect(typeof result.current.decrypt).toBe('function');
  });

  it('should handle missing parameters', async () => {
    const { result } = renderHook(
      () => usePublicDecrypt({
        handle: '',
        contractAddress: '0x0000000000000000000000000000000000000000',
      }),
      { wrapper }
    );

    const decryptResult = await result.current.decrypt();

    expect(decryptResult).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });
});

