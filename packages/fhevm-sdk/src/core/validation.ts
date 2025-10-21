/**
 * Validation Utilities
 * 
 * Comprehensive validation functions for FHEVM operations
 */

import { createEncryptionError, createInitError, FhevmErrorCode } from './errors';
import type { FheType } from './types';

/**
 * Validates Ethereum address format
 */
export function validateAddress(address: string, name: string = 'Address'): void {
  if (!address || typeof address !== 'string') {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} is required and must be a string`,
      `Provide a valid Ethereum address (0x...)`
    );
  }

  if (!address.startsWith('0x')) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} must start with '0x' prefix`,
      `Add 0x prefix: 0x${address}`
    );
  }

  if (address.length !== 42) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} must be 42 characters (0x + 40 hex chars), got ${address.length}`,
      `Ethereum addresses are 20 bytes = 40 hex characters`
    );
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} contains invalid characters`,
      `Only hex characters (0-9, a-f, A-F) allowed after 0x`
    );
  }

  // Check for zero address
  if (address === '0x0000000000000000000000000000000000000000') {
    console.warn(`Warning: ${name} is the zero address. This might be intentional for testing.`);
  }
}

/**
 * Validates ciphertext handle
 */
export function validateHandle(handle: string, allowEmpty: boolean = false): void {
  if (!handle && !allowEmpty) {
    throw createEncryptionError(
      'Ciphertext handle is required',
      { handle }
    );
  }

  if (handle && typeof handle !== 'string') {
    throw createEncryptionError(
      `Handle must be a string, got ${typeof handle}`,
      { handle, type: typeof handle }
    );
  }

  if (handle && !handle.startsWith('0x')) {
    throw createEncryptionError(
      'Handle must be a hex string starting with 0x',
      { handle, hint: 'Add 0x prefix to your handle' }
    );
  }

  // Check for zero handle (often indicates uninitialized value)
  if (handle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    throw createEncryptionError(
      'Cannot decrypt zero handle (uninitialized encrypted value)',
      { 
        handle,
        hint: 'Make sure the encrypted value has been properly initialized in the contract'
      }
    );
  }
}

/**
 * Validates FHE type
 */
export function validateFheType(type: string): type is FheType {
  const validTypes: FheType[] = [
    'ebool',
    'euint8', 'euint16', 'euint32', 'euint64', 'euint128', 'euint256',
    'eaddress',
    'ebytes64', 'ebytes128', 'ebytes256',
  ];

  if (!validTypes.includes(type as FheType)) {
    throw createEncryptionError(
      `Invalid FHE type: ${type}`,
      {
        type,
        validTypes: validTypes.join(', '),
        hint: `Choose one of: ${validTypes.join(', ')}`
      }
    );
  }

  return true;
}

/**
 * Validates numeric value for uint types
 */
export function validateUintValue(type: FheType, value: number | bigint): void {
  const numVal = typeof value === 'bigint' ? value : BigInt(value);
  const bits = parseInt(type.replace('euint', ''));
  const maxValue = (1n << BigInt(bits)) - 1n;

  if (numVal < 0n) {
    throw createEncryptionError(
      `${type} value must be non-negative`,
      {
        type,
        value: value.toString(),
        min: '0',
        hint: 'Unsigned integers cannot be negative'
      }
    );
  }

  if (numVal > maxValue) {
    throw createEncryptionError(
      `${type} value ${numVal} exceeds maximum ${maxValue}`,
      {
        type,
        value: numVal.toString(),
        max: maxValue.toString(),
        bits,
        hint: `${type} can hold values from 0 to ${maxValue} (${bits} bits)`
      }
    );
  }
}

/**
 * Validates array is not empty
 */
export function validateNonEmptyArray<T>(arr: T[], name: string = 'Array'): void {
  if (!arr || !Array.isArray(arr)) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} must be an array, got ${typeof arr}`,
      `Provide a valid array for ${name}`
    );
  }

  if (arr.length === 0) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} cannot be empty`,
      `Provide at least one item in ${name}`
    );
  }
}

/**
 * Validates object is not null/undefined
 */
export function validateRequired<T>(value: T | null | undefined, name: string): T {
  if (value === null || value === undefined) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} is required but was ${value}`,
      `Provide a valid ${name}`
    );
  }
  return value;
}

/**
 * Validates number is within range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  name: string = 'Value'
): void {
  if (typeof value !== 'number' || isNaN(value)) {
    const error = createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} must be a valid number`
    );
    (error as any).context = { value, type: typeof value };
    throw error;
  }

  if (value < min || value > max) {
    const error = createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} ${value} is out of range [${min}, ${max}]`
    );
    (error as any).context = { value, min, max, hint: `Choose a value between ${min} and ${max}` };
    throw error;
  }
}

/**
 * Validates timestamp
 */
export function validateTimestamp(timestamp: number, name: string = 'Timestamp'): void {
  if (!Number.isInteger(timestamp)) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} must be an integer: ${timestamp}`,
      'Use Math.floor(Date.now() / 1000)'
    );
  }

  if (timestamp < 0) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `${name} cannot be negative: ${timestamp}`,
      'Provide a valid Unix timestamp (seconds since epoch)'
    );
  }

  // Warn if timestamp is too far in the future
  const now = Math.floor(Date.now() / 1000);
  const oneYearFromNow = now + (365 * 24 * 60 * 60);

  if (timestamp > oneYearFromNow) {
    console.warn(
      `Warning: ${name} is more than 1 year in the future. ` +
      `This might be a mistake. Timestamp: ${timestamp}, Now: ${now}`
    );
  }
}

/**
 * Safe parseInt with validation
 */
export function safeParseInt(value: string, name: string = 'Value'): number {
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw createInitError(
      FhevmErrorCode.INVALID_ARGUMENT,
      `Cannot parse ${name} as integer: ${value}`,
      'Provide a valid integer string'
    );
  }

  return parsed;
}

/**
 * Safe BigInt conversion with validation
 */
export function safeBigInt(value: string | number | bigint, name: string = 'Value'): bigint {
  try {
    return BigInt(value);
  } catch (error) {
    throw createEncryptionError(
      `Cannot convert ${name} to BigInt: ${value}`,
      { value, type: typeof value, hint: 'Provide a valid number, bigint, or numeric string' }
    );
  }
}

