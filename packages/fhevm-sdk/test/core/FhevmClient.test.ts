/**
 * FhevmClient tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFhevmClient, FhevmClient } from '../../src/core/FhevmClient';
import { FhevmErrorCode } from '../../src/core/errors';

describe('FhevmClient', () => {
  describe('createFhevmClient', () => {
    it('should create a client instance', () => {
      const client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });

      expect(client).toBeInstanceOf(FhevmClient);
      expect(client.status).toBe('idle');
      expect(client.isReady).toBe(false);
    });

    it('should accept network as string', () => {
      const client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });

      expect(client.network).toBeDefined();
      expect(client.network?.name).toContain('Sepolia');
      expect(client.network?.chainId).toBe(11155111);
    });

    it('should accept custom network config', () => {
      const client = createFhevmClient({
        network: {
          chainId: 11155111,
          name: 'Custom Sepolia',
          rpcUrl: 'https://custom-rpc.io',
          fhevmKmsEndpoint: 'https://kms.zama.ai',
        },
        autoInit: false,
      });

      expect(client.network?.chainId).toBe(11155111);
      expect(client.network?.name).toBe('Custom Sepolia');
    });

    it('should throw error for invalid network name', () => {
      expect(() => createFhevmClient({
        network: 'invalid-network',
        autoInit: false,
      })).toThrow('Unknown network');
    });
  });

  describe('Client Lifecycle', () => {
    let client: FhevmClient;

    beforeEach(() => {
      client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });
    });

    it('should start in idle state', () => {
      expect(client.status).toBe('idle');
      expect(client.isReady).toBe(false);
      expect(client.instance).toBeUndefined();
    });

    it('should throw if operations called before init', async () => {
      await expect(
        client.encrypt(
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
          { type: 'euint32', value: 42 }
        )
      ).rejects.toThrow('not ready');
    });

    it('should have correct status after disconnect', async () => {
      await client.disconnect();
      expect(client.status).toBe('disconnected');
      expect(client.isReady).toBe(false);
    });
  });

  describe('Event Handling', () => {
    let client: FhevmClient;

    beforeEach(() => {
      client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });
    });

    it('should register event handlers', () => {
      const handler = vi.fn();
      const unsubscribe = client.on('statusChange', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should unsubscribe from events', () => {
      const handler = vi.fn();
      const unsubscribe = client.on('statusChange', handler);

      unsubscribe();
      client.off('statusChange', handler);
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Network Configuration', () => {
    it('should resolve sepolia network', () => {
      const client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });

      expect(client.network?.chainId).toBe(11155111);
      expect(client.network?.name).toContain('Sepolia');
    });

    it('should resolve localhost network', () => {
      const client = createFhevmClient({
        network: 'localhost',
        autoInit: false,
      });

      expect(client.network?.chainId).toBe(31337);
      expect(client.network?.name).toBe('Localhost');
    });

    it('should handle case-insensitive network names', () => {
      const client = createFhevmClient({
        network: 'SEPOLIA',
        autoInit: false,
      });

      expect(client.network?.name).toContain('Sepolia');
      expect(client.network?.chainId).toBe(11155111);
    });
  });

  describe('Utilities', () => {
    let client: FhevmClient;

    beforeEach(() => {
      client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });
    });

    it('should expose utility functions', () => {
      expect(client.utils.formatEncryptionResult).toBeDefined();
      expect(client.utils.isSignatureValid).toBeDefined();
      expect(client.utils.getSignatureRemainingTime).toBeDefined();
    });

    it('should validate signature expiry', () => {
      const validSignature = {
        publicKey: 'test',
        privateKey: 'test',
        signature: 'test',
        startTimestamp: Math.floor(Date.now() / 1000),
        durationDays: 365,
        userAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        contractAddresses: ['0x0000000000000000000000000000000000000000' as `0x${string}`],
      };

      const expiredSignature = {
        ...validSignature,
        startTimestamp: Math.floor(Date.now() / 1000) - (366 * 24 * 60 * 60),
        durationDays: 365,
      };

      expect(client.utils.isSignatureValid(validSignature)).toBe(true);
      expect(client.utils.isSignatureValid(expiredSignature)).toBe(false);
    });

    it('should calculate remaining time correctly', () => {
      const signature = {
        publicKey: 'test',
        privateKey: 'test',
        signature: 'test',
        startTimestamp: Math.floor(Date.now() / 1000),
        durationDays: 1,
        userAddress: '0x0000000000000000000000000000000000000000' as `0x${string}`,
        contractAddresses: ['0x0000000000000000000000000000000000000000' as `0x${string}`],
      };

      const remaining = client.utils.getSignatureRemainingTime(signature);
      expect(remaining).toBeGreaterThan(86000); // ~1 day in seconds
      expect(remaining).toBeLessThan(86401);
    });
  });

  describe('Error Handling', () => {
    it('should throw error with helpful message when not initialized', async () => {
      const client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });

      try {
        await client.encrypt(
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
          { type: 'euint32', value: 42 }
        );
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('not ready');
      }
    });
  });

  describe('Singleton Pattern', () => {
    it('should support global client instance', async () => {
      const { getGlobalClient, setGlobalClient, clearGlobalClient } = await import('../../src/core/FhevmClient');
      
      const client = createFhevmClient({
        network: 'sepolia',
        autoInit: false,
      });

      setGlobalClient(client);
      expect(getGlobalClient()).toBe(client);

      clearGlobalClient();
      expect(getGlobalClient()).toBeUndefined();
    });
  });
});

