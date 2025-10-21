/**
 * Performance Optimization Utilities
 * 
 * Tools for improving SDK performance
 */

import type { EncryptionValue, EncryptionResult, FhevmInstance } from './types';
import { encryptBatch } from './encryption';

/**
 * Batch queue for auto-batching multiple encryption requests
 */
export class EncryptionQueue {
  private queue: Array<{
    value: EncryptionValue;
    resolve: (result: Uint8Array) => void;
    reject: (error: Error) => void;
  }> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly batchDelay: number;
  private readonly maxBatchSize: number;

  constructor(
    private instance: FhevmInstance,
    private contractAddress: `0x${string}`,
    private userAddress: `0x${string}`,
    options: { batchDelay?: number; maxBatchSize?: number } = {}
  ) {
    this.batchDelay = options.batchDelay ?? 100; // 100ms default
    this.maxBatchSize = options.maxBatchSize ?? 50;
  }

  /**
   * Add value to queue (auto-batches)
   */
  async add(value: EncryptionValue): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      this.queue.push({ value, resolve, reject });

      // Process immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
        return;
      }

      // Schedule batch processing
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flush(), this.batchDelay);
    });
  }

  /**
   * Process all queued items
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.queue.length);
    this.timer = null;

    try {
      const result = await encryptBatch(
        this.instance,
        this.contractAddress,
        this.userAddress,
        batch.map(item => item.value)
      );

      // Resolve all promises with their respective handles
      batch.forEach((item, index) => {
        item.resolve(result.handles[index]);
      });
    } catch (error) {
      // Reject all promises
      batch.forEach(item => {
        item.reject(error as Error);
      });
    }
  }

  /**
   * Clear queue without processing
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const remaining = this.queue.splice(0, this.queue.length);
    remaining.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
  }
}

/**
 * Measure encryption performance
 */
export async function measureEncryptionTime(
  operation: () => Promise<any>
): Promise<{ result: any; timeMs: number }> {
  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  const timeMs = end - start;

  return { result, timeMs };
}

/**
 * Compare batch vs individual encryption performance
 */
export async function benchmarkBatchEncryption(
  instance: FhevmInstance,
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  values: EncryptionValue[]
): Promise<{
  individual: { timeMs: number; avgMs: number };
  batch: { timeMs: number };
  speedup: number;
}> {
  const { encryptScalar } = await import('./encryption');

  // Individual encryptions
  const individualStart = performance.now();
  for (const value of values) {
    await encryptScalar(instance, contractAddress, userAddress, value);
  }
  const individualTime = performance.now() - individualStart;

  // Batch encryption
  const batchStart = performance.now();
  await encryptBatch(instance, contractAddress, userAddress, values);
  const batchTime = performance.now() - batchStart;

  return {
    individual: {
      timeMs: individualTime,
      avgMs: individualTime / values.length,
    },
    batch: {
      timeMs: batchTime,
    },
    speedup: individualTime / batchTime,
  };
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  private startMemory: number = 0;

  start(): void {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      this.startMemory = (performance as any).memory.usedJSHeapSize;
    }
  }

  getUsage(): { usedMB: number; deltaMB: number } {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const currentMemory = (performance as any).memory.usedJSHeapSize;
      const usedMB = currentMemory / 1024 / 1024;
      const deltaMB = (currentMemory - this.startMemory) / 1024 / 1024;

      return { usedMB, deltaMB };
    }

    return { usedMB: 0, deltaMB: 0 };
  }
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 100,
    backoff = false,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
        onRetry?.(attempt + 1, lastError);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

