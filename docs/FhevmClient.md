# FhevmClient

Main client class for FHEVM operations.

## Constructor

```typescript
const client = createFhevmClient(config: FhevmClientConfig)
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `config` | `FhevmClientConfig` | Client configuration |

### FhevmClientConfig

```typescript
interface FhevmClientConfig {
  network: string | NetworkConfig;  // 'sepolia' or custom config
  provider?: any | string;           // EIP-1193 provider or RPC URL
  mockChains?: Record<number, string>;
  autoInit?: boolean;                // Default: true
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | `FhevmClientStatus` | Current client status |
| `instance` | `FhevmInstance \| undefined` | Underlying FHEVM instance |
| `isReady` | `boolean` | Whether client is ready |

## Methods

### init()

Initialize the FHEVM client.

```typescript
await client.init()
```

### encrypt()

Encrypt a single value.

```typescript
const result = await client.encrypt(
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  value: EncryptionValue
)
```

**Returns:** `EncryptionResult`

### encryptBatch()

Encrypt multiple values (3-5x faster).

```typescript
const result = await client.encryptBatch(
  contractAddress: `0x${string}`,
  userAddress: `0x${string}`,
  values: EncryptionValue[]
)
```

**Returns:** `EncryptionResult`

### decrypt()

Decrypt with EIP-712 signature.

```typescript
const decrypted = await client.decrypt(
  requests: DecryptionRequest[],
  signature: DecryptionSignature
)
```

**Returns:** `DecryptionResult`

### publicDecrypt()

Decrypt public value (no signature).

```typescript
const value = await client.publicDecrypt(
  handle: string,
  contractAddress: `0x${string}`
)
```

**Returns:** `bigint | boolean | string`

## Example

```typescript
import { createFhevmClient } from 'jobjab-fhevm-sdk';

const client = createFhevmClient({ network: 'sepolia' });
await client.init();

const result = await client.encrypt(
  '0xContract',
  '0xUser',
  { type: 'euint32', value: 42 }
);
```

