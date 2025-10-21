/**
 * Examples Validation Tests
 * 
 * Ensures all code examples in documentation are valid and importable
 */

import { describe, it, expect } from 'vitest';
import { createFhevmClient } from '../../src/core/FhevmClient';
import { 
  validateAddress, 
  validateFheType, 
  validateUintValue 
} from '../../src/core/validation';

describe('Example Code Validation', () => {
  describe('README Quick Start Example', () => {
    it('should validate basic encryption example', () => {
      // From README.md
      const client = createFhevmClient({ 
        network: 'sepolia',
        autoInit: false 
      });

      expect(client).toBeDefined();
      expect(typeof client.encrypt).toBe('function');
      expect(typeof client.decrypt).toBe('function');
    });
  });

  describe('COOKBOOK Examples', () => {
    it('should validate Recipe 1: Encrypt Single Value', () => {
      // Verify example code structure
      const contractAddress = '0x0000000000000000000000000000000000000000';
      const userAddress = '0x0000000000000000000000000000000000000001';

      expect(() => validateAddress(contractAddress, 'Contract')).not.toThrow();
      expect(() => validateAddress(userAddress, 'User')).not.toThrow();
    });

    it('should validate Recipe 2: Batch Encrypt', () => {
      const values = [
        { type: 'euint32' as const, value: 100 },
        { type: 'euint64' as const, value: 20000n },
        { type: 'ebool' as const, value: true },
      ];

      values.forEach((v, i) => {
        expect(() => validateFheType(v.type)).not.toThrow();
      });
    });

    it('should validate Recipe 21: Encryption Validation', () => {
      // From COOKBOOK Recipe 21
      expect(() => validateUintValue('euint8', 255)).not.toThrow();
      expect(() => validateUintValue('euint8', 256)).toThrow();

      expect(() => validateUintValue('euint32', 4294967295n)).not.toThrow();
    });
  });

  describe('API_REFERENCE Examples', () => {
    it('should match createFhevmClient signature', () => {
      const client = createFhevmClient({
        network: 'sepolia',
        provider: 'https://eth-sepolia.public.blastapi.io',
      });

      expect(client).toBeDefined();
      expect(client.status).toBeDefined();
      expect(client.network).toBeDefined();
    });

    it('should validate encryption types from API docs', () => {
      const types: Array<any> = [
        'ebool',
        'euint8', 'euint16', 'euint32', 'euint64', 'euint128', 'euint256',
        'eaddress',
        'ebytes64', 'ebytes128', 'ebytes256',
      ];

      types.forEach(type => {
        expect(() => validateFheType(type)).not.toThrow();
      });
    });
  });

  describe('QUICKSTART Examples', () => {
    it('should validate React example', async () => {
      // Ensures React imports are available
      const reactModule = await import('../../src/adapters/react/index');
      const componentModule = await import('../../src/components/react/index');

      expect(reactModule.FhevmProvider).toBeDefined();
      expect(reactModule.useFhevmClient).toBeDefined();
      expect(componentModule.EncryptedInput).toBeDefined();
    });

    it('should validate Node.js example', async () => {
      const coreModule = await import('../../src/core/index');

      expect(coreModule.createFhevmClient).toBeDefined();
      expect(typeof coreModule.createFhevmClient).toBe('function');
    });
  });

  describe('TypeScript Examples (01-10)', () => {
    it('should validate imports used in examples', async () => {
      // Example 01: init-encrypt
      const coreModule = await import('../../src/core/index');
      expect(coreModule.createFhevmClient).toBeDefined();

      // Example 08: error-handling
      expect(coreModule.isFhevmError).toBeDefined();
      expect(coreModule.formatErrorMessage).toBeDefined();

      // Example 09: react-provider
      const reactModule = await import('../../src/adapters/react/index');
      expect(reactModule.FhevmProvider).toBeDefined();
      expect(reactModule.useEncrypt).toBeDefined();
    });
  });
});

describe('Documentation Accuracy', () => {
  it('should have all exports mentioned in API_REFERENCE', async () => {
    const coreExports = await import('../../src/core/index');

    // Core functions from API_REFERENCE
    expect(coreExports.createFhevmClient).toBeDefined();
    expect(coreExports.validateEncryptionValue).toBeDefined();
    expect(coreExports.toHex).toBeDefined();
    expect(coreExports.formatEncryptionResult).toBeDefined();
    expect(coreExports.isFhevmError).toBeDefined();
    expect(coreExports.formatErrorMessage).toBeDefined();
  });

  it('should have all React exports mentioned in docs', async () => {
    const reactExports = await import('../../src/adapters/react/index');

    expect(reactExports.FhevmProvider).toBeDefined();
    expect(reactExports.useFhevmContext).toBeDefined();
    expect(reactExports.useFhevmClient).toBeDefined();
    expect(reactExports.useEncrypt).toBeDefined();
    expect(reactExports.useDecrypt).toBeDefined();
  });

  it('should have all components mentioned in docs', async () => {
    const componentExports = await import('../../src/components/react/index');

    expect(componentExports.EncryptedInput).toBeDefined();
    expect(componentExports.DecryptButton).toBeDefined();
    expect(componentExports.CipherPreview).toBeDefined();
  });
});

