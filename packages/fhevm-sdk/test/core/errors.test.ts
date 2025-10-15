/**
 * Error handling tests
 */

import { describe, it, expect } from 'vitest';
import {
  FhevmError,
  FhevmErrorCode,
  isFhevmError,
  formatErrorMessage,
  createEncryptionError,
  createDecryptionError,
} from '../../src/core/errors';

describe('Error Handling', () => {
  describe('FhevmError', () => {
    it('should create error with code and message', () => {
      const error = new FhevmError({
        code: FhevmErrorCode.ENCRYPTION_FAILED,
        message: 'Test error',
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(FhevmError);
      expect(error.code).toBe(FhevmErrorCode.ENCRYPTION_FAILED);
      expect(error.message).toBe('Test error');
    });

    it('should include suggestion', () => {
      const error = new FhevmError({
        code: FhevmErrorCode.WALLET_NOT_CONNECTED,
        message: 'Wallet not found',
        suggestion: 'Please connect your wallet',
      });

      expect(error.suggestion).toBe('Please connect your wallet');
    });

    it('should include context', () => {
      const error = new FhevmError({
        code: FhevmErrorCode.ENCRYPTION_FAILED,
        message: 'Failed',
        context: { type: 'euint32', value: 42 },
      });

      expect(error.context).toEqual({ type: 'euint32', value: 42 });
    });

    it('should serialize to JSON', () => {
      const error = new FhevmError({
        code: FhevmErrorCode.INIT_FAILED,
        message: 'Init failed',
        suggestion: 'Check config',
      });

      const json = error.toJSON();
      expect(json.name).toBe('FhevmError');
      expect(json.code).toBe(FhevmErrorCode.INIT_FAILED);
      expect(json.message).toBe('Init failed');
      expect(json.suggestion).toBe('Check config');
    });
  });

  describe('isFhevmError', () => {
    it('should return true for FhevmError instances', () => {
      const error = new FhevmError({
        code: FhevmErrorCode.ENCRYPTION_FAILED,
        message: 'Test',
      });

      expect(isFhevmError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');
      expect(isFhevmError(error)).toBe(false);
    });

    it('should return false for non-errors', () => {
      expect(isFhevmError('string')).toBe(false);
      expect(isFhevmError(null)).toBe(false);
      expect(isFhevmError(undefined)).toBe(false);
      expect(isFhevmError({})).toBe(false);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format FhevmError with suggestion', () => {
      const error = new FhevmError({
        code: FhevmErrorCode.ENCRYPTION_FAILED,
        message: 'Encryption failed',
        suggestion: 'Check your input',
      });

      const formatted = formatErrorMessage(error);
      expect(formatted).toContain('[ENCRYPT_2000]');
      expect(formatted).toContain('Encryption failed');
      expect(formatted).toContain('💡 Suggestion: Check your input');
    });

    it('should format regular errors', () => {
      const error = new Error('Regular error');
      const formatted = formatErrorMessage(error);
      expect(formatted).toBe('Regular error');
    });

    it('should format non-error values', () => {
      expect(formatErrorMessage('string error')).toBe('string error');
      expect(formatErrorMessage(42)).toBe('42');
    });
  });

  describe('Error factory functions', () => {
    it('should create encryption error', () => {
      const error = createEncryptionError('Failed to encrypt', { type: 'euint32' });
      
      expect(error).toBeInstanceOf(FhevmError);
      expect(error.code).toBe(FhevmErrorCode.ENCRYPTION_FAILED);
      expect(error.message).toBe('Failed to encrypt');
      expect(error.context).toEqual({ type: 'euint32' });
      expect(error.suggestion).toBeTruthy();
    });

    it('should create decryption error', () => {
      const error = createDecryptionError('Failed to decrypt', { handle: '0x123' });
      
      expect(error).toBeInstanceOf(FhevmError);
      expect(error.code).toBe(FhevmErrorCode.DECRYPTION_FAILED);
      expect(error.message).toBe('Failed to decrypt');
      expect(error.context).toEqual({ handle: '0x123' });
      expect(error.suggestion).toBeTruthy();
    });
  });
});

