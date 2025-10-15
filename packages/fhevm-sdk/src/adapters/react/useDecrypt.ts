/**
 * useDecrypt - React Hook for Decryption
 * 
 * Wagmi-like decryption hook with EIP-712 signature management
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const { decrypt, isDecrypting, data } = useDecrypt({
 *     requests: [{ handle: '0x...', contractAddress: '0x...' }],
 *     signature: mySignature,
 *   });
 *   
 *   useEffect(() => {
 *     decrypt();
 *   }, []);
 * }
 * ```
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useFhevmClient } from './FhevmProvider';
import type { DecryptionRequest, DecryptionResult, DecryptionSignature } from '../../core';
import { isFhevmError, formatErrorMessage } from '../../core';

export interface UseDecryptOptions {
  requests: DecryptionRequest[];
  signature: DecryptionSignature;
  
  // Auto-decrypt on mount or when params change
  enabled?: boolean;
  
  // Optional callbacks
  onSuccess?: (result: DecryptionResult) => void;
  onError?: (error: Error) => void;
}

export interface UseDecryptReturn {
  decrypt: () => Promise<DecryptionResult | undefined>;
  isDecrypting: boolean;
  error: Error | undefined;
  data: DecryptionResult | undefined;
  reset: () => void;
}

export function useDecrypt(options: UseDecryptOptions): UseDecryptReturn {
  const client = useFhevmClient();
  const { requests, signature, enabled = false, onSuccess, onError } = options;
  
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<DecryptionResult | undefined>(undefined);

  const reset = useCallback(() => {
    setIsDecrypting(false);
    setError(undefined);
    setData(undefined);
  }, []);

  const decrypt = useCallback(async (): Promise<DecryptionResult | undefined> => {
    if (!requests || requests.length === 0) {
      const err = new Error('No decryption requests provided');
      setError(err);
      onError?.(err);
      return undefined;
    }

    if (!signature) {
      const err = new Error('Decryption signature required');
      setError(err);
      onError?.(err);
      return undefined;
    }

    setIsDecrypting(true);
    setError(undefined);

    try {
      const result = await client.decrypt(requests, signature);
      
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      
      if (isFhevmError(error)) {
        console.error('[useDecrypt]', formatErrorMessage(error));
      }
      
      return undefined;
    } finally {
      setIsDecrypting(false);
    }
  }, [client, requests, signature, onSuccess, onError]);

  // Auto-decrypt if enabled
  useEffect(() => {
    if (enabled && requests && signature && !isDecrypting) {
      decrypt();
    }
  }, [enabled, requests, signature, decrypt, isDecrypting]);

  return useMemo(() => ({
    decrypt,
    isDecrypting,
    error,
    data,
    reset,
  }), [decrypt, isDecrypting, error, data, reset]);
}

/**
 * Hook for public decryption (no signature required)
 * 
 * @example
 * ```tsx
 * const { decrypt, data } = usePublicDecrypt({
 *   handle: '0x...',
 *   contractAddress: '0x...',
 * });
 * ```
 */
export interface UsePublicDecryptOptions {
  handle: string;
  contractAddress: `0x${string}`;
  enabled?: boolean;
  onSuccess?: (result: bigint | boolean | string) => void;
  onError?: (error: Error) => void;
}

export function usePublicDecrypt(options: UsePublicDecryptOptions) {
  const client = useFhevmClient();
  const { handle, contractAddress, enabled = false, onSuccess, onError } = options;
  
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<bigint | boolean | string | undefined>(undefined);

  const decrypt = useCallback(async () => {
    if (!handle || !contractAddress) {
      const err = new Error('handle and contractAddress are required');
      setError(err);
      onError?.(err);
      return undefined;
    }

    setIsDecrypting(true);
    setError(undefined);

    try {
      const result = await client.publicDecrypt(handle, contractAddress);
      
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      
      if (isFhevmError(error)) {
        console.error('[usePublicDecrypt]', formatErrorMessage(error));
      }
      
      return undefined;
    } finally {
      setIsDecrypting(false);
    }
  }, [client, handle, contractAddress, onSuccess, onError]);

  // Auto-decrypt if enabled
  useEffect(() => {
    if (enabled && handle && contractAddress && !isDecrypting) {
      decrypt();
    }
  }, [enabled, handle, contractAddress, decrypt, isDecrypting]);

  return useMemo(() => ({
    decrypt,
    isDecrypting,
    error,
    data,
  }), [decrypt, isDecrypting, error, data]);
}

/**
 * Hook for managing decryption signature
 * Handles EIP-712 signing with wallet
 * 
 * @example
 * ```tsx
 * const { signature, sign, isValid } = useDecryptionSignature({
 *   contractAddresses: ['0x...'],
 *   signer: ethersSigner,
 * });
 * ```
 */
export interface UseDecryptionSignatureOptions {
  contractAddresses: `0x${string}`[];
  signer: any; // ethers signer
  storage?: any; // Storage for caching
  durationDays?: number;
  onSuccess?: (signature: DecryptionSignature) => void;
  onError?: (error: Error) => void;
}

export function useDecryptionSignature(options: UseDecryptionSignatureOptions) {
  const client = useFhevmClient();
  const { contractAddresses, signer, durationDays = 365, onSuccess, onError } = options;
  
  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState<DecryptionSignature | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);

  const sign = useCallback(async (): Promise<DecryptionSignature | undefined> => {
    if (!signer) {
      const err = new Error('Signer is required');
      setError(err);
      onError?.(err);
      return undefined;
    }

    setIsSigning(true);
    setError(undefined);

    try {
      // Generate keypair
      const keypair = client.generateKeypair();
      
      // Create EIP-712 message
      const startTimestamp = Math.floor(Date.now() / 1000);
      const eip712 = client.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays
      );

      // Sign with wallet
      const signatureString = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      const userAddress = await signer.getAddress();

      const sig: DecryptionSignature = {
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
        signature: signatureString.replace('0x', ''),
        startTimestamp,
        durationDays,
        userAddress: userAddress as `0x${string}`,
        contractAddresses,
      };

      setSignature(sig);
      onSuccess?.(sig);
      return sig;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      return undefined;
    } finally {
      setIsSigning(false);
    }
  }, [client, contractAddresses, signer, durationDays, onSuccess, onError]);

  const isValid = useMemo(() => {
    if (!signature) return false;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = signature.startTimestamp + signature.durationDays * 24 * 60 * 60;
    return now < expiresAt;
  }, [signature]);

  return useMemo(() => ({
    signature,
    sign,
    isSigning,
    isValid,
    error,
  }), [signature, sign, isSigning, isValid, error]);
}

