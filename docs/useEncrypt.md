# useEncrypt

React hook for encrypting values with loading states.

## Usage

```tsx
import { useEncrypt } from 'jobjab-fhevm-sdk/adapters/react';

function Component() {
  const { encrypt, isEncrypting, error, data } = useEncrypt({
    contractAddress: '0x...',
    userAddress: '0x...',
  });
}
```

## Parameters

```typescript
interface UseEncryptOptions {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  onSuccess?: (result: EncryptionResult) => void;
  onError?: (error: Error) => void;
}
```

## Returns

```typescript
{
  encrypt: (value: EncryptionValue) => Promise<EncryptionResult | undefined>;
  encryptBatch: (values: EncryptionValue[]) => Promise<EncryptionResult | undefined>;
  encryptStruct: <T>(struct: T) => Promise<{ result: EncryptionResult; fields: keyof T[] }>;
  isEncrypting: boolean;
  error: Error | undefined;
  data: EncryptionResult | undefined;
  reset: () => void;
}
```

## Example

```tsx
function TransferForm() {
  const { encrypt, isEncrypting } = useEncrypt({
    contractAddress: contract.address,
    userAddress: address,
    onSuccess: (result) => {
      console.log('Encrypted!', result.handles[0]);
    },
  });

  const handleTransfer = async () => {
    const result = await encrypt({ 
      type: 'euint64', 
      value: 1000n 
    });
    
    if (result) {
      await contract.transfer(
        recipient,
        result.handles[0],
        result.inputProof
      );
    }
  };

  return (
    <button onClick={handleTransfer} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Transfer'}
    </button>
  );
}
```

## See Also

- [useDecrypt](useDecrypt.md)
- [FhevmClient](FhevmClient.md)
- [EncryptionValue](EncryptionValue.md)

