/**
 * FHEVM Contract Helpers
 * Framework-agnostic utilities for contract interactions
 */

import type { EncryptionResult, FheType } from './types';
import { toHex } from './encryption';
import { externalTypeToFheType } from './encryption';
import { createContractError } from './errors';

/**
 * Parse function ABI to extract encrypted input types
 */
export interface FunctionABIInput {
  name: string;
  type: string;
  internalType?: string;
}

export interface FunctionABI {
  name: string;
  type: 'function';
  inputs: FunctionABIInput[];
  outputs?: any[];
  stateMutability?: string;
}

/**
 * Get encryption method from ABI input type
 */
export function getEncryptionMethodFromABI(input: FunctionABIInput): string | null {
  if (!input.internalType) {
    return null;
  }

  const externalTypes = [
    'externalEbool',
    'externalEuint8',
    'externalEuint16',
    'externalEuint32',
    'externalEuint64',
    'externalEuint128',
    'externalEuint256',
    'externalEaddress',
    'externalEbytes64',
    'externalEbytes128',
    'externalEbytes256',
  ];

  if (externalTypes.includes(input.internalType)) {
    const fheType = externalTypeToFheType(input.internalType);
    return fheType;
  }

  return null;
}

/**
 * Find encrypted inputs in function ABI
 */
export function findEncryptedInputs(
  abi: any[],
  functionName: string
): { index: number; name: string; fheType: FheType }[] {
  const func = abi.find(
    (item: any) => item.type === 'function' && item.name === functionName
  );

  if (!func) {
    throw createContractError(
      `Function '${functionName}' not found in ABI`,
      undefined
    );
  }

  const encryptedInputs: { index: number; name: string; fheType: FheType }[] = [];

  func.inputs.forEach((input: FunctionABIInput, index: number) => {
    const fheType = getEncryptionMethodFromABI(input);
    if (fheType) {
      encryptedInputs.push({
        index,
        name: input.name,
        fheType: fheType as FheType,
      });
    }
  });

  return encryptedInputs;
}

/**
 * Check if function requires encrypted inputs
 */
export function hasEncryptedInputs(abi: any[], functionName: string): boolean {
  try {
    return findEncryptedInputs(abi, functionName).length > 0;
  } catch {
    return false;
  }
}

/**
 * Build contract call parameters from encryption result and ABI
 */
export function buildContractParams(
  encryptionResult: EncryptionResult,
  abi: any[],
  functionName: string
): any[] {
  const func = abi.find(
    (item: any) => item.type === 'function' && item.name === functionName
  );

  if (!func) {
    throw createContractError(
      `Function '${functionName}' not found in ABI`,
      undefined
    );
  }

  const params: any[] = [];
  let handleIndex = 0;

  for (let i = 0; i < func.inputs.length; i++) {
    const input = func.inputs[i];
    const fheType = getEncryptionMethodFromABI(input);

    if (fheType) {
      // This is an encrypted input - use handle
      if (handleIndex < encryptionResult.handles.length) {
        params.push(toHex(encryptionResult.handles[handleIndex]));
        handleIndex++;
      } else {
        throw createContractError(
          `Not enough encrypted handles for function '${functionName}'`,
          undefined
        );
      }
    } else if (input.type === 'bytes') {
      // This is the input proof
      params.push(toHex(encryptionResult.inputProof));
    } else {
      // This should be handled by the caller
      params.push(undefined);
    }
  }

  return params;
}

/**
 * Extract ciphertext handle from contract read result
 */
export function extractHandle(result: any): string | null {
  if (typeof result === 'string' && result.startsWith('0x')) {
    // Check if it's a valid handle (32 bytes hex)
    if (result.length === 66) {
      // Check if it's not zero hash (uninitialized)
      const zeroHash = '0x' + '0'.repeat(64);
      if (result === zeroHash) {
        return null;
      }
      return result;
    }
  }
  
  // Try to extract from structured result
  if (result && typeof result === 'object' && 'handle' in result) {
    return result.handle;
  }

  return null;
}

/**
 * Check if a value is a ciphertext handle
 */
export function isCiphertextHandle(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  // Must be 0x-prefixed hex string, 32 bytes (66 chars including 0x)
  if (!value.startsWith('0x') || value.length !== 66) {
    return false;
  }
  
  // Check if it's not zero hash (uninitialized ciphertext)
  const zeroHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
  if (value === zeroHash) {
    return false;
  }

  return true;
}

/**
 * Format contract call arguments with encrypted inputs
 */
export interface ContractCallArgs {
  encrypted: EncryptionResult;
  regular?: any[];
}

export function formatContractArgs(
  args: ContractCallArgs,
  abi: any[],
  functionName: string
): any[] {
  const func = abi.find(
    (item: any) => item.type === 'function' && item.name === functionName
  );

  if (!func) {
    throw createContractError(
      `Function '${functionName}' not found in ABI`,
      undefined
    );
  }

  const params: any[] = [];
  let handleIndex = 0;
  let regularIndex = 0;

  for (const input of func.inputs) {
    const fheType = getEncryptionMethodFromABI(input);

    if (fheType) {
      // Encrypted input - use handle
      if (handleIndex < args.encrypted.handles.length) {
        params.push(toHex(args.encrypted.handles[handleIndex]));
        handleIndex++;
      }
    } else if (input.type === 'bytes' && input.name.toLowerCase().includes('proof')) {
      // Input proof
      params.push(toHex(args.encrypted.inputProof));
    } else {
      // Regular input
      if (args.regular && regularIndex < args.regular.length) {
        params.push(args.regular[regularIndex]);
        regularIndex++;
      } else {
        throw createContractError(
          `Missing regular argument at index ${regularIndex} for function '${functionName}'`,
          undefined
        );
      }
    }
  }

  return params;
}

/**
 * Validate contract address
 */
export function isValidContractAddress(address: any): address is `0x${string}` {
  if (typeof address !== 'string') {
    return false;
  }
  
  if (!address.startsWith('0x') || address.length !== 42) {
    return false;
  }
  
  // Basic hex validation
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Parse contract event logs for ciphertext handles
 */
export function extractHandlesFromLogs(logs: any[]): string[] {
  const handles: string[] = [];

  for (const log of logs) {
    if (log.data) {
      // Try to extract 32-byte handles from log data
      const data = log.data.replace('0x', '');
      
      // Each handle is 64 hex chars (32 bytes)
      for (let i = 0; i < data.length; i += 64) {
        const possibleHandle = '0x' + data.slice(i, i + 64);
        if (isCiphertextHandle(possibleHandle)) {
          handles.push(possibleHandle);
        }
      }
    }
  }

  return handles;
}

/**
 * Helper to read encrypted value from contract
 */
export interface ReadEncryptedOptions {
  contractAddress: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
  provider: any; // ethers provider
}

export async function readCiphertext(options: ReadEncryptedOptions): Promise<string | null> {
  const { contractAddress, abi, functionName, args = [], provider } = options;

  if (!isValidContractAddress(contractAddress)) {
    throw createContractError('Invalid contract address', contractAddress);
  }

  try {
    // Import ethers dynamically to avoid bundling
    const { Contract } = await import('ethers');
    
    const contract = new Contract(contractAddress, abi, provider);
    
    if (!(functionName in contract)) {
      throw createContractError(
        `Function '${functionName}' not found in contract`,
        contractAddress
      );
    }

    const result = await contract[functionName](...args);
    return extractHandle(result);
  } catch (error) {
    throw createContractError(
      `Failed to read ciphertext from ${functionName}`,
      contractAddress,
      error
    );
  }
}

