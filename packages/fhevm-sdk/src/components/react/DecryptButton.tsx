/**
 * DecryptButton Component
 * 
 * Ready-to-use button component for decryption with EIP-712 signing
 * Handles the entire decryption flow including signature management
 * 
 * @example
 * ```tsx
 * <DecryptButton
 *   handle="0x..."
 *   contractAddress="0x..."
 *   signer={ethersSigner}
 *   onSuccess={(value) => console.log('Decrypted:', value)}
 * />
 * ```
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useDecryptionSignature, useDecrypt } from '../../adapters/react';
import type { DecryptionResult } from '../../core';

export interface DecryptButtonProps {
  // Required props
  handle: string;
  contractAddress: `0x${string}`;
  signer: any; // ethers signer
  
  // Optional callbacks
  onSuccess?: (value: string | bigint | boolean) => void;
  onError?: (error: Error) => void;
  onSignatureCreated?: () => void;
  
  // Optional customization
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  
  // Custom labels
  signLabel?: string;
  decryptLabel?: string;
  signingLabel?: string;
  decryptingLabel?: string;
  
  // Auto-decrypt after signing
  autoDecrypt?: boolean;
  
  // Show value inline
  showValue?: boolean;
  
  // Storage for caching signature
  storage?: any;
  
  // Signature duration
  durationDays?: number;
  
  // Children (for custom button content)
  children?: React.ReactNode;
}

/**
 * DecryptButton - All-in-one decryption button
 */
export function DecryptButton({
  handle,
  contractAddress,
  signer,
  onSuccess,
  onError,
  onSignatureCreated,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  signLabel = 'Sign for Decryption',
  decryptLabel = 'Decrypt',
  signingLabel = 'Signing...',
  decryptingLabel = 'Decrypting...',
  autoDecrypt = true,
  showValue = true,
  storage,
  durationDays = 365,
}: DecryptButtonProps) {
  const [decryptedValue, setDecryptedValue] = useState<string | bigint | boolean | undefined>();
  const [localError, setLocalError] = useState<string | undefined>();

  // Step 1: Get/create signature
  const {
    signature,
    sign,
    isSigning,
    isValid,
    error: signError,
  } = useDecryptionSignature({
    contractAddresses: [contractAddress],
    signer,
    durationDays,
    onSuccess: () => {
      onSignatureCreated?.();
      if (autoDecrypt) {
        // Will trigger decrypt via useEffect
      }
    },
    onError: (err) => {
      setLocalError(err.message);
      onError?.(err);
    },
  });

  // Step 2: Decrypt with signature
  const {
    decrypt,
    isDecrypting,
    data,
    error: decryptError,
  } = useDecrypt({
    requests: [{ handle, contractAddress }],
    signature: signature!,
    enabled: Boolean(signature && isValid && autoDecrypt),
    onSuccess: (result: DecryptionResult) => {
      const value = result[handle];
      setDecryptedValue(value);
      if (value !== undefined) {
        onSuccess?.(value);
      }
    },
    onError: (err) => {
      setLocalError(err.message);
      onError?.(err);
    },
  });

  const handleClick = useCallback(() => {
    setLocalError(undefined);
    
    if (!signature) {
      sign();
    } else if (!autoDecrypt) {
      decrypt();
    }
  }, [signature, sign, decrypt, autoDecrypt]);

  // Determine button state
  const isLoading = isSigning || isDecrypting;
  const hasError = Boolean(signError || decryptError || localError);
  const errorMessage = signError?.message || decryptError?.message || localError;

  // Determine button label
  let buttonLabel = signLabel;
  if (isSigning) buttonLabel = signingLabel;
  else if (signature && !autoDecrypt) buttonLabel = decryptLabel;
  else if (isDecrypting) buttonLabel = decryptingLabel;

  // Show value if decrypted
  const displayValue = decryptedValue ?? (data ? data[handle] : undefined);

  return (
    <div className="fhevm-decrypt-button-container">
      <button
        onClick={handleClick}
        disabled={isLoading || (signature && autoDecrypt && !isDecrypting)}
        className={`fhevm-decrypt-button ${className} ${isLoading ? loadingClassName : ''} ${hasError ? errorClassName : ''}`}
        type="button"
      >
        {buttonLabel}
      </button>
      
      {showValue && displayValue !== undefined && (
        <div className="fhevm-decrypted-value">
          <strong>Value:</strong> {String(displayValue)}
        </div>
      )}
      
      {hasError && (
        <div className="fhevm-error-message" style={{ color: 'red', marginTop: '0.5rem' }}>
          Error: {errorMessage}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal DecryptButton variant (just the button, no state display)
 */
export interface MinimalDecryptButtonProps extends Omit<DecryptButtonProps, 'showValue'> {
  children?: React.ReactNode;
}

export function MinimalDecryptButton({
  children,
  className = '',
  loadingClassName = '',
  ...props
}: MinimalDecryptButtonProps) {
  return (
    <DecryptButton
      {...props}
      showValue={false}
      className={className}
      loadingClassName={loadingClassName}
    >
      {children}
    </DecryptButton>
  );
}

/**
 * Styles (optional, can be overridden)
 */
export const DecryptButtonStyles = `
  .fhevm-decrypt-button-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .fhevm-decrypt-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    background-color: #3b82f6;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .fhevm-decrypt-button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .fhevm-decrypt-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fhevm-decrypted-value {
    padding: 0.5rem;
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    font-family: monospace;
  }

  .fhevm-error-message {
    padding: 0.5rem;
    background-color: #fee2e2;
    border-radius: 0.375rem;
    color: #dc2626;
  }
`;

