# 📚 API Documentation

Complete API reference for jobjab-fhevm-sdk.

## 🎯 Core API

### Client

- [FhevmClient](FhevmClient.md) - Main client class
- [NetworkConfig](NetworkConfig.md) - Network configuration

### Types

- [EncryptionValue](EncryptionValue.md) - Input value types
- [DecryptionSignature](DecryptionSignature.md) - EIP-712 signature
- [ErrorCodes](ErrorCodes.md) - All error codes

### Functions

- [encrypt()](FhevmClient.md#encrypt) - Encrypt single value
- [encryptBatch()](FhevmClient.md#encryptbatch) - Batch encryption
- [encryptStruct()](FhevmClient.md#encryptstruct) - Struct encryption
- [decrypt()](FhevmClient.md#decrypt) - User decryption
- [publicDecrypt()](FhevmClient.md#publicdecrypt) - Public decryption

## ⚛️ React API

### Hooks

- [useEncrypt](useEncrypt.md) - Encryption hook
- [useDecrypt](useDecrypt.md) - Decryption hook
- [useDecryptionSignature](useDecryptionSignature.md) - Signature management
- [useFhevmClient](useFhevmClient.md) - Access client

### Components

- [EncryptedInput](EncryptedInput.md) - Auto-encrypting input
- [DecryptButton](DecryptButton.md) - One-click decrypt
- [CipherPreview](CipherPreview.md) - Display ciphertext

### Providers

- [FhevmProvider](FhevmProvider.md) - Context provider

## 🔧 Utilities

### Contract Helpers

- `isCiphertextHandle()` - Validate handle
- `isValidContractAddress()` - Validate address
- `findEncryptedInputs()` - Parse ABI
- `buildContractParams()` - Build params

### Performance

- `MemoryCache` - Caching with TTL
- `cached()` - Function memoization
- `BatchQueue` - Auto-batching

### Errors

- `isFhevmError()` - Type guard
- `formatErrorMessage()` - Format error
- [Error Codes](ErrorCodes.md) - All codes

## 📖 See Also

- [Examples](../examples/) - Runnable code
- [Cookbook](../COOKBOOK.md) - Recipes
- [Troubleshooting](../TROUBLESHOOTING.md) - Solutions

