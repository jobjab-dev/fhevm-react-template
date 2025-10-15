/**
 * FHEVM SDK Error Taxonomy
 * 
 * Comprehensive error handling system for FHEVM operations
 * Provides clear, actionable error messages for developers
 */

export enum FhevmErrorCode {
  // Initialization Errors (1xxx)
  INIT_FAILED = 'INIT_1000',
  INVALID_NETWORK = 'INIT_1001',
  INVALID_CHAIN_ID = 'INIT_1002',
  PROVIDER_NOT_AVAILABLE = 'INIT_1003',
  SDK_LOAD_FAILED = 'INIT_1004',
  
  // Encryption Errors (2xxx)
  ENCRYPTION_FAILED = 'ENCRYPT_2000',
  INVALID_INPUT_TYPE = 'ENCRYPT_2001',
  INVALID_VALUE = 'ENCRYPT_2002',
  KEYPAIR_GENERATION_FAILED = 'ENCRYPT_2003',
  
  // Decryption Errors (3xxx)
  DECRYPTION_FAILED = 'DECRYPT_3000',
  INVALID_CIPHERTEXT = 'DECRYPT_3001',
  SIGNATURE_REQUIRED = 'DECRYPT_3002',
  SIGNATURE_EXPIRED = 'DECRYPT_3003',
  SIGNATURE_INVALID = 'DECRYPT_3004',
  ACL_PERMISSION_DENIED = 'DECRYPT_3005',
  
  // Contract Errors (4xxx)
  CONTRACT_CALL_FAILED = 'CONTRACT_4000',
  INVALID_CONTRACT_ADDRESS = 'CONTRACT_4001',
  ABI_NOT_FOUND = 'CONTRACT_4002',
  TRANSACTION_FAILED = 'CONTRACT_4003',
  
  // Wallet Errors (5xxx)
  WALLET_NOT_CONNECTED = 'WALLET_5000',
  WALLET_SIGNATURE_REJECTED = 'WALLET_5001',
  WALLET_EIP712_NOT_SUPPORTED = 'WALLET_5002',
  
  // Network Errors (6xxx)
  RPC_ERROR = 'NETWORK_6000',
  RPC_NOT_REACHABLE = 'NETWORK_6001',
  CHAIN_MISMATCH = 'NETWORK_6002',
  UNSUPPORTED_CHAIN = 'NETWORK_6003',
  
  // Storage Errors (7xxx)
  STORAGE_ERROR = 'STORAGE_7000',
  STORAGE_NOT_AVAILABLE = 'STORAGE_7001',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_7002',
  
  // General Errors (9xxx)
  UNKNOWN_ERROR = 'ERROR_9000',
  OPERATION_ABORTED = 'ERROR_9001',
  INVALID_ARGUMENT = 'ERROR_9002',
  NOT_IMPLEMENTED = 'ERROR_9003',
}

export interface FhevmErrorDetails {
  code: FhevmErrorCode;
  message: string;
  suggestion?: string;
  cause?: unknown;
  context?: Record<string, unknown>;
}

/**
 * Base FHEVM Error Class
 */
export class FhevmError extends Error {
  public readonly code: FhevmErrorCode;
  public readonly suggestion?: string;
  public readonly context?: Record<string, unknown>;
  public readonly cause?: unknown;

  constructor(details: FhevmErrorDetails) {
    super(details.message);
    this.name = 'FhevmError';
    this.code = details.code;
    this.suggestion = details.suggestion;
    this.context = details.context;
    this.cause = details.cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FhevmError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Error Factory Functions
 */

export function createInitError(
  code: FhevmErrorCode,
  message: string,
  suggestion?: string,
  cause?: unknown
): FhevmError {
  return new FhevmError({ code, message, suggestion, cause });
}

export function createEncryptionError(
  message: string,
  context?: Record<string, unknown>,
  cause?: unknown
): FhevmError {
  return new FhevmError({
    code: FhevmErrorCode.ENCRYPTION_FAILED,
    message,
    suggestion: 'Check that your input values are valid and the FHEVM instance is initialized',
    context,
    cause,
  });
}

export function createDecryptionError(
  message: string,
  context?: Record<string, unknown>,
  cause?: unknown
): FhevmError {
  return new FhevmError({
    code: FhevmErrorCode.DECRYPTION_FAILED,
    message,
    suggestion: 'Ensure you have proper ACL permissions and a valid EIP-712 signature',
    context,
    cause,
  });
}

export function createContractError(
  message: string,
  contractAddress?: string,
  cause?: unknown
): FhevmError {
  return new FhevmError({
    code: FhevmErrorCode.CONTRACT_CALL_FAILED,
    message,
    suggestion: 'Verify the contract address and ensure your transaction parameters are correct',
    context: { contractAddress },
    cause,
  });
}

export function createWalletError(
  code: FhevmErrorCode,
  message: string,
  suggestion?: string
): FhevmError {
  return new FhevmError({
    code,
    message,
    suggestion: suggestion ?? 'Please connect your wallet and try again',
  });
}

export function createNetworkError(
  message: string,
  rpcUrl?: string,
  cause?: unknown
): FhevmError {
  return new FhevmError({
    code: FhevmErrorCode.RPC_ERROR,
    message,
    suggestion: 'Check your RPC endpoint and network connection',
    context: { rpcUrl },
    cause,
  });
}

/**
 * Error Utilities
 */

export function isFhevmError(error: unknown): error is FhevmError {
  return error instanceof FhevmError;
}

export function formatErrorMessage(error: unknown): string {
  if (isFhevmError(error)) {
    let msg = `[${error.code}] ${error.message}`;
    if (error.suggestion) {
      msg += `\n💡 Suggestion: ${error.suggestion}`;
    }
    return msg;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}

/**
 * Error Guard - Wraps async operations with proper error handling
 */
export async function guardedOperation<T>(
  operation: () => Promise<T>,
  errorTransform?: (error: unknown) => FhevmError
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (errorTransform) {
      throw errorTransform(error);
    }
    if (isFhevmError(error)) {
      throw error;
    }
    throw new FhevmError({
      code: FhevmErrorCode.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }
}

