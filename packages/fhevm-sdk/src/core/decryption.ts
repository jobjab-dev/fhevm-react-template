/**
 * FHEVM Decryption Utilities
 * Framework-agnostic decryption functions
 */

import type { FhevmInstance, DecryptionRequest, DecryptionResult, DecryptionSignature } from './types';
import { createDecryptionError, FhevmErrorCode, createInitError } from './errors';

/**
 * User Decryption (with EIP-712 signature)
 * 
 * Securely decrypt ciphertext by re-encrypting it under the user's public key.
 * Requires EIP-712 signature from the user's wallet.
 */
export async function userDecrypt(
  instance: FhevmInstance,
  requests: DecryptionRequest[],
  signature: DecryptionSignature
): Promise<DecryptionResult> {
  if (!instance) {
    throw createInitError(
      FhevmErrorCode.INIT_FAILED,
      'FHEVM instance not initialized',
      'Call createFhevmClient() or wait for initialization to complete'
    );
  }

  if (!requests || requests.length === 0) {
    throw createDecryptionError('No decryption requests provided', { count: 0 });
  }

  if (!signature) {
    throw createDecryptionError(
      'Decryption signature required',
      undefined,
      new Error(FhevmErrorCode.SIGNATURE_REQUIRED)
    );
  }

  // Validate signature
  if (!isSignatureValid(signature)) {
    throw createDecryptionError(
      'Decryption signature has expired',
      {
        expiresAt: signature.startTimestamp + signature.durationDays * 24 * 60 * 60,
        now: Math.floor(Date.now() / 1000),
      },
      new Error(FhevmErrorCode.SIGNATURE_EXPIRED)
    );
  }

  try {
    // Convert requests to handle-contract pairs
    const handleContractPairs = requests.map(req => ({
      handle: req.handle,
      contractAddress: req.contractAddress,
    }));

    // Call userDecrypt on the instance
    const result = await (instance as any).userDecrypt(
      handleContractPairs,
      signature.privateKey,
      signature.publicKey,
      signature.signature.replace('0x', ''),
      signature.contractAddresses,
      signature.userAddress,
      signature.startTimestamp.toString(),
      signature.durationDays.toString()
    );

    return result as DecryptionResult;
  } catch (error) {
    if (error instanceof Error && error.name === 'FhevmError') {
      throw error;
    }
    
    // Handle specific decryption errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('ACL') || errorMessage.includes('permission')) {
      throw createDecryptionError(
        'Access denied: You do not have permission to decrypt this value',
        { requests },
        error
      );
    }
    
    if (errorMessage.includes('signature')) {
      throw createDecryptionError(
        'Invalid or expired signature',
        { signature: signature.signature },
        error
      );
    }

    throw createDecryptionError(
      `Failed to decrypt ${requests.length} value(s)`,
      { count: requests.length },
      error
    );
  }
}

/**
 * Public Decryption
 * 
 * Decrypt publicly visible ciphertext (no signature required).
 * Only works for ciphertexts that have been explicitly made public.
 */
export async function publicDecrypt(
  instance: FhevmInstance,
  handle: string,
  contractAddress: `0x${string}`
): Promise<bigint | boolean | string> {
  if (!instance) {
    throw createInitError(
      FhevmErrorCode.INIT_FAILED,
      'FHEVM instance not initialized',
      'Call createFhevmClient() or wait for initialization to complete'
    );
  }

  if (!handle || handle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    throw createDecryptionError(
      'Invalid ciphertext handle',
      { handle }
    );
  }

  try {
    // Call publicDecrypt on the instance
    const result = await (instance as any).publicDecrypt(handle, contractAddress);
    return result;
  } catch (error) {
    throw createDecryptionError(
      'Failed to publicly decrypt value',
      { handle, contractAddress },
      error
    );
  }
}

/**
 * Generate a new keypair for decryption
 */
export function generateDecryptionKeypair(instance: FhevmInstance): {
  publicKey: string;
  privateKey: string;
} {
  if (!instance) {
    throw createInitError(
      FhevmErrorCode.INIT_FAILED,
      'FHEVM instance not initialized'
    );
  }

  try {
    return (instance as any).generateKeypair();
  } catch (error) {
    throw createDecryptionError(
      'Failed to generate decryption keypair',
      undefined,
      error
    );
  }
}

/**
 * Create EIP-712 message for decryption signature
 */
export function createDecryptionEIP712(
  instance: FhevmInstance,
  publicKey: string,
  contractAddresses: `0x${string}`[],
  startTimestamp?: number,
  durationDays?: number
): any {
  if (!instance) {
    throw createInitError(
      FhevmErrorCode.INIT_FAILED,
      'FHEVM instance not initialized'
    );
  }

  const timestamp = startTimestamp ?? Math.floor(Date.now() / 1000);
  const duration = durationDays ?? 365;

  try {
    return (instance as any).createEIP712(
      publicKey,
      contractAddresses,
      timestamp,
      duration
    );
  } catch (error) {
    throw createDecryptionError(
      'Failed to create EIP-712 message for decryption',
      { publicKey, contractAddresses, startTimestamp: timestamp, durationDays: duration },
      error
    );
  }
}

/**
 * Check if a decryption signature is still valid
 */
export function isSignatureValid(signature: DecryptionSignature): boolean {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = signature.startTimestamp + signature.durationDays * 24 * 60 * 60;
  return now < expiresAt;
}

/**
 * Get remaining validity time for a signature (in seconds)
 */
export function getSignatureRemainingTime(signature: DecryptionSignature): number {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = signature.startTimestamp + signature.durationDays * 24 * 60 * 60;
  return Math.max(0, expiresAt - now);
}

/**
 * Batch decrypt multiple handles with a single signature
 */
export async function batchDecrypt(
  instance: FhevmInstance,
  handles: string[],
  contractAddress: `0x${string}`,
  signature: DecryptionSignature
): Promise<DecryptionResult> {
  const requests: DecryptionRequest[] = handles.map(handle => ({
    handle,
    contractAddress,
  }));

  return userDecrypt(instance, requests, signature);
}

/**
 * Helper: Extract decrypted value by handle from result
 */
export function getDecryptedValue(
  result: DecryptionResult,
  handle: string
): string | bigint | boolean | undefined {
  return result[handle];
}

/**
 * Helper: Check if all requested values were successfully decrypted
 */
export function areAllDecrypted(
  result: DecryptionResult,
  handles: string[]
): boolean {
  return handles.every(handle => handle in result);
}

