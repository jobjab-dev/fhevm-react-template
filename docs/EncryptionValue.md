# EncryptionValue

Type definition for values to be encrypted.

## Type

```typescript
interface EncryptionValue {
  type: FheType;
  value: boolean | number | bigint | string;
}
```

## Properties

| Name | Type | Description |
|------|------|-------------|
| `type` | `FheType` | FHE encrypted type |
| `value` | `boolean \| number \| bigint \| string` | Value to encrypt |

## FheType

```typescript
type FheType =
  | 'ebool'
  | 'euint8' | 'euint16' | 'euint32' | 'euint64'
  | 'euint128' | 'euint256'
  | 'eaddress'
  | 'ebytes64' | 'ebytes128' | 'ebytes256';
```

## Type Ranges

| FheType | Value Range |
|---------|-------------|
| `ebool` | true / false |
| `euint8` | 0 to 255 |
| `euint16` | 0 to 65,535 |
| `euint32` | 0 to 4,294,967,295 |
| `euint64` | 0 to 2^64-1 |
| `euint128` | 0 to 2^128-1 |
| `euint256` | 0 to 2^256-1 |
| `eaddress` | Ethereum address (20 bytes) |
| `ebytes*` | Fixed size bytes |

## Examples

```typescript
// Boolean
{ type: 'ebool', value: true }

// Small number
{ type: 'euint8', value: 255 }

// Large number
{ type: 'euint256', value: 1000000n }

// Address
{ type: 'eaddress', value: '0x1234...' }
```

## Validation

SDK automatically validates:
- Value fits in type range
- Correct type for value
- No negative numbers for unsigned integers

**Throws:** `FhevmError` with code `ENCRYPT_2001` if invalid

