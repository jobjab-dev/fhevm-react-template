/**
 * Validation utilities tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateAddress,
  validateHandle,
  validateFheType,
  validateUintValue,
  validateNonEmptyArray,
  validateRequired,
  validateRange,
  validateTimestamp,
  safeParseInt,
  safeBigInt,
} from '../../src/core/validation';

describe('validateAddress', () => {
  it('should accept valid addresses', () => {
    expect(() => validateAddress('0x0000000000000000000000000000000000000000')).not.toThrow();
    expect(() => validateAddress('0x1234567890123456789012345678901234567890')).not.toThrow();
    expect(() => validateAddress('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12')).not.toThrow();
  });

  it('should reject invalid addresses', () => {
    expect(() => validateAddress('')).toThrow('required');
    expect(() => validateAddress('invalid')).toThrow('0x');
    expect(() => validateAddress('0x123')).toThrow('42 characters');
    expect(() => validateAddress('0xGGGG000000000000000000000000000000000000')).toThrow('invalid characters');
  });

  it('should use custom name in error messages', () => {
    try {
      validateAddress('invalid', 'Contract Address');
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toContain('Contract Address');
    }
  });
});

describe('validateHandle', () => {
  it('should accept valid handles', () => {
    expect(() => validateHandle('0x1234567890abcdef')).not.toThrow();
  });

  it('should reject empty handles', () => {
    expect(() => validateHandle('')).toThrow('required');
    expect(() => validateHandle('', true)).not.toThrow(); // Allow empty
  });

  it('should reject zero handles', () => {
    expect(() => validateHandle('0x0000000000000000000000000000000000000000000000000000000000000000'))
      .toThrow('zero handle');
  });

  it('should reject non-hex handles', () => {
    expect(() => validateHandle('invalid')).toThrow('0x');
  });
});

describe('validateFheType', () => {
  it('should accept valid FHE types', () => {
    expect(validateFheType('ebool')).toBe(true);
    expect(validateFheType('euint8')).toBe(true);
    expect(validateFheType('euint32')).toBe(true);
    expect(validateFheType('euint256')).toBe(true);
    expect(validateFheType('eaddress')).toBe(true);
    expect(validateFheType('ebytes64')).toBe(true);
  });

  it('should reject invalid types', () => {
    expect(() => validateFheType('invalid')).toThrow('Invalid FHE type');
    expect(() => validateFheType('uint32')).toThrow('Invalid FHE type');
  });
});

describe('validateUintValue', () => {
  it('should accept valid values', () => {
    expect(() => validateUintValue('euint8', 0)).not.toThrow();
    expect(() => validateUintValue('euint8', 255)).not.toThrow();
    expect(() => validateUintValue('euint32', 4294967295n)).not.toThrow();
  });

  it('should reject negative values', () => {
    expect(() => validateUintValue('euint32', -1)).toThrow('non-negative');
  });

  it('should reject values exceeding maximum', () => {
    expect(() => validateUintValue('euint8', 256)).toThrow('exceeds maximum');
    expect(() => validateUintValue('euint32', 4294967296n)).toThrow('exceeds maximum');
  });

  it('should provide helpful error with max value', () => {
    try {
      validateUintValue('euint8', 256);
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toContain('255');
      expect(error.context?.hint).toContain('8 bits');
    }
  });
});

describe('validateNonEmptyArray', () => {
  it('should accept non-empty arrays', () => {
    expect(() => validateNonEmptyArray([1, 2, 3])).not.toThrow();
    expect(() => validateNonEmptyArray(['a'])).not.toThrow();
  });

  it('should reject empty arrays', () => {
    expect(() => validateNonEmptyArray([])).toThrow('cannot be empty');
  });

  it('should reject non-arrays', () => {
    expect(() => validateNonEmptyArray('not an array' as any)).toThrow('must be an array');
    expect(() => validateNonEmptyArray(null as any)).toThrow('must be an array');
  });
});

describe('validateRequired', () => {
  it('should return value if defined', () => {
    expect(validateRequired('test', 'Value')).toBe('test');
    expect(validateRequired(0, 'Number')).toBe(0);
    expect(validateRequired(false, 'Boolean')).toBe(false);
  });

  it('should throw for null/undefined', () => {
    expect(() => validateRequired(null, 'Value')).toThrow('required');
    expect(() => validateRequired(undefined, 'Value')).toThrow('required');
  });
});

describe('validateRange', () => {
  it('should accept values in range', () => {
    expect(() => validateRange(5, 0, 10)).not.toThrow();
    expect(() => validateRange(0, 0, 10)).not.toThrow();
    expect(() => validateRange(10, 0, 10)).not.toThrow();
  });

  it('should reject values out of range', () => {
    expect(() => validateRange(-1, 0, 10)).toThrow('out of range');
    expect(() => validateRange(11, 0, 10)).toThrow('out of range');
  });

  it('should provide helpful hints', () => {
    try {
      validateRange(100, 0, 10, 'Age');
      expect.fail('Should have thrown');
    } catch (error: any) {
      expect(error.message).toContain('Age');
      expect(error.context).toBeDefined();
      if (error.context?.hint) {
        expect(error.context.hint).toContain('between');
      }
    }
  });
});

describe('validateTimestamp', () => {
  it('should accept valid timestamps', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() => validateTimestamp(now)).not.toThrow();
    expect(() => validateTimestamp(0)).not.toThrow();
  });

  it('should reject non-integer timestamps', () => {
    expect(() => validateTimestamp(1234.56)).toThrow('integer');
  });

  it('should reject negative timestamps', () => {
    expect(() => validateTimestamp(-1)).toThrow('negative');
  });
});

describe('safeParseInt', () => {
  it('should parse valid integers', () => {
    expect(safeParseInt('42')).toBe(42);
    expect(safeParseInt('0')).toBe(0);
    expect(safeParseInt('-1')).toBe(-1);
  });

  it('should throw for invalid integers', () => {
    expect(() => safeParseInt('invalid')).toThrow('Cannot parse');
    expect(safeParseInt('12.34')).toBe(12); // parseInt truncates - this is OK
  });
});

describe('safeBigInt', () => {
  it('should convert to BigInt', () => {
    expect(safeBigInt('42')).toBe(42n);
    expect(safeBigInt(42)).toBe(42n);
    expect(safeBigInt(42n)).toBe(42n);
  });

  it('should throw for invalid values', () => {
    expect(() => safeBigInt('invalid')).toThrow('Cannot convert');
    expect(() => safeBigInt({} as any)).toThrow('Cannot convert');
  });
});

