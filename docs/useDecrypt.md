# useDecrypt

React hook for decrypting values with EIP-712 signature management.

## Usage

```tsx
import { useDecrypt } from 'jobjab-fhevm-sdk/adapters/react';

const { decrypt, isDecrypting, data } = useDecrypt({
  requests: [{ handle: '0x...', contractAddress: '0x...' }],
  signature: signature,
});
```

## Parameters

```typescript
interface UseDecryptOptions {
  requests: DecryptionRequest[];
  signature: DecryptionSignature;
  enabled?: boolean;                     // Auto-decrypt
  onSuccess?: (result: DecryptionResult) => void;
  onError?: (error: Error) => void;
}
```

### DecryptionRequest

```typescript
interface DecryptionRequest {
  handle: string;
  contractAddress: `0x${string}`;
}
```

## Returns

```typescript
{
  decrypt: () => Promise<DecryptionResult | undefined>;
  isDecrypting: boolean;
  error: Error | undefined;
  data: DecryptionResult | undefined;
  reset: () => void;
}
```

## Example

```tsx
function BalanceView({ handle, contractAddress, signature }) {
  const { decrypt, isDecrypting, data } = useDecrypt({
    requests: [{ handle, contractAddress }],
    signature,
    enabled: true,  // Auto-decrypt when signature available
  });

  if (isDecrypting) return <div>Decrypting...</div>;
  if (data) return <div>Balance: {String(data[handle])}</div>;
  
  return <button onClick={decrypt}>Decrypt Balance</button>;
}
```

## Requirements

- User must have ACL permission (set in contract with `FHE.allow()`)
- Valid EIP-712 signature required
- Signature must not be expired

## See Also

- [useDecryptionSignature](useDecryptionSignature.md)
- [DecryptionSignature](DecryptionSignature.md)

