# Error Codes

Complete list of error codes in FHEVM SDK.

## Initialization Errors (1xxx)

| Code | Name | Cause | Solution |
|------|------|-------|----------|
| `INIT_1000` | Init failed | Client initialization error | Check network config |
| `INIT_1001` | Invalid network | Unknown network name | Use 'sepolia' or custom config |
| `INIT_1002` | Invalid chain ID | Wrong chain ID | Verify chain ID matches network |
| `INIT_1003` | Provider not available | No provider | Connect wallet or provide RPC URL |
| `INIT_1004` | SDK load failed | Relayer SDK loading error | Check internet connection |

## Encryption Errors (2xxx)

| Code | Name | Cause | Solution |
|------|------|-------|----------|
| `ENCRYPT_2000` | Encryption failed | General encryption error | Check instance initialized |
| `ENCRYPT_2001` | Invalid input type | Wrong type for value | Match type to value (e.g., ebool = boolean) |
| `ENCRYPT_2002` | Invalid value | Value out of range | Check value fits in type (e.g., euint8 ≤ 255) |
| `ENCRYPT_2003` | Keypair generation failed | Cannot generate keys | Retry or reinitialize client |

## Decryption Errors (3xxx)

| Code | Name | Cause | Solution |
|------|------|-------|----------|
| `DECRYPT_3000` | Decryption failed | General decryption error | Check signature and permissions |
| `DECRYPT_3001` | Invalid ciphertext | Bad handle format | Verify handle is 32-byte hex |
| `DECRYPT_3002` | Signature required | Missing EIP-712 signature | Call `useDecryptionSignature()` first |
| `DECRYPT_3003` | Signature expired | Signature past validity | Request new signature |
| `DECRYPT_3004` | Signature invalid | Bad signature format | Re-sign EIP-712 message |
| `DECRYPT_3005` | ACL permission denied | No decrypt permission | Contract must call `FHE.allow()` |

## Wallet Errors (5xxx)

| Code | Name | Cause | Solution |
|------|------|-------|----------|
| `WALLET_5000` | Wallet not connected | No wallet | Connect MetaMask or wallet |
| `WALLET_5001` | Signature rejected | User cancelled | Retry - user must approve |
| `WALLET_5002` | EIP-712 not supported | Wallet doesn't support EIP-712 | Use compatible wallet |

## Network Errors (6xxx)

| Code | Name | Cause | Solution |
|------|------|-------|----------|
| `NETWORK_6000` | RPC error | RPC call failed | Check RPC URL and connection |
| `NETWORK_6001` | RPC not reachable | Cannot connect to RPC | Verify RPC endpoint |
| `NETWORK_6002` | Chain mismatch | Wrong chain | Switch wallet to correct network |
| `NETWORK_6003` | Unsupported chain | Chain not supported | Use Sepolia or localhost |

## Example

```typescript
import { isFhevmError, formatErrorMessage } from 'jobjab-fhevm-sdk';

try {
  await client.encrypt(...);
} catch (error) {
  if (isFhevmError(error)) {
    console.log('Code:', error.code);          // ENCRYPT_2001
    console.log('Message:', error.message);    // "Invalid input type"
    console.log('Suggestion:', error.suggestion); // "Match type to value..."
    
    // Formatted message
    console.log(formatErrorMessage(error));
  }
}
```

