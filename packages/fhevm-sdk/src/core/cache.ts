/**
 * Caching utilities for FHEVM operations
 * Improves performance by caching frequently used data
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

/**
 * Simple in-memory cache with TTL support
 */
export class MemoryCache<K, V> {
  private cache: Map<string, CacheEntry<V>> = new Map();
  private ttl: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || 5 * 60 * 1000; // Default: 5 minutes
    this.maxSize = options.maxSize || 100; // Default: 100 entries
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const keyStr = this.serializeKey(key);
    const entry = this.cache.get(keyStr);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(keyStr);
      return undefined;
    }

    // Update hit count
    entry.hits++;
    
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V): void {
    // Evict if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const keyStr = this.serializeKey(key);
    this.cache.set(keyStr, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete entry
   */
  delete(key: K): boolean {
    const keyStr = this.serializeKey(key);
    return this.cache.delete(keyStr);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; hits: number; entries: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      hits: totalHits,
      entries: this.cache.size,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<V>): boolean {
    return Date.now() - entry.timestamp > this.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Serialize key to string
   */
  private serializeKey(key: K): string {
    if (typeof key === 'string') return key;
    if (typeof key === 'number') return String(key);
    return JSON.stringify(key);
  }
}

/**
 * Cache decorator for async functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions & { keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = new MemoryCache<string, any>(options);
  const keyFn = options.keyFn || ((...args: any[]) => JSON.stringify(args));

  return (async (...args: Parameters<T>) => {
    const key = keyFn(...args);
    
    // Check cache
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Compute and cache
    const result = await fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Batch operation queue
 * Combines multiple operations into batches for efficiency
 */
export class BatchQueue<T, R> {
  private queue: Array<{ item: T; resolve: (value: R) => void; reject: (error: any) => void }> = [];
  private timer: NodeJS.Timeout | null = null;
  private batchFn: (items: T[]) => Promise<R[]>;
  private delay: number;
  private maxSize: number;

  constructor(
    batchFn: (items: T[]) => Promise<R[]>,
    options: { delay?: number; maxSize?: number } = {}
  ) {
    this.batchFn = batchFn;
    this.delay = options.delay || 50; // Default: 50ms
    this.maxSize = options.maxSize || 10; // Default: 10 items
  }

  /**
   * Add item to queue
   */
  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      // Execute immediately if queue is full
      if (this.queue.length >= this.maxSize) {
        this.flush();
      } else {
        // Otherwise, schedule execution
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  /**
   * Flush queue and execute batch
   */
  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const batch = this.queue.splice(0, this.queue.length);
    const items = batch.map(b => b.item);

    try {
      const results = await this.batchFn(items);
      
      // Resolve individual promises
      for (let i = 0; i < batch.length; i++) {
        batch[i].resolve(results[i]);
      }
    } catch (error) {
      // Reject all promises in batch
      for (const item of batch) {
        item.reject(error);
      }
    }
  }
}

/**
 * Debounce async function
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T {
  let timer: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    return new Promise((resolve, reject) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }) as T;
}

/**
 * Throttle async function
 */
export function throttle<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limit: number
): T {
  let inThrottle = false;
  let lastResult: any;

  return (async (...args: Parameters<T>) => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = await fn(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  }) as T;
}

