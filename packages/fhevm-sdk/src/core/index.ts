/**
 * Core FHEVM SDK Exports
 * Framework-agnostic core functionality
 */

// Core Client
export * from './FhevmClient';

// Types
export * from './types';

// Errors
export * from './errors';

// Encryption
export * from './encryption';

// Decryption
export * from './decryption';

// Contract Helpers
export * from './contract';

// Storage
export * from './storage';

// Performance & Caching
export * from './cache';

// Validation
export * from './validation';

// Performance (EncryptionQueue, retryOperation, etc.)
export * from './performance';

// Type Guards (exports that don't conflict)
export {
  isEncryptionValue,
  isEncryptionResult,
  isDecryptionSignature,
  isAddress,
  isHexString,
  isBooleanLike,
  toBoolean,
  isSafeInteger,
  isUint8,
  isUint16,
  isUint32,
  isNetworkConfig,
  assertDefined,
  assertTrue,
  isCiphertextHandle,
} from './guards';

// Legacy exports (for backward compatibility)
export * from "../internal/fhevm";
export * from "../internal/RelayerSDKLoader";
export * from "../internal/PublicKeyStorage";
export * from "../internal/fhevmTypes";
export * from "../internal/constants";

