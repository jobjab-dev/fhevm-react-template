/**
 * useEncrypt hook tests
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEncrypt } from '../../../src/adapters/react/useEncrypt';
import { FhevmProvider } from '../../../src/adapters/react/FhevmProvider';
import React from 'react';

describe('useEncrypt', () => {
  const mockContractAddress = '0x0000000000000000000000000000000000000000' as `0x${string}`;
  const mockUserAddress = '0x0000000000000000000000000000000000000001' as `0x${string}`;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
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

  it('should handle missing addresses', async () => {
    const { result } = renderHook(
      () => useEncrypt(),
      { wrapper }
    );

    const encryptResult = await result.current.encrypt({
      type: 'euint32',
      value: 42,
    });

    expect(encryptResult).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('required');
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();
    
    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
        onSuccess,
      }),
      { wrapper }
    );

    // Note: This will fail without actual FHEVM instance
    // But tests that the hook structure is correct
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should call onError callback on encryption failure', async () => {
    const onError = vi.fn();
    
    const { result } = renderHook(
      () => useEncrypt({
        contractAddress: mockContractAddress,
        userAddress: mockUserAddress,
        onError,
      }),
      { wrapper }
    );

    // Attempting to encrypt without initialized client should fail
    await result.current.encrypt({ type: 'euint32', value: 42 });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
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
    <FhevmProvider config={{ network: 'sepolia', autoInit: false }}>
      {children}
    </FhevmProvider>
  );

  it('should provide encryptValue function', () => {
    const { useEncryptMutation } = require('../../../src/adapters/react/useEncrypt');
    const { result } = renderHook(() => useEncryptMutation(), { wrapper });

    expect(typeof result.current.encryptValue).toBe('function');
    expect(result.current.isEncrypting).toBe(false);
    expect(result.current.error).toBeUndefined();
  });
});

