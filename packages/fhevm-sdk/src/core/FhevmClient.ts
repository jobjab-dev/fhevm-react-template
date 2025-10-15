/**
 * FhevmClient - Core FHEVM Client Class
 * 
 * Framework-agnostic client for FHEVM operations.
 * Provides a clean, wagmi-like API for encryption, decryption, and contract interactions.
 */

import type {
  FhevmInstance,
  FhevmClientConfig,
  FhevmClientStatus,
  NetworkConfig,
  EncryptionValue,
  EncryptionResult,
  DecryptionRequest,
  DecryptionResult,
  DecryptionSignature,
  IStorage,
} from './types';
import { NETWORKS } from './types';
import { createInitError, FhevmErrorCode, guardedOperation } from './errors';
import {
  encryptScalar,
  encryptBatch,
  encryptStruct,
  formatEncryptionResult,
} from './encryption';
import {
  userDecrypt,
  publicDecrypt,
  generateDecryptionKeypair,
  createDecryptionEIP712,
  isSignatureValid,
  getSignatureRemainingTime,
} from './decryption';

/**
 * Event emitter for client state changes
 */
type ClientEventType = 'statusChange' | 'error' | 'connected' | 'disconnected';
type ClientEventHandler = (data?: any) => void;

/**
 * Main FHEVM Client
 */
export class FhevmClient {
  private _instance: FhevmInstance | undefined;
  private _config: FhevmClientConfig;
  private _status: FhevmClientStatus = 'idle';
  private _network: NetworkConfig | undefined;
  private _storage: IStorage | undefined;
  private _eventHandlers: Map<ClientEventType, Set<ClientEventHandler>> = new Map();
  private _abortController: AbortController | null = null;

  /**
   * Create a new FHEVM Client
   */
  constructor(config: FhevmClientConfig) {
    this._config = config;
    this._resolveNetwork();

    // Auto-initialize if enabled (default: true)
    if (config.autoInit !== false) {
      this.init().catch(error => {
        console.error('[FhevmClient] Auto-initialization failed:', error);
        this._setStatus('error');
        this._emit('error', error);
      });
    }
  }

  /**
   * Get current client status
   */
  get status(): FhevmClientStatus {
    return this._status;
  }

  /**
   * Get FHEVM instance (may be undefined if not initialized)
   */
  get instance(): FhevmInstance | undefined {
    return this._instance;
  }

  /**
   * Get network configuration
   */
  get network(): NetworkConfig | undefined {
    return this._network;
  }

  /**
   * Check if client is ready for operations
   */
  get isReady(): boolean {
    return this._status === 'ready' && this._instance !== undefined;
  }

  /**
   * Set storage provider
   */
  setStorage(storage: IStorage): void {
    this._storage = storage;
  }

  /**
   * Initialize the FHEVM instance
   */
  async init(): Promise<void> {
    if (this._status === 'initializing') {
      throw createInitError(
        FhevmErrorCode.INIT_FAILED,
        'Initialization already in progress'
      );
    }

    if (this._status === 'ready') {
      return; // Already initialized
    }

    this._setStatus('initializing');
    this._abortController = new AbortController();

    try {
      // Import instance creation dynamically to avoid circular deps
      const { createFhevmInstance } = await import('../internal/fhevm');

      const instance = await createFhevmInstance({
        provider: this._config.provider ?? (this._network?.rpcUrl || ''),
        mockChains: this._config.mockChains,
        signal: this._abortController.signal,
        onStatusChange: (status) => {
          console.log('[FhevmClient] Instance status:', status);
        },
      });

      if (this._abortController?.signal.aborted) {
        throw createInitError(
          FhevmErrorCode.OPERATION_ABORTED,
          'Initialization was aborted'
        );
      }

      this._instance = instance;
      this._setStatus('ready');
      this._emit('connected', { network: this._network });

      console.log('[FhevmClient] Initialized successfully');
    } catch (error) {
      this._setStatus('error');
      this._emit('error', error);
      
      if (error instanceof Error && error.name === 'FhevmAbortError') {
        throw createInitError(
          FhevmErrorCode.OPERATION_ABORTED,
          'Client initialization was aborted',
          undefined,
          error
        );
      }

      throw createInitError(
        FhevmErrorCode.INIT_FAILED,
        'Failed to initialize FHEVM client',
        'Check your network configuration and provider',
        error
      );
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }

    this._instance = undefined;
    this._setStatus('disconnected');
    this._emit('disconnected');
  }

  /**
   * Reconnect (reinitialize)
   */
  async reconnect(): Promise<void> {
    await this.disconnect();
    this._setStatus('idle');
    await this.init();
  }

  /**
   * Encrypt a single value
   */
  async encrypt(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    value: EncryptionValue
  ): Promise<EncryptionResult> {
    this._assertReady();

    return guardedOperation(() =>
      encryptScalar(this._instance!, contractAddress, userAddress, value)
    );
  }

  /**
   * Encrypt multiple values (batch)
   */
  async encryptBatch(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    values: EncryptionValue[]
  ): Promise<EncryptionResult> {
    this._assertReady();

    return guardedOperation(() =>
      encryptBatch(this._instance!, contractAddress, userAddress, values)
    );
  }

  /**
   * Encrypt a structured object
   */
  async encryptStruct<T extends Record<string, EncryptionValue>>(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`,
    struct: T
  ): Promise<{ result: EncryptionResult; fields: (keyof T)[] }> {
    this._assertReady();

    return guardedOperation(() =>
      encryptStruct(this._instance!, contractAddress, userAddress, struct)
    );
  }

  /**
   * Decrypt values with user signature (EIP-712)
   */
  async decrypt(
    requests: DecryptionRequest[],
    signature: DecryptionSignature
  ): Promise<DecryptionResult> {
    this._assertReady();

    return guardedOperation(() =>
      userDecrypt(this._instance!, requests, signature)
    );
  }

  /**
   * Publicly decrypt a value (no signature required)
   */
  async publicDecrypt(
    handle: string,
    contractAddress: `0x${string}`
  ): Promise<bigint | boolean | string> {
    this._assertReady();

    return guardedOperation(() =>
      publicDecrypt(this._instance!, handle, contractAddress)
    );
  }

  /**
   * Generate a new keypair for decryption
   */
  generateKeypair(): { publicKey: string; privateKey: string } {
    this._assertReady();
    return generateDecryptionKeypair(this._instance!);
  }

  /**
   * Create EIP-712 message for decryption signature
   */
  createEIP712(
    publicKey: string,
    contractAddresses: `0x${string}`[],
    startTimestamp?: number,
    durationDays?: number
  ): any {
    this._assertReady();
    return createDecryptionEIP712(
      this._instance!,
      publicKey,
      contractAddresses,
      startTimestamp,
      durationDays
    );
  }

  /**
   * Utilities
   */
  utils = {
    formatEncryptionResult,
    isSignatureValid,
    getSignatureRemainingTime,
  };

  /**
   * Event management
   */
  on(event: ClientEventType, handler: ClientEventHandler): () => void {
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set());
    }
    this._eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this._eventHandlers.get(event)?.delete(handler);
    };
  }

  off(event: ClientEventType, handler: ClientEventHandler): void {
    this._eventHandlers.get(event)?.delete(handler);
  }

  /**
   * Private helpers
   */
  private _setStatus(status: FhevmClientStatus): void {
    if (this._status !== status) {
      this._status = status;
      this._emit('statusChange', { status });
    }
  }

  private _emit(event: ClientEventType, data?: any): void {
    this._eventHandlers.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[FhevmClient] Event handler error (${event}):`, error);
      }
    });
  }

  private _assertReady(): void {
    if (!this.isReady) {
      throw createInitError(
        FhevmErrorCode.INIT_FAILED,
        `Client is not ready (status: ${this._status})`,
        'Wait for initialization to complete or call init() manually'
      );
    }
  }

  private _resolveNetwork(): void {
    if (typeof this._config.network === 'string') {
      const networkName = this._config.network.toLowerCase();
      if (!(networkName in NETWORKS)) {
        throw createInitError(
          FhevmErrorCode.INVALID_NETWORK,
          `Unknown network: ${this._config.network}`,
          `Available networks: ${Object.keys(NETWORKS).join(', ')}`
        );
      }
      this._network = NETWORKS[networkName];
    } else {
      this._network = this._config.network;
    }
  }
}

/**
 * Factory function to create a new FHEVM client
 */
export function createFhevmClient(config: FhevmClientConfig): FhevmClient {
  return new FhevmClient(config);
}

/**
 * Singleton pattern for global client instance
 */
let globalClient: FhevmClient | undefined;

export function getGlobalClient(): FhevmClient | undefined {
  return globalClient;
}

export function setGlobalClient(client: FhevmClient): void {
  globalClient = client;
}

export function clearGlobalClient(): void {
  globalClient?.disconnect();
  globalClient = undefined;
}

