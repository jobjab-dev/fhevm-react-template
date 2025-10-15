# EncryptedInput

Ready-to-use React component for encrypted form inputs.

## Usage

```tsx
import { EncryptedInput } from 'jobjab-fhevm-sdk/components/react';

<EncryptedInput
  type="euint32"
  contractAddress="0x..."
  userAddress="0x..."
  onEncrypted={(result) => console.log(result)}
/>
```

## Props

```typescript
interface EncryptedInputProps {
  // Required
  type: FheType;
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  
  // Callbacks
  onEncrypted?: (result: EncryptionResult) => void;
  onChange?: (value: string) => void;
  onError?: (error: Error) => void;
  
  // UI
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  autoEncrypt?: boolean;         // Encrypt on blur
  showEncryptButton?: boolean;
  
  // Validation
  min?: number | bigint;
  max?: number | bigint;
  required?: boolean;
}
```

## Example

```tsx
function TransferForm() {
  const [encrypted, setEncrypted] = useState(null);

  return (
    <EncryptedInput
      type="euint64"
      contractAddress={tokenAddress}
      userAddress={address}
      label="Transfer Amount"
      onEncrypted={(result) => {
        setEncrypted(result);
        // Call contract with result.handles[0] and result.inputProof
      }}
      required
      autoEncrypt
    />
  );
}
```

## Features

- ✅ Auto-validates input based on FHE type
- ✅ Shows encryption progress
- ✅ Displays encrypted status
- ✅ Type-specific validation (range checks)
- ✅ Error messages

## Validation

Automatically validates:
- `euint8`: 0-255
- `euint32`: 0-4,294,967,295
- `ebool`: true/false only
- `eaddress`: Valid Ethereum address

**Invalid input = button disabled + error shown**

