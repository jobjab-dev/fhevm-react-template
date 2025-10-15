/**
 * CipherPreview Component
 * 
 * Display ciphertext handle information with visual feedback
 * Shows hex, size, format validation, and decryption status
 * 
 * @example
 * ```tsx
 * <CipherPreview
 *   handle="0x..."
 *   contractAddress="0x..."
 *   label="Balance"
 *   showDecrypt
 * />
 * ```
 */

'use client';

import React, { useMemo } from 'react';
import { isCiphertextHandle } from '../../core';

export interface CipherPreviewProps {
  // Required
  handle: string | undefined;
  
  // Optional display
  label?: string;
  contractAddress?: `0x${string}`;
  showSize?: boolean;
  showFormat?: boolean;
  showDecrypt?: boolean;
  compact?: boolean;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Custom render
  renderHandle?: (handle: string) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderInvalid?: (handle: string) => React.ReactNode;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate hex string with ellipsis
 */
function truncateHex(hex: string, startChars = 10, endChars = 8): string {
  if (hex.length <= startChars + endChars) return hex;
  return `${hex.slice(0, startChars)}...${hex.slice(-endChars)}`;
}

/**
 * CipherPreview Component
 */
export function CipherPreview({
  handle,
  label,
  contractAddress,
  showSize = true,
  showFormat = true,
  showDecrypt = false,
  compact = false,
  className = '',
  style,
  renderHandle,
  renderEmpty,
  renderInvalid,
}: CipherPreviewProps) {
  // Validation
  const isValid = useMemo(() => {
    if (!handle) return false;
    return isCiphertextHandle(handle);
  }, [handle]);

  const isEmpty = !handle || handle === '0x0000000000000000000000000000000000000000000000000000000000000000';

  // Handle size (32 bytes = 66 chars with 0x)
  const sizeInBytes = useMemo(() => {
    if (!handle) return 0;
    return (handle.replace('0x', '').length) / 2;
  }, [handle]);

  // Custom rendering
  if (isEmpty && renderEmpty) {
    return <>{renderEmpty()}</>;
  }

  if (!isValid && handle && renderInvalid) {
    return <>{renderInvalid(handle)}</>;
  }

  if (!handle || isEmpty) {
    return (
      <div className={`fhevm-cipher-preview fhevm-cipher-empty ${className}`} style={style}>
        <span className="fhevm-cipher-status">⚪ Uninitialized</span>
        {label && <span className="fhevm-cipher-label">{label}</span>}
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className={`fhevm-cipher-preview fhevm-cipher-invalid ${className}`} style={style}>
        <span className="fhevm-cipher-status">❌ Invalid Handle</span>
        {label && <span className="fhevm-cipher-label">{label}</span>}
        <code className="fhevm-cipher-handle">{truncateHex(handle)}</code>
      </div>
    );
  }

  // Valid ciphertext
  return (
    <div className={`fhevm-cipher-preview fhevm-cipher-valid ${compact ? 'fhevm-cipher-compact' : ''} ${className}`} style={style}>
      {label && <div className="fhevm-cipher-label">{label}</div>}
      
      <div className="fhevm-cipher-status-row">
        <span className="fhevm-cipher-status">🔒 Encrypted</span>
        {showFormat && <span className="fhevm-cipher-format">bytes32</span>}
        {showSize && <span className="fhevm-cipher-size">{formatBytes(sizeInBytes)}</span>}
      </div>

      {renderHandle ? (
        <div className="fhevm-cipher-custom">{renderHandle(handle)}</div>
      ) : (
        <code className="fhevm-cipher-handle" title={handle}>
          {compact ? truncateHex(handle, 8, 6) : truncateHex(handle)}
        </code>
      )}

      {contractAddress && (
        <div className="fhevm-cipher-contract">
          <small>Contract: {truncateHex(contractAddress, 8, 6)}</small>
        </div>
      )}

      {showDecrypt && (
        <div className="fhevm-cipher-hint">
          <small>💡 Use DecryptButton to reveal value</small>
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant
 */
export function CompactCipherPreview(props: Omit<CipherPreviewProps, 'compact'>) {
  return <CipherPreview {...props} compact />;
}

/**
 * Badge variant (inline display)
 */
export function CipherBadge({ handle, label }: Pick<CipherPreviewProps, 'handle' | 'label'>) {
  const isValid = handle ? isCiphertextHandle(handle) : false;
  const isEmpty = !handle || handle === '0x0000000000000000000000000000000000000000000000000000000000000000';

  let icon = '🔒';
  let status = 'Encrypted';
  let color = '#10b981';

  if (isEmpty) {
    icon = '⚪';
    status = 'Uninitialized';
    color = '#9ca3af';
  } else if (!isValid) {
    icon = '❌';
    status = 'Invalid';
    color = '#ef4444';
  }

  return (
    <span
      className="fhevm-cipher-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        backgroundColor: `${color}20`,
        color: color,
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span>{icon}</span>
      {label && <span>{label}:</span>}
      <span>{status}</span>
    </span>
  );
}

/**
 * Styles (optional)
 */
export const CipherPreviewStyles = `
  .fhevm-cipher-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
  }

  .fhevm-cipher-compact {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  .fhevm-cipher-label {
    font-weight: 600;
    color: #374151;
  }

  .fhevm-cipher-status-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .fhevm-cipher-status {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .fhevm-cipher-format,
  .fhevm-cipher-size {
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    background-color: #f3f4f6;
    color: #6b7280;
  }

  .fhevm-cipher-handle {
    padding: 0.5rem;
    background-color: #f9fafb;
    border-radius: 0.375rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    color: #1f2937;
    word-break: break-all;
    cursor: pointer;
  }

  .fhevm-cipher-handle:hover {
    background-color: #f3f4f6;
  }

  .fhevm-cipher-contract {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .fhevm-cipher-hint {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: #fef3c7;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: #92400e;
  }

  .fhevm-cipher-empty {
    border-color: #d1d5db;
    background-color: #f9fafb;
    opacity: 0.7;
  }

  .fhevm-cipher-invalid {
    border-color: #fca5a5;
    background-color: #fef2f2;
  }
`;

