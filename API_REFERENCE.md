# 📖 API Reference

Complete API documentation for FHEVM SDK.

## 🎯 Core API

### `createFhevmClient(config)`

Create a new FHEVM client instance.

**Parameters:**
- `config: FhevmClientConfig`
  - `network: string | NetworkConfig` - Network name or custom config
  - `provider?: any | string` - EIP-1193 provider or RPC URL
  - `mockChains?: Record<number, string>` - Mock chain configurations
  - `autoInit?: boolean` - Auto-initialize (default: true)

**Returns:** `FhevmClient`

**Example:**
```typescript
const client = createFhevmClient({
  network: 'sepolia',
  provider: window.ethereum,
});
```

---

### `FhevmClient`

Main client class for FHEVM operations.

#### Properties

- `status: FhevmClientStatus` - Current client status
- `instance: FhevmInstance | undefined` - Underlying FHEVM instance
- `network: NetworkConfig | undefined` - Network configuration
- `isReady: boolean` - Whether client is ready for operations

#### Methods

##### `init(): Promise<void>`

Initialize the FHEVM client.

**Example:**
```typescript
await client.init();
```

##### `disconnect(): Promise<void>`

Disconnect and cleanup resources.

**Example:**
```typescript
await client.disconnect();
```

##### `encrypt(contractAddress, userAddress, value): Promise<EncryptionResult>`

Encrypt a single value.

**Parameters:**
- `contractAddress: 0x${string}` - Contract address
- `userAddress: 0x${string}` - User address
- `value: EncryptionValue` - Value to encrypt

**Returns:** `EncryptionResult`

**Example:**
```typescript
const result = await client.encrypt(
  '0xContract',
  '0xUser',
  { type: 'euint32', value: 42 }
);
```

##### `encryptBatch(contractAddress, userAddress, values): Promise<EncryptionResult>`

Encrypt multiple values in batch (3-5x faster).

**Parameters:**
- `contractAddress: 0x${string}`
- `userAddress: 0x${string}`
- `values: EncryptionValue[]`

**Returns:** `EncryptionResult`

**Example:**
```typescript
const result = await client.encryptBatch(addr, user, [
  { type: 'euint32', value: 100 },
  { type: 'euint64', value: 20000n },
]);
```

##### `decrypt(requests, signature): Promise<DecryptionResult>`

Decrypt values with EIP-712 signature.

**Parameters:**
- `requests: DecryptionRequest[]`
- `signature: DecryptionSignature`

**Returns:** `DecryptionResult`

**Example:**
```typescript
const decrypted = await client.decrypt(
  [{ handle: '0x...', contractAddress: '0x...' }],
  signature
);
```

##### `publicDecrypt(handle, contractAddress): Promise<bigint | boolean | string>`

Decrypt publicly visible value (no signature required).

**Parameters:**
- `handle: string`
- `contractAddress: 0x${string}`

**Returns:** Decrypted value

**Example:**
```typescript
const value = await client.publicDecrypt('0x...', '0x...');
```

##### `generateKeypair(): { publicKey: string; privateKey: string }`

Generate keypair for decryption.

**Returns:** Keypair object

**Example:**
```typescript
const { publicKey, privateKey } = client.generateKeypair();
```

##### `createEIP712(publicKey, contracts, timestamp?, days?): any`

Create EIP-712 message for decryption signature.

**Parameters:**
- `publicKey: string`
- `contractAddresses: 0x${string}[]`
- `startTimestamp?: number` - Default: now
- `durationDays?: number` - Default: 365

**Returns:** EIP-712 object

**Example:**
```typescript
const eip712 = client.createEIP712(
  publicKey,
  ['0xContract'],
  Math.floor(Date.now() / 1000),
  365
);
```

---

## ⚛️ React API

### `<FhevmProvider>`

Context provider for FHEVM client.

**Props:**
- `config: FhevmProviderConfig` - Client configuration
- `children: ReactNode` - Child components
- `onStatusChange?: (status) => void` - Status change callback
- `onError?: (error) => void` - Error callback
- `onConnected?: () => void` - Connected callback

**Example:**
```tsx
<FhevmProvider
  config={{ network: 'sepolia', provider: window.ethereum }}
  onStatusChange={(status) => console.log('Status:', status)}
>
  <App />
</FhevmProvider>
```

---

### `useFhevmClient()`

Access FHEVM client from context (throws if not ready).

**Returns:** `FhevmClient`

**Example:**
```tsx
function Component() {
  const client = useFhevmClient();
  // client is guaranteed to be ready
}
```

---

### `useFhevmContext()`

Access FHEVM context (safer than `useFhevmClient`).

**Returns:** 
```typescript
{
  client: FhevmClient | undefined;
  status: FhevmClientStatus;
  isReady: boolean;
  error: Error | undefined;
  reconnect: () => Promise<void>;
}
```

**Example:**
```tsx
function Component() {
  const { client, isReady, status } = useFhevmContext();
  
  if (!isReady) return <Loading />;
  // Use client
}
```

---

### `useEncrypt(options)`

Hook for encrypting values.

**Options:**
- `contractAddress?: 0x${string}`
- `userAddress?: 0x${string}`
- `onSuccess?: (result) => void`
- `onError?: (error) => void`

**Returns:**
```typescript
{
  encrypt: (value: EncryptionValue) => Promise<EncryptionResult | undefined>;
  encryptBatch: (values: EncryptionValue[]) => Promise<EncryptionResult | undefined>;
  encryptStruct: <T>(struct: T) => Promise<...>;
  isEncrypting: boolean;
  error: Error | undefined;
  data: EncryptionResult | undefined;
  reset: () => void;
}
```

**Example:**
```tsx
const { encrypt, isEncrypting, error } = useEncrypt({
  contractAddress: '0x...',
  userAddress: '0x...',
  onSuccess: (result) => console.log('Done!', result),
});

await encrypt({ type: 'euint32', value: 42 });
```

---

### `useDecrypt(options)`

Hook for decrypting values.

**Options:**
- `requests: DecryptionRequest[]`
- `signature: DecryptionSignature`
- `enabled?: boolean` - Auto-decrypt (default: false)
- `onSuccess?: (result) => void`
- `onError?: (error) => void`

**Returns:**
```typescript
{
  decrypt: () => Promise<DecryptionResult | undefined>;
  isDecrypting: boolean;
  error: Error | undefined;
  data: DecryptionResult | undefined;
  reset: () => void;
}
```

**Example:**
```tsx
const { decrypt, isDecrypting, data } = useDecrypt({
  requests: [{ handle: '0x...', contractAddress: '0x...' }],
  signature,
  enabled: true, // Auto-decrypt
});
```

---

### `useDecryptionSignature(options)`

Hook for managing decryption signatures.

**Options:**
- `contractAddresses: 0x${string}[]`
- `signer: any` - Ethers signer
- `storage?: any` - Storage for caching
- `durationDays?: number` - Signature validity (default: 365)
- `onSuccess?: (sig) => void`
- `onError?: (error) => void`

**Returns:**
```typescript
{
  signature: DecryptionSignature | undefined;
  sign: () => Promise<DecryptionSignature | undefined>;
  isSigning: boolean;
  isValid: boolean;
  error: Error | undefined;
}
```

**Example:**
```tsx
const { signature, sign, isSigning, isValid } = useDecryptionSignature({
  contractAddresses: ['0x...'],
  signer,
});

if (!signature) {
  await sign(); // Prompts user to sign
}
```

---

## 🎨 Components API

### `<EncryptedInput>`

Form input with automatic encryption.

**Props:**
- `type: FheType` - FHE type
- `contractAddress: 0x${string}`
- `userAddress: 0x${string}`
- `onEncrypted?: (result) => void`
- `onChange?: (value: string) => void`
- `label?: string`
- `placeholder?: string`
- `disabled?: boolean`
- `autoEncrypt?: boolean`
- `required?: boolean`

**Example:**
```tsx
<EncryptedInput
  type="euint32"
  contractAddress="0x..."
  userAddress="0x..."
  onEncrypted={(result) => console.log(result)}
  label="Amount"
  required
/>
```

---

### `<DecryptButton>`

Button for decryption with signature management.

**Props:**
- `handle: string` - Ciphertext handle
- `contractAddress: 0x${string}`
- `signer: any` - Ethers signer
- `onSuccess?: (value) => void`
- `onError?: (error) => void`
- `autoDecrypt?: boolean` - Auto-decrypt after signing
- `showValue?: boolean` - Display decrypted value

**Example:**
```tsx
<DecryptButton
  handle="0x..."
  contractAddress="0x..."
  signer={signer}
  onSuccess={(value) => alert(`Value: ${value}`)}
  showValue
/>
```

---

### `<CipherPreview>`

Display ciphertext information.

**Props:**
- `handle: string | undefined`
- `label?: string`
- `contractAddress?: 0x${string}`
- `showSize?: boolean`
- `showFormat?: boolean`
- `compact?: boolean`

**Example:**
```tsx
<CipherPreview
  handle="0x..."
  label="Balance"
  contractAddress="0x..."
  showDecrypt
/>
```

---

## 🛠️ Utility Functions

### Encryption Utils

```typescript
import {
  validateEncryptionValue,
  toHex,
  formatEncryptionResult,
} from 'jobjab-fhevm-sdk/core';

// Validate value before encryption
validateEncryptionValue({ type: 'euint32', value: 42 });

// Convert to hex
const hex = toHex(uint8Array);

// Format for contract
const { handle, proof } = formatEncryptionResult(encryptionResult);
```

### Contract Utils

```typescript
import {
  isCiphertextHandle,
  isValidContractAddress,
  findEncryptedInputs,
  buildContractParams,
} from 'jobjab-fhevm-sdk/core';

// Validate handle
if (isCiphertextHandle(value)) {
  console.log('This is encrypted');
}

// Validate address
if (isValidContractAddress(address)) {
  console.log('Valid address');
}

// Parse ABI
const encryptedInputs = findEncryptedInputs(abi, 'myFunction');

// Build params
const params = buildContractParams(encrypted, abi, 'myFunction');
```

### Error Utils

```typescript
import {
  isFhevmError,
  formatErrorMessage,
  FhevmErrorCode,
} from 'jobjab-fhevm-sdk/core';

// Check error type
if (isFhevmError(error)) {
  console.log(error.code);
  console.log(formatErrorMessage(error));
}
```

---

## 📊 Types Reference

### `FheType`

```typescript
type FheType =
  | 'ebool'
  | 'euint8' | 'euint16' | 'euint32' | 'euint64'
  | 'euint128' | 'euint256'
  | 'eaddress'
  | 'ebytes64' | 'ebytes128' | 'ebytes256';
```

### `EncryptionValue`

```typescript
interface EncryptionValue {
  type: FheType;
  value: boolean | number | bigint | string;
}
```

### `EncryptionResult`

```typescript
interface EncryptionResult {
  handles: Uint8Array[];
  inputProof: Uint8Array;
}
```

### `DecryptionRequest`

```typescript
interface DecryptionRequest {
  handle: string;
  contractAddress: `0x${string}`;
}
```

### `DecryptionSignature`

```typescript
interface DecryptionSignature {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
}
```

---

## 🔗 See Also

- [Quick Start Guide](QUICKSTART.md)
- [Cookbook](COOKBOOK.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [SDK README](packages/fhevm-sdk/README.md)

---

**Made with 📖 for comprehensive documentation**

