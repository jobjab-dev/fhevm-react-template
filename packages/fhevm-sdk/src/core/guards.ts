/**
 * Type Guards and Runtime Checks
 * 
 * Safe type checking utilities for runtime validation
 */

import type { 
  FhevmInstance, 
  EncryptionValue, 
  EncryptionResult, 
  DecryptionSignature,
  FheType,
  NetworkConfig 
} from './types';

/**
 * Check if value is a valid FhevmInstance
 */
export function isFhevmInstance(value: any): value is FhevmInstance {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.createEncryptedInput === 'function'
  );
}

/**
 * Check if value is a valid EncryptionValue
 */
export function isEncryptionValue(value: any): value is EncryptionValue {
  if (!value || typeof value !== 'object') return false;
  if (!('type' in value)) return false;
  if (!('value' in value)) return false;
  if (typeof value.type !== 'string') return false;
  return true;
}

/**
 * Check if value is a valid EncryptionResult
 */
export function isEncryptionResult(value: any): value is EncryptionResult {
  if (!value || typeof value !== 'object') return false;
  if (!('handles' in value)) return false;
  if (!('inputProof' in value)) return false;
  if (!Array.isArray(value.handles)) return false;
  if (!(value.inputProof instanceof Uint8Array)) return false;
  return true;
}

/**
 * Check if value is a valid DecryptionSignature
 */
export function isDecryptionSignature(value: any): value is DecryptionSignature {
  return (
    value &&
    typeof value === 'object' &&
    'publicKey' in value &&
    'privateKey' in value &&
    'signature' in value &&
    'startTimestamp' in value &&
    'durationDays' in value &&
    'userAddress' in value &&
    'contractAddresses' in value &&
    Array.isArray(value.contractAddresses)
  );
}

/**
 * Check if value is an Ethereum address
 */
export function isAddress(value: any): value is `0x${string}` {
  return (
    typeof value === 'string' &&
    /^0x[0-9a-fA-F]{40}$/.test(value)
  );
}

/**
 * Check if value is a ciphertext handle (also in contract.ts for compatibility)
 */
export function isCiphertextHandle(value: any): boolean {
  return (
    typeof value === 'string' &&
    value.startsWith('0x') &&
    value.length > 10 &&
    /^0x[0-9a-fA-F]+$/.test(value)
  );
}

/**
 * Check if value is a hex string
 */
export function isHexString(value: any): value is `0x${string}` {
  return (
    typeof value === 'string' &&
    /^0x[0-9a-fA-F]*$/.test(value)
  );
}

/**
 * Check if value is a boolean-like value
 */
export function isBooleanLike(value: any): boolean {
  return (
    typeof value === 'boolean' ||
    value === 'true' ||
    value === 'false' ||
    value === 1 ||
    value === 0 ||
    value === '1' ||
    value === '0'
  );
}

/**
 * Convert boolean-like value to actual boolean
 */
export function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  throw new Error(`Cannot convert ${value} to boolean`);
}

/**
 * Check if number is safe integer
 */
export function isSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value);
}

/**
 * Check if value is within uint8 range
 */
export function isUint8(value: number | bigint): boolean {
  const num = typeof value === 'bigint' ? value : BigInt(value);
  return num >= 0n && num <= 255n;
}

/**
 * Check if value is within uint16 range
 */
export function isUint16(value: number | bigint): boolean {
  const num = typeof value === 'bigint' ? value : BigInt(value);
  return num >= 0n && num <= 65535n;
}

/**
 * Check if value is within uint32 range
 */
export function isUint32(value: number | bigint): boolean {
  const num = typeof value === 'bigint' ? value : BigInt(value);
  return num >= 0n && num <= 4294967295n;
}

/**
 * Check if NetworkConfig is valid
 */
export function isNetworkConfig(value: any): value is NetworkConfig {
  if (!value || typeof value !== 'object') return false;
  if (!('chainId' in value)) return false;
  if (!('name' in value)) return false;
  if (typeof value.chainId !== 'number') return false;
  if (typeof value.name !== 'string') return false;
  return true;
}

/**
 * Assert value is defined (TypeScript narrowing)
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message: string = 'Value is required'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Assert condition is true
 */
export function assertTrue(
  condition: boolean,
  message: string = 'Assertion failed'
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

