/**
 * Storage Abstractions
 * Framework-agnostic storage implementations
 */

import type { IStorage } from './types';
import { FhevmErrorCode, FhevmError } from './errors';

/**
 * Memory Storage (in-memory, volatile)
 */
export class MemoryStorage implements IStorage {
  private _store: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this._store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this._store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this._store.delete(key);
  }

  async clear(): Promise<void> {
    this._store.clear();
  }

  size(): number {
    return this._store.size;
  }

  keys(): string[] {
    return Array.from(this._store.keys());
  }
}

/**
 * LocalStorage wrapper (browser only)
 */
export class LocalStorageAdapter implements IStorage {
  private _prefix: string;

  constructor(prefix = 'fhevm:') {
    this._prefix = prefix;
    
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new FhevmError({
        code: FhevmErrorCode.STORAGE_NOT_AVAILABLE,
        message: 'LocalStorage is not available in this environment',
        suggestion: 'Use MemoryStorage or IndexedDBStorage instead',
      });
    }
  }

  private _getKey(key: string): string {
    return this._prefix + key;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(this._getKey(key));
    } catch (error) {
      console.error('[LocalStorage] getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this._getKey(key), value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new FhevmError({
          code: FhevmErrorCode.STORAGE_QUOTA_EXCEEDED,
          message: 'LocalStorage quota exceeded',
          suggestion: 'Clear old data or use IndexedDB for larger storage',
          cause: error,
        });
      }
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this._getKey(key));
    } catch (error) {
      console.error('[LocalStorage] removeItem error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this._prefix)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('[LocalStorage] clear error:', error);
    }
  }
}

/**
 * IndexedDB Storage (browser only, larger capacity)
 */
export class IndexedDBStorage implements IStorage {
  private _dbName: string;
  private _storeName: string;
  private _version: number;
  private _db: IDBDatabase | null = null;

  constructor(dbName = 'fhevm-storage', storeName = 'keyval', version = 1) {
    this._dbName = dbName;
    this._storeName = storeName;
    this._version = version;

    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new FhevmError({
        code: FhevmErrorCode.STORAGE_NOT_AVAILABLE,
        message: 'IndexedDB is not available in this environment',
        suggestion: 'Use MemoryStorage or LocalStorage instead',
      });
    }
  }

  private async _ensureDB(): Promise<IDBDatabase> {
    if (this._db) {
      return this._db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this._dbName, this._version);

      request.onerror = () => {
        reject(new FhevmError({
          code: FhevmErrorCode.STORAGE_ERROR,
          message: 'Failed to open IndexedDB',
          cause: request.error,
        }));
      };

      request.onsuccess = () => {
        this._db = request.result;
        resolve(this._db);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(this._storeName)) {
          db.createObjectStore(this._storeName);
        }
      };
    });
  }

  async getItem(key: string): Promise<string | null> {
    const db = await this._ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this._storeName, 'readonly');
      const store = transaction.objectStore(this._storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    const db = await this._ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this._storeName, 'readwrite');
      const store = transaction.objectStore(this._storeName);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async removeItem(key: string): Promise<void> {
    const db = await this._ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this._storeName, 'readwrite');
      const store = transaction.objectStore(this._storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this._ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this._storeName, 'readwrite');
      const store = transaction.objectStore(this._storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  close(): void {
    if (this._db) {
      this._db.close();
      this._db = null;
    }
  }
}

/**
 * Storage factory
 */
export function createStorage(type: 'memory' | 'localStorage' | 'indexedDB' = 'memory'): IStorage {
  switch (type) {
    case 'memory':
      return new MemoryStorage();
    case 'localStorage':
      return new LocalStorageAdapter();
    case 'indexedDB':
      return new IndexedDBStorage();
    default:
      throw new FhevmError({
        code: FhevmErrorCode.INVALID_ARGUMENT,
        message: `Unknown storage type: ${type}`,
        suggestion: 'Use "memory", "localStorage", or "indexedDB"',
      });
  }
}

/**
 * Auto-detect best available storage
 */
export function createBestAvailableStorage(): IStorage {
  if (typeof window === 'undefined') {
    // Node.js environment
    return new MemoryStorage();
  }

  // Try IndexedDB first (larger capacity)
  if (window.indexedDB) {
    try {
      return new IndexedDBStorage();
    } catch {
      // Fall through to localStorage
    }
  }

  // Try localStorage
  if (window.localStorage) {
    try {
      return new LocalStorageAdapter();
    } catch {
      // Fall through to memory
    }
  }

  // Fallback to memory storage
  return new MemoryStorage();
}

