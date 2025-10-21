/**
 * FHEVM Encryption Utilities
 * Framework-agnostic encryption functions
 */

import type { FhevmInstance } from './types';
import type { EncryptionValue, EncryptionResult, FheType } from './types';
import { createEncryptionError, FhevmErrorCode, createInitError } from './errors';

/**
 * Maps FheType to RelayerEncryptedInput method name
 */
export function getEncryptionMethod(type: FheType): string {
  const methodMap: Record<FheType, string> = {
    'ebool': 'addBool',
    'euint8': 'add8',
    'euint16': 'add16',
    'euint32': 'add32',
    'euint64': 'add64',
    'euint128': 'add128',
    'euint256': 'add256',
    'eaddress': 'addAddress',
    'ebytes64': 'addBytes64',
    'ebytes128': 'addBytes128',
    'ebytes256': 'addBytes256',
  };

  if (!(type in methodMap)) {
    throw createEncryptionError(
      `Unsupported FHE type: ${type}`,
      { type }
    );
  }

  return methodMap[type];
}

/**
 * Maps external type string to FheType
 */
export function externalTypeToFheType(externalType: string): FheType {
  const typeMap: Record<string, FheType> = {
    'externalEbool': 'ebool',
    'externalEuint8': 'euint8',
    'externalEuint16': 'euint16',
    'externalEuint32': 'euint32',
    'externalEuint64': 'euint64',
    'externalEuint128': 'euint128',
    'externalEuint256': 'euint256',
    'externalEaddress': 'eaddress',
    'externalEbytes64': 'ebytes64',
    'externalEbytes128': 'ebytes128',
    'externalEbytes256': 'ebytes256',
  };

  if (externalType in typeMap) {
    return typeMap[externalType];
  }

  // Default to euint64 for unknown types (backward compatibility)
  console.warn(`Unknown external type: ${externalType}, defaulting to euint64`);
  return 'euint64';
}

/**
 * Validates encryption value with comprehensive checks
 */
export function validateEncryptionValue(value: EncryptionValue): void {
  if (!value || typeof value !== 'object') {
    throw createEncryptionError(
      'Invalid encryption value: must be an object with type and value',
      { value }
    );
  }

  const { type, value: val } = value;

  if (!type) {
    throw createEncryptionError(
      'Missing FHE type in encryption value',
      { value }
    );
  }

  if (val === null || val === undefined) {
    throw createEncryptionError(
      `Value cannot be null or undefined for ${type}`,
      { type, value: val }
    );
  }

  // Type-specific validation
  switch (type) {
    case 'ebool':
      if (typeof val !== 'boolean') {
        throw createEncryptionError(
          `Type mismatch: expected boolean for ${type}, got ${typeof val}`,
          { type, value: val }
        );
      }
      break;

    case 'euint8':
    case 'euint16':
    case 'euint32':
    case 'euint64':
    case 'euint128':
    case 'euint256': {
      const numVal = typeof val === 'bigint' ? val : BigInt(val);
      const maxBits = parseInt(type.replace('euint', ''));
      const maxValue = (1n << BigInt(maxBits)) - 1n;
      
      if (numVal < 0n) {
        throw createEncryptionError(
          `Value must be non-negative for ${type}`,
          { type, value: val }
        );
      }
      
      if (numVal > maxValue) {
        throw createEncryptionError(
          `Value exceeds maximum for ${type}: ${maxValue}`,
          { type, value: val, max: maxValue.toString() }
        );
      }
      break;
    }

    case 'eaddress':
      if (typeof val !== 'string') {
        throw createEncryptionError(
          `Expected string for ${type}, got ${typeof val}`,
          { type, value: val }
        );
      }
      if (!val.match(/^0x[0-9a-fA-F]{40}$/)) {
        throw createEncryptionError(
          `Invalid Ethereum address format for ${type}. Expected 0x followed by 40 hex characters.`,
          { 
            type, 
            value: val,
            expected: '0x + 40 hex chars (e.g., 0x1234...abcd)',
            got: val
          }
        );
      }
      break;

    case 'ebytes64':
    case 'ebytes128':
    case 'ebytes256': {
      if (typeof val !== 'string') {
        throw createEncryptionError(
          `Expected hex string for ${type}, got ${typeof val}`,
          { type, value: val }
        );
      }
      if (!val.startsWith('0x')) {
        throw createEncryptionError(
          `${type} value must start with '0x' prefix`,
          { type, value: val, hint: 'Add 0x prefix to your hex string' }
        );
      }
      const hexValue = val.replace('0x', '');
      if (!/^[0-9a-fA-F]*$/.test(hexValue)) {
        throw createEncryptionError(
          `Invalid hex characters in ${type} value`,
          { type, value: val, hint: 'Only 0-9 and a-f characters allowed after 0x' }
        );
      }
      const expectedBytes = parseInt(type.replace('ebytes', ''));
      const actualBytes = hexValue.length / 2;
      if (actualBytes !== expectedBytes) {
        throw createEncryptionError(
          `Invalid byte length for ${type}: expected ${expectedBytes} bytes (${expectedBytes * 2} hex chars), got ${actualBytes} bytes (${hexValue.length} hex chars)`,
          { 
            type, 
            expected: `${expectedBytes} bytes`,
            actual: `${actualBytes} bytes`,
            hint: `Your hex string should be ${expectedBytes * 2} characters long after 0x`
          }
        );
      }
      break;
    }

    default:
      throw createEncryptionError(
        `Unknown FHE type: ${type}`,
        { type }
      );
  }
}

/**
 * Encrypts a single value
 */
export async function encryptScalar(
  instance: FhevmInstance,
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  value: EncryptionValue
): Promise<EncryptionResult> {
  if (!instance) {
    throw createInitError(
      FhevmErrorCode.INIT_FAILED,
      'FHEVM instance not initialized',
      'Call createFhevmClient() or wait for initialization to complete'
    );
  }

  // Validate input
  validateEncryptionValue(value);

  try {
    // Create encrypted input builder
    const input = (instance as any).createEncryptedInput(contractAddress, userAddress);
    
    // Get the appropriate method
    const method = getEncryptionMethod(value.type);
    
    // Add value to builder
    if (!(method in input)) {
      throw createEncryptionError(
        `Encryption method '${method}' not available on instance`,
        { method, type: value.type }
      );
    }

    // Call the encryption method
    (input as any)[method](value.value);

    // Encrypt and return result
    const result = await input.encrypt();
    
    return {
      handles: result.handles,
      inputProof: result.inputProof,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'FhevmError') {
      throw error;
    }
    throw createEncryptionError(
      `Failed to encrypt ${value.type} value`,
      { type: value.type, value: value.value },
      error
    );
  }
}

/**
 * Encrypts multiple values in a single operation (batch encryption)
 */
export async function encryptBatch(
  instance: FhevmInstance,
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  values: EncryptionValue[]
): Promise<EncryptionResult> {
  if (!instance) {
    throw createInitError(
      FhevmErrorCode.INIT_FAILED,
      'FHEVM instance not initialized',
      'Call createFhevmClient() or wait for initialization to complete'
    );
  }

  if (!values || values.length === 0) {
    throw createEncryptionError('No values provided for encryption', { count: 0 });
  }

  // Validate all inputs first
  for (let i = 0; i < values.length; i++) {
    try {
      validateEncryptionValue(values[i]);
    } catch (error) {
      throw createEncryptionError(
        `Validation failed for value at index ${i}`,
        { index: i, value: values[i] },
        error
      );
    }
  }

  try {
    // Create encrypted input builder
    const input = (instance as any).createEncryptedInput(contractAddress, userAddress);
    
    // Add all values
    for (const value of values) {
      const method = getEncryptionMethod(value.type);
      (input as any)[method](value.value);
    }

    // Encrypt once for all values
    const result = await input.encrypt();
    
    return {
      handles: result.handles,
      inputProof: result.inputProof,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'FhevmError') {
      throw error;
    }
    throw createEncryptionError(
      `Failed to batch encrypt ${values.length} values`,
      { count: values.length },
      error
    );
  }
}

/**
 * Encrypts a structured object with typed fields
 * Example: encryptStruct(instance, addr, addr, { balance: { type: 'euint64', value: 1000n } })
 */
export async function encryptStruct<T extends Record<string, EncryptionValue>>(
  instance: FhevmInstance,
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  struct: T
): Promise<{ result: EncryptionResult; fields: (keyof T)[] }> {
  const fields = Object.keys(struct) as (keyof T)[];
  const values = fields.map(field => struct[field]);
  
  const result = await encryptBatch(instance, contractAddress, userAddress, values);
  
  return { result, fields };
}

/**
 * Helper: Convert Uint8Array or string to 0x-prefixed hex string
 */
export function toHex(value: Uint8Array | string): `0x${string}` {
  if (typeof value === 'string') {
    return (value.startsWith('0x') ? value : `0x${value}`) as `0x${string}`;
  }
  // value is Uint8Array
  return ('0x' + Array.from(value).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`;
}

/**
 * Helper: Convert EncryptionResult to contract-friendly format
 */
export function formatEncryptionResult(result: EncryptionResult): {
  handle: `0x${string}`;
  proof: `0x${string}`;
  handles: `0x${string}`[];
} {
  return {
    handle: toHex(result.handles[0]),
    proof: toHex(result.inputProof),
    handles: result.handles.map(h => toHex(h)),
  };
}

