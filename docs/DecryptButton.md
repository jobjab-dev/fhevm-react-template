# DecryptButton

One-click decryption button with automatic EIP-712 signature management.

## Usage

```tsx
import { DecryptButton } from 'jobjab-fhevm-sdk/components/react';

<DecryptButton
  handle="0x..."
  contractAddress="0x..."
  signer={ethersSigner}
  showValue
/>
```

## Props

```typescript
interface DecryptButtonProps {
  // Required
  handle: string;
  contractAddress: `0x${string}`;
  signer: JsonRpcSigner;
  
  // Callbacks
  onSuccess?: (value: string | bigint | boolean) => void;
  onError?: (error: Error) => void;
  
  // Behavior
  autoDecrypt?: boolean;    // Auto-decrypt after signing
  showValue?: boolean;      // Display decrypted value
  durationDays?: number;    // Signature validity (default: 365)
  
  // UI Customization
  signLabel?: string;
  decryptLabel?: string;
  className?: string;
}
```

## Example

```tsx
function BalanceCard({ encryptedBalance, contractAddress }) {
  const signer = useEthersSigner();

  return (
    <div>
      <h3>Your Balance</h3>
      <DecryptButton
        handle={encryptedBalance}
        contractAddress={contractAddress}
        signer={signer}
        showValue
        autoDecrypt
        onSuccess={(value) => {
          console.log('Balance:', value);
        }}
      />
    </div>
  );
}
```

## Flow

1. User clicks button
2. Prompts EIP-712 signature (one time)
3. Auto-decrypts value
4. Shows decrypted value (if `showValue={true}`)

## Features

- ✅ Handles entire decrypt flow
- ✅ EIP-712 signature management
- ✅ Loading states
- ✅ Error handling
- ✅ Value display

## Security

- Only user with ACL permission can decrypt
- Signature cached for reuse
- Private key never exposed

