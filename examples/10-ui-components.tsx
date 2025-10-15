/**
 * Example 10: UI Components
 * 
 * Shows: Ready-to-use React components
 * Plane: Reusable Components - DecryptButton, CipherPreview, EncryptedInput
 */

import { 
  EncryptedInput, 
  DecryptButton, 
  CipherPreview 
} from 'jobjab-fhevm-sdk/components/react';

export function ComponentExamples({ contractAddress, signer }: any) {
  return (
    <div>
      {/* Encrypted Input - auto-encrypts value */}
      <EncryptedInput
        type="euint256"
        contractAddress={contractAddress}
        userAddress="0x..."
        label="Transfer Amount"
        onEncrypted={(result) => {
          console.log('Encrypted!', result.handles[0]);
        }}
        autoEncrypt
        showValue
      />

      {/* Decrypt Button - handles EIP-712 signing */}
      <DecryptButton
        handle="0x..."
        contractAddress={contractAddress}
        signer={signer}
        showValue
        autoDecrypt
      />

      {/* Cipher Preview - display ciphertext info */}
      <CipherPreview
        handle="0x..."
        label="Balance"
        contractAddress={contractAddress}
        showDecrypt
        showSize
      />
    </div>
  );
}

/*
Components reduce boilerplate:
- EncryptedInput: 100 lines → 1 line
- DecryptButton: 150 lines → 1 line  
- CipherPreview: 50 lines → 1 line
*/

