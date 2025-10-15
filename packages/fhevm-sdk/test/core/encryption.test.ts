/**
 * Encryption utilities tests
 */

import { describe, it, expect } from 'vitest';
import {
  getEncryptionMethod,
  externalTypeToFheType,
  validateEncryptionValue,
  toHex,
} from '../../src/core/encryption';
import type { FheType } from '../../src/core/types';

describe('Encryption Utilities', () => {
  describe('getEncryptionMethod', () => {
    it('should map ebool to addBool', () => {
      expect(getEncryptionMethod('ebool')).toBe('addBool');
    });

    it('should map euint types correctly', () => {
      expect(getEncryptionMethod('euint8')).toBe('add8');
      expect(getEncryptionMethod('euint16')).toBe('add16');
      expect(getEncryptionMethod('euint32')).toBe('add32');
      expect(getEncryptionMethod('euint64')).toBe('add64');
    });

    it('should map eaddress to addAddress', () => {
      expect(getEncryptionMethod('eaddress')).toBe('addAddress');
    });

    it('should throw for invalid type', () => {
      expect(() => getEncryptionMethod('invalid' as FheType)).toThrow();
    });
  });

  describe('externalTypeToFheType', () => {
    it('should convert external types to FHE types', () => {
      expect(externalTypeToFheType('externalEbool')).toBe('ebool');
      expect(externalTypeToFheType('externalEuint32')).toBe('euint32');
      expect(externalTypeToFheType('externalEaddress')).toBe('eaddress');
    });

    it('should default to euint64 for unknown types', () => {
      expect(externalTypeToFheType('unknown')).toBe('euint64');
    });
  });

  describe('validateEncryptionValue', () => {
    it('should validate boolean values', () => {
      expect(() => validateEncryptionValue({ type: 'ebool', value: true })).not.toThrow();
      expect(() => validateEncryptionValue({ type: 'ebool', value: false })).not.toThrow();
      expect(() => validateEncryptionValue({ type: 'ebool', value: 'invalid' as any })).toThrow();
    });

    it('should validate uint values', () => {
      expect(() => validateEncryptionValue({ type: 'euint8', value: 255 })).not.toThrow();
      expect(() => validateEncryptionValue({ type: 'euint8', value: 256 })).toThrow();
      expect(() => validateEncryptionValue({ type: 'euint32', value: 4294967295n })).not.toThrow();
    });

    it('should validate address values', () => {
      expect(() => validateEncryptionValue({ 
        type: 'eaddress', 
        value: '0x1234567890123456789012345678901234567890' 
      })).not.toThrow();
      expect(() => validateEncryptionValue({ type: 'eaddress', value: 'invalid' })).toThrow();
    });

    it('should reject negative values', () => {
      expect(() => validateEncryptionValue({ type: 'euint32', value: -1 })).toThrow();
    });
  });

  describe('toHex', () => {
    it('should convert Uint8Array to hex string', () => {
      const bytes = new Uint8Array([0x12, 0x34, 0x56]);
      expect(toHex(bytes)).toBe('0x123456');
    });

    it('should add 0x prefix if missing', () => {
      expect(toHex('1234')).toBe('0x1234');
    });

    it('should preserve 0x prefix', () => {
      expect(toHex('0x1234')).toBe('0x1234');
    });
  });
});

