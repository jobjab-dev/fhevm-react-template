/**
 * Core FHEVM SDK Types
 * Framework-agnostic type definitions
 */

import type { FhevmInstance as RelayerFhevmInstance } from '@zama-fhe/relayer-sdk/bundle';
import type { FhevmInstanceConfig as RelayerFhevmInstanceConfig } from '@zama-fhe/relayer-sdk/web';

// Re-export relayer types
export type FhevmInstance = RelayerFhevmInstance;
export type FhevmInstanceConfig = RelayerFhevmInstanceConfig;

/**
 * Supported FHE encrypted types
 */
export type FheType =
  | 'ebool'
  | 'euint8'
  | 'euint16'
  | 'euint32'
  | 'euint64'
  | 'euint128'
  | 'euint256'
  | 'eaddress'
  | 'ebytes64'
  | 'ebytes128'
  | 'ebytes256';

export type FheExternalType = 
  | 'externalEbool'
  | 'externalEuint8'
  | 'externalEuint16'
  | 'externalEuint32'
  | 'externalEuint64'
  | 'externalEuint128'
  | 'externalEuint256'
  | 'externalEaddress'
  | 'externalEbytes64'
  | 'externalEbytes128'
  | 'externalEbytes256';

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  isTestnet?: boolean;
  
  // FHEVM Contract Addresses (Host Chain)
  aclContractAddress: `0x${string}`;
  kmsContractAddress: `0x${string}`;
  inputVerifierContractAddress: `0x${string}`;
  
  // Gateway Contract Addresses (Gateway Chain)
  verifyingContractAddressDecryption: `0x${string}`;
  verifyingContractAddressInputVerification: `0x${string}`;
  
  // Gateway Chain ID
  gatewayChainId: number;
  
  // Relayer URL
  relayerUrl: string;
}

/**
 * Predefined network configurations
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    isTestnet: true,
    aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
    kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
    inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
    verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
    verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
    gatewayChainId: 55815,
    relayerUrl: 'https://relayer.testnet.zama.cloud',
  },
  localhost: {
    chainId: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    isTestnet: true,
    // These will be auto-detected for Hardhat nodes
    aclContractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    kmsContractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    inputVerifierContractAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    verifyingContractAddressDecryption: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    verifyingContractAddressInputVerification: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    gatewayChainId: 31337,
    relayerUrl: 'http://localhost:8545',
  },
};

/**
 * Encryption input value
 */
export interface EncryptionValue {
  type: FheType;
  value: boolean | number | bigint | string;
}

/**
 * Encryption result
 */
export interface EncryptionResult {
  handles: Uint8Array[];
  inputProof: Uint8Array;
}

/**
 * Decryption request
 */
export interface DecryptionRequest {
  handle: string;
  contractAddress: `0x${string}`;
}

/**
 * Decryption result
 */
export type DecryptionResult = Record<string, string | bigint | boolean>;

/**
 * EIP-712 signature for decryption
 */
export interface DecryptionSignature {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
}

/**
 * Client initialization options
 */
export interface FhevmClientConfig {
  // Network configuration (can be a preset name or custom config)
  network: string | NetworkConfig;
  
  // Provider (can be EIP-1193 provider or RPC URL)
  provider?: any | string;
  
  // Mock chains for testing (chainId -> rpcUrl)
  mockChains?: Record<number, string>;
  
  // Cache configuration
  cache?: {
    publicKey?: boolean;
    signatures?: boolean;
  };
  
  // Auto-init (default: true)
  autoInit?: boolean;
}

/**
 * Client status
 */
export type FhevmClientStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'error'
  | 'disconnected';

/**
 * Storage interface
 */
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Contract call options
 */
export interface ContractCallOptions {
  contractAddress: `0x${string}`;
  abi: any[];
  functionName: string;
  args?: any[];
  encrypted?: boolean;
  gasLimit?: bigint;
}

/**
 * Encrypted contract call result
 */
export interface EncryptedContractCallResult {
  transaction: any;
  handles?: string[];
}

