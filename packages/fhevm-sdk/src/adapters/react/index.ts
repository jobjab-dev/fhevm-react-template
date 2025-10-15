/**
 * React Adapter Exports
 * 
 * Wagmi-like React hooks and components for FHEVM
 */

export * from './FhevmProvider';
export * from './useEncrypt';
export * from './useDecrypt';

// Re-export core types for convenience
export type {
  FhevmClient,
  FhevmClientConfig,
  FhevmClientStatus,
  EncryptionValue,
  EncryptionResult,
  DecryptionRequest,
  DecryptionResult,
  DecryptionSignature,
  NetworkConfig,
  FheType,
} from '../../core';

