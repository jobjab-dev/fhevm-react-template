/**
 * Type guards tests
 */

import { describe, it, expect } from 'vitest';
import {
  isEncryptionValue,
  isEncryptionResult,
  isDecryptionSignature,
  isAddress,
  isCiphertextHandle,
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
} from '../../src/core/guards';

describe('Type Guards', () => {
  describe('isEncryptionValue', () => {
    it('should identify valid EncryptionValue', () => {
      expect(isEncryptionValue({ type: 'euint32', value: 42 })).toBe(true);
      expect(isEncryptionValue({ type: 'ebool', value: true })).toBe(true);
    });

    it('should reject invalid values', () => {
      expect(isEncryptionValue(null)).toBe(false);
      expect(isEncryptionValue({ value: 42 })).toBe(false);
      expect(isEncryptionValue({ type: 'euint32' })).toBe(false);
    });
  });

  describe('isEncryptionResult', () => {
    it('should identify valid EncryptionResult', () => {
      const result = {
        handles: [new Uint8Array([1, 2, 3])],
        inputProof: new Uint8Array([4, 5, 6]),
      };
      expect(isEncryptionResult(result)).toBe(true);
    });

    it('should reject invalid results', () => {
      expect(isEncryptionResult(null)).toBe(false);
      expect(isEncryptionResult({ handles: [] })).toBe(false);
      expect(isEncryptionResult({ inputProof: new Uint8Array() })).toBe(false);
    });
  });

  describe('isAddress', () => {
    it('should identify valid addresses', () => {
      expect(isAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      expect(isAddress('0x1234567890123456789012345678901234567890')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isAddress('invalid')).toBe(false);
      expect(isAddress('0x123')).toBe(false);
      expect(isAddress('0xGGGG000000000000000000000000000000000000')).toBe(false);
    });
  });

  describe('isCiphertextHandle', () => {
    it('should identify valid handles', () => {
      expect(isCiphertextHandle('0x1234567890abcdef')).toBe(true);
      expect(isCiphertextHandle('0xabcdef1234567890abcdef1234567890')).toBe(true);
    });

    it('should reject invalid handles', () => {
      expect(isCiphertextHandle('invalid')).toBe(false);
      expect(isCiphertextHandle('0x')).toBe(false);
      expect(isCiphertextHandle('0xGGGG')).toBe(false);
    });
  });

  describe('isHexString', () => {
    it('should identify hex strings', () => {
      expect(isHexString('0x')).toBe(true);
      expect(isHexString('0x0')).toBe(true);
      expect(isHexString('0x1234abcd')).toBe(true);
    });

    it('should reject non-hex strings', () => {
      expect(isHexString('invalid')).toBe(false);
      expect(isHexString('0xGGGG')).toBe(false);
    });
  });

  describe('isBooleanLike', () => {
    it('should identify boolean-like values', () => {
      expect(isBooleanLike(true)).toBe(true);
      expect(isBooleanLike(false)).toBe(true);
      expect(isBooleanLike('true')).toBe(true);
      expect(isBooleanLike('false')).toBe(true);
      expect(isBooleanLike(1)).toBe(true);
      expect(isBooleanLike(0)).toBe(true);
      expect(isBooleanLike('1')).toBe(true);
      expect(isBooleanLike('0')).toBe(true);
    });

    it('should reject non-boolean values', () => {
      expect(isBooleanLike('yes')).toBe(false);
      expect(isBooleanLike(2)).toBe(false);
    });
  });

  describe('toBoolean', () => {
    it('should convert boolean-like to boolean', () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean(1)).toBe(true);
      expect(toBoolean(0)).toBe(false);
    });

    it('should throw for invalid values', () => {
      expect(() => toBoolean('invalid')).toThrow();
      expect(() => toBoolean(2)).toThrow();
    });
  });

  describe('isSafeInteger', () => {
    it('should identify safe integers', () => {
      expect(isSafeInteger(42)).toBe(true);
      expect(isSafeInteger(0)).toBe(true);
      expect(isSafeInteger(-1)).toBe(true);
    });

    it('should reject unsafe integers', () => {
      expect(isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
      expect(isSafeInteger(1.5)).toBe(false);
    });
  });

  describe('isUint8', () => {
    it('should validate uint8 range', () => {
      expect(isUint8(0)).toBe(true);
      expect(isUint8(255)).toBe(true);
      expect(isUint8(255n)).toBe(true);
    });

    it('should reject out of range', () => {
      expect(isUint8(-1)).toBe(false);
      expect(isUint8(256)).toBe(false);
    });
  });

  describe('isUint16', () => {
    it('should validate uint16 range', () => {
      expect(isUint16(0)).toBe(true);
      expect(isUint16(65535)).toBe(true);
    });

    it('should reject out of range', () => {
      expect(isUint16(-1)).toBe(false);
      expect(isUint16(65536)).toBe(false);
    });
  });

  describe('isUint32', () => {
    it('should validate uint32 range', () => {
      expect(isUint32(0)).toBe(true);
      expect(isUint32(4294967295)).toBe(true);
      expect(isUint32(4294967295n)).toBe(true);
    });

    it('should reject out of range', () => {
      expect(isUint32(-1)).toBe(false);
      expect(isUint32(4294967296n)).toBe(false);
    });
  });

  describe('isNetworkConfig', () => {
    it('should identify valid NetworkConfig', () => {
      const config = {
        chainId: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://eth-sepolia.public.blastapi.io',
      };
      expect(isNetworkConfig(config)).toBe(true);
    });

    it('should reject invalid configs', () => {
      expect(isNetworkConfig(null)).toBe(false);
      expect(isNetworkConfig({ chainId: 1 })).toBe(false);
      expect(isNetworkConfig({ name: 'Test' })).toBe(false);
    });
  });
});

describe('Assertions', () => {
  describe('assertDefined', () => {
    it('should pass for defined values', () => {
      expect(() => assertDefined('test')).not.toThrow();
      expect(() => assertDefined(0)).not.toThrow();
      expect(() => assertDefined(false)).not.toThrow();
    });

    it('should throw for null/undefined', () => {
      expect(() => assertDefined(null)).toThrow('required');
      expect(() => assertDefined(undefined)).toThrow('required');
    });

    it('should use custom message', () => {
      try {
        assertDefined(null, 'Custom error');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('Custom error');
      }
    });
  });

  describe('assertTrue', () => {
    it('should pass for true conditions', () => {
      expect(() => assertTrue(true)).not.toThrow();
      expect(() => assertTrue(1 === 1)).not.toThrow();
    });

    it('should throw for false conditions', () => {
      expect(() => assertTrue(false)).toThrow('Assertion failed');
      expect(() => assertTrue(1 === 2)).toThrow('Assertion failed');
    });

    it('should use custom message', () => {
      try {
        assertTrue(false, 'Custom assertion error');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('Custom assertion error');
      }
    });
  });
});

