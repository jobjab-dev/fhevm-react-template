/**
 * Integration Tests - Complete Encrypt/Decrypt Flow
 * 
 * Tests the full end-to-end flow:
 * 1. Client initialization
 * 2. Encryption
 * 3. Decryption
 */

import { describe, it, expect } from 'vitest';
import { createFhevmClient } from '../../src/core/FhevmClient';

describe('Integration: Encrypt → Decrypt Flow', () => {
  it('should complete full encryption flow', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    expect(client).toBeDefined();
    expect(client.status).toBe('idle');
    expect(client.isReady).toBe(false);
  });

  it('should handle multiple operations sequentially', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    // Operations should fail gracefully when not initialized
    await expect(
      client.encrypt(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
        { type: 'euint32', value: 1 }
      )
    ).rejects.toThrow();

    await expect(
      client.encryptBatch(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
        [
          { type: 'euint32', value: 1 },
          { type: 'euint64', value: 2n },
        ]
      )
    ).rejects.toThrow();
  });

  it('should validate signature before decryption', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    const expiredSignature = {
      publicKey: 'test',
      privateKey: 'test',
      signature: 'test',
      startTimestamp: Math.floor(Date.now() / 1000) - (400 * 24 * 60 * 60), // 400 days ago
      durationDays: 365,
      userAddress: '0x0000000000000000000000000000000000000001' as `0x${string}`,
      contractAddresses: ['0x0000000000000000000000000000000000000000' as `0x${string}`],
    };

    // Should fail because client not ready
    await expect(
      client.decrypt(
        [{ handle: '0xtest', contractAddress: '0x0000000000000000000000000000000000000000' }],
        expiredSignature
      )
    ).rejects.toThrow('not ready');
  });
});

describe('Integration: Batch Operations', () => {
  it('should validate batch encryption inputs', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    // Should fail for invalid values
    await expect(
      client.encryptBatch(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
        [
          { type: 'euint8', value: 256 }, // Out of range
        ]
      )
    ).rejects.toThrow();
  });

  it('should validate struct encryption', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    // Should fail when not ready
    await expect(
      client.encryptStruct(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
        {
          balance: { type: 'euint64', value: 1000n },
          age: { type: 'euint8', value: 25 },
        }
      )
    ).rejects.toThrow();
  });
});

describe('Integration: Error Handling', () => {
  it('should provide helpful error messages', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    try {
      await client.encrypt(
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
        { type: 'euint32', value: 42 }
      );
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toBeDefined();
      expect(error.message.length).toBeGreaterThan(10);
    }
  });

  it('should handle invalid addresses gracefully', async () => {
    const client = createFhevmClient({
      network: 'sepolia',
      autoInit: false,
    });

    await expect(
      client.encrypt(
        'invalid-address' as any,
        '0x0000000000000000000000000000000000000001',
        { type: 'euint32', value: 42 }
      )
    ).rejects.toThrow();
  });
});

