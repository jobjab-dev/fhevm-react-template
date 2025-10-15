/**
 * EncryptedInput Component
 * 
 * Form input that automatically encrypts values before submission
 * Supports all FHE types with validation
 * 
 * @example
 * ```tsx
 * <EncryptedInput
 *   type="euint32"
 *   contractAddress="0x..."
 *   userAddress="0x..."
 *   onEncrypted={(result) => console.log('Encrypted!', result)}
 * />
 * ```
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useEncrypt } from '../../adapters/react';
import type { FheType, EncryptionResult, EncryptionValue } from '../../core';

export interface EncryptedInputProps {
  // FHE type
  type: FheType;
  
  // Required for encryption
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  
  // Callbacks
  onEncrypted?: (result: EncryptionResult) => void;
  onChange?: (value: string) => void;
  onError?: (error: Error) => void;
  
  // Input props
  placeholder?: string;
  disabled?: boolean;
  autoEncrypt?: boolean; // Encrypt on blur
  showEncryptButton?: boolean;
  
  // Styling
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  
  // Labels
  label?: string;
  encryptButtonLabel?: string;
  encryptingLabel?: string;
  
  // Validation
  min?: number | bigint;
  max?: number | bigint;
  required?: boolean;
  
  // Initial value
  defaultValue?: string;
}

/**
 * Get input type based on FHE type
 */
function getInputType(fheType: FheType): string {
  if (fheType === 'ebool') return 'checkbox';
  if (fheType === 'eaddress') return 'text';
  if (fheType.startsWith('ebytes')) return 'text';
  return 'number';
}

/**
 * Validate and parse input value
 */
function parseValue(value: string, type: FheType): EncryptionValue['value'] {
  if (type === 'ebool') {
    return value === 'true' || value === '1';
  }
  
  if (type === 'eaddress') {
    return value;
  }
  
  if (type.startsWith('ebytes')) {
    return value;
  }
  
  // Numeric types
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

/**
 * Get placeholder text
 */
function getPlaceholder(type: FheType): string {
  if (type === 'ebool') return 'true/false';
  if (type === 'eaddress') return '0x...';
  if (type.startsWith('ebytes')) return '0x...';
  
  const maxValues: Record<string, string> = {
    'euint8': '0-255',
    'euint16': '0-65535',
    'euint32': '0-4294967295',
    'euint64': '0-2^64-1',
    'euint128': '0-2^128-1',
    'euint256': '0-2^256-1',
  };
  
  return maxValues[type] || 'Enter value';
}

/**
 * EncryptedInput Component
 */
export function EncryptedInput({
  type,
  contractAddress,
  userAddress,
  onEncrypted,
  onChange,
  onError,
  placeholder,
  disabled = false,
  autoEncrypt = false,
  showEncryptButton = true,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  label,
  encryptButtonLabel = '🔒 Encrypt',
  encryptingLabel = 'Encrypting...',
  min,
  max,
  required = false,
  defaultValue = '',
}: EncryptedInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [localError, setLocalError] = useState<string | undefined>();
  const [encrypted, setEncrypted] = useState(false);

  const { encrypt, isEncrypting, error: encryptError } = useEncrypt({
    contractAddress,
    userAddress,
    onSuccess: (result) => {
      setEncrypted(true);
      setLocalError(undefined);
      onEncrypted?.(result);
    },
    onError: (err) => {
      setLocalError(err.message);
      onError?.(err);
    },
  });

  const inputType = useMemo(() => getInputType(type), [type]);
  const placeholderText = placeholder ?? getPlaceholder(type);

  // Validate value
  const isValid = useMemo(() => {
    if (!value && !required) return true;
    if (!value && required) return false;

    // Type-specific validation
    if (type === 'ebool') {
      return value === 'true' || value === 'false' || value === '0' || value === '1';
    }

    if (type === 'eaddress') {
      return /^0x[0-9a-fA-F]{40}$/.test(value);
    }

    if (type.startsWith('ebytes')) {
      if (!value.startsWith('0x')) return false;
      const expectedBytes = parseInt(type.replace('ebytes', ''));
      const actualBytes = (value.replace('0x', '').length) / 2;
      return actualBytes === expectedBytes;
    }

    // Numeric validation
    try {
      const numValue = BigInt(value);
      if (min !== undefined && numValue < BigInt(min)) return false;
      if (max !== undefined && numValue > BigInt(max)) return false;
      return true;
    } catch {
      return false;
    }
  }, [value, type, required, min, max]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = inputType === 'checkbox' ? String(e.target.checked) : e.target.value;
    setValue(newValue);
    setEncrypted(false);
    setLocalError(undefined);
    onChange?.(newValue);
  }, [inputType, onChange]);

  const handleEncrypt = useCallback(async () => {
    if (!isValid) {
      setLocalError('Invalid input value');
      return;
    }

    if (!value) {
      setLocalError('Value is required');
      return;
    }

    const parsedValue = parseValue(value, type);
    
    await encrypt({
      type,
      value: parsedValue,
    });
  }, [value, type, isValid, encrypt]);

  const handleBlur = useCallback(() => {
    if (autoEncrypt && value && isValid && !encrypted) {
      handleEncrypt();
    }
  }, [autoEncrypt, value, isValid, encrypted, handleEncrypt]);

  const errorMessage = encryptError?.message || localError;

  return (
    <div className={`fhevm-encrypted-input ${className}`}>
      {label && (
        <label className="fhevm-input-label">
          {label}
          {required && <span className="fhevm-required">*</span>}
        </label>
      )}
      
      <div className="fhevm-input-row">
        {inputType === 'checkbox' ? (
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || isEncrypting}
            className={`fhevm-input-checkbox ${inputClassName}`}
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholderText}
            disabled={disabled || isEncrypting}
            className={`fhevm-input-field ${inputClassName} ${!isValid && value ? 'fhevm-input-invalid' : ''}`}
            min={min !== undefined ? String(min) : undefined}
            max={max !== undefined ? String(max) : undefined}
            required={required}
          />
        )}

        {showEncryptButton && (
          <button
            type="button"
            onClick={handleEncrypt}
            disabled={disabled || isEncrypting || !value || !isValid || encrypted}
            className={`fhevm-encrypt-button ${buttonClassName}`}
          >
            {isEncrypting ? encryptingLabel : encrypted ? '✓ Encrypted' : encryptButtonLabel}
          </button>
        )}
      </div>

      <div className="fhevm-input-meta">
        <small className="fhevm-input-type">Type: {type}</small>
        {encrypted && (
          <small className="fhevm-input-status" style={{ color: '#10b981' }}>
            ✓ Value encrypted
          </small>
        )}
        {!isValid && value && (
          <small className="fhevm-input-validation" style={{ color: '#ef4444' }}>
            Invalid value for {type}
          </small>
        )}
      </div>

      {errorMessage && (
        <div className="fhevm-input-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

/**
 * Form group with multiple encrypted inputs
 */
export interface EncryptedFormProps {
  fields: Array<{
    name: string;
    type: FheType;
    label?: string;
    required?: boolean;
    defaultValue?: string;
  }>;
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  onSubmit: (encrypted: Record<string, EncryptionResult>) => void;
  submitLabel?: string;
  className?: string;
}

export function EncryptedForm({
  fields,
  contractAddress,
  userAddress,
  onSubmit,
  submitLabel = 'Submit',
  className = '',
}: EncryptedFormProps) {
  const [encryptedValues, setEncryptedValues] = useState<Record<string, EncryptionResult>>({});

  const handleEncrypted = useCallback((name: string, result: EncryptionResult) => {
    setEncryptedValues(prev => ({ ...prev, [name]: result }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all required fields are encrypted
    const allEncrypted = fields.every(field => 
      !field.required || encryptedValues[field.name]
    );

    if (allEncrypted) {
      onSubmit(encryptedValues);
    } else {
      alert('Please encrypt all required fields');
    }
  }, [fields, encryptedValues, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={`fhevm-encrypted-form ${className}`}>
      {fields.map(field => (
        <EncryptedInput
          key={field.name}
          type={field.type}
          label={field.label || field.name}
          required={field.required}
          defaultValue={field.defaultValue}
          contractAddress={contractAddress}
          userAddress={userAddress}
          onEncrypted={(result) => handleEncrypted(field.name, result)}
        />
      ))}
      
      <button type="submit" className="fhevm-form-submit">
        {submitLabel}
      </button>
    </form>
  );
}

/**
 * Styles (optional)
 */
export const EncryptedInputStyles = `
  .fhevm-encrypted-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .fhevm-input-label {
    font-weight: 500;
    color: #374151;
  }

  .fhevm-required {
    color: #ef4444;
    margin-left: 0.25rem;
  }

  .fhevm-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .fhevm-input-field {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
  }

  .fhevm-input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .fhevm-input-invalid {
    border-color: #ef4444;
  }

  .fhevm-encrypt-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    background-color: #3b82f6;
    color: white;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  .fhevm-encrypt-button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .fhevm-encrypt-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fhevm-input-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .fhevm-input-error {
    padding: 0.5rem;
    background-color: #fee2e2;
    border-radius: 0.375rem;
    color: #dc2626;
    font-size: 0.875rem;
  }

  .fhevm-encrypted-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .fhevm-form-submit {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.375rem;
    background-color: #10b981;
    color: white;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-start;
  }

  .fhevm-form-submit:hover {
    background-color: #059669;
  }
`;

