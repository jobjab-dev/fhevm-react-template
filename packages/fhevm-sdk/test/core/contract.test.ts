/**
 * Contract helpers tests
 */

import { describe, it, expect } from 'vitest';
import {
  isCiphertextHandle,
  isValidContractAddress,
  extractHandle,
} from '../../src/core/contract';

describe('Contract Helpers', () => {
  describe('isCiphertextHandle', () => {
    it('should return true for valid handles', () => {
      const validHandle = '0x' + '1234'.repeat(16); // 32 bytes
      expect(isCiphertextHandle(validHandle)).toBe(true);
    });

    it('should return false for zero hash', () => {
      const zeroHash = '0x' + '0'.repeat(64);
      expect(isCiphertextHandle(zeroHash)).toBe(false);
    });

    it('should return false for invalid lengths', () => {
      expect(isCiphertextHandle('0x1234')).toBe(false);
      expect(isCiphertextHandle('0x' + '1234'.repeat(20))).toBe(false);
    });

    it('should return false for non-hex strings', () => {
      expect(isCiphertextHandle('not-hex')).toBe(false);
      expect(isCiphertextHandle('0xGGGG')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isCiphertextHandle(null as any)).toBe(false);
      expect(isCiphertextHandle(undefined as any)).toBe(false);
      expect(isCiphertextHandle(123 as any)).toBe(false);
    });
  });

  describe('isValidContractAddress', () => {
    it('should return true for valid addresses', () => {
      expect(isValidContractAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidContractAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    });

    it('should return false for invalid addresses', () => {
      expect(isValidContractAddress('0x123')).toBe(false); // too short
      expect(isValidContractAddress('1234567890123456789012345678901234567890')).toBe(false); // no 0x
      expect(isValidContractAddress('0xGGGG')).toBe(false); // invalid hex
    });

    it('should return false for non-strings', () => {
      expect(isValidContractAddress(null as any)).toBe(false);
      expect(isValidContractAddress(undefined as any)).toBe(false);
      expect(isValidContractAddress(123 as any)).toBe(false);
    });
  });

  describe('extractHandle', () => {
    it('should extract handle from string result', () => {
      const handle = '0x' + '1234'.repeat(16);
      expect(extractHandle(handle)).toBe(handle);
    });

    it('should extract handle from object with handle property', () => {
      const handle = '0x' + '1234'.repeat(16);
      const result = { handle };
      expect(extractHandle(result)).toBe(handle);
    });

    it('should return null for invalid handles', () => {
      expect(extractHandle('0x123')).toBe(null);
      expect(extractHandle('not-a-handle')).toBe(null);
      expect(extractHandle(null)).toBe(null);
      expect(extractHandle(undefined)).toBe(null);
    });

    it('should return null for zero hash', () => {
      const zeroHash = '0x' + '0'.repeat(64);
      expect(extractHandle(zeroHash)).toBe(null);
    });
  });
});

