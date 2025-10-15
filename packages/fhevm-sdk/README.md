# 🔐 Universal FHEVM SDK

**Framework-agnostic SDK for building confidential dApps with FHEVM (Fully Homomorphic Encryption Virtual Machine)**

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🎯 **Framework-Agnostic Core** - Use with React, Vue, Node.js, or vanilla JavaScript
- 🪝 **Wagmi-like API** - Familiar hook patterns for Web3 developers
- 🔐 **Complete FHE Support** - Encryption, decryption, and contract interactions
- 📦 **Zero Configuration** - Sensible defaults with full customization
- 🎨 **Type-Safe** - Full TypeScript support with comprehensive types
- ⚡ **Optimized** - Batch operations, caching, and performance-first design
- 🧪 **Well-Tested** - Comprehensive test suite for reliability
- 📚 **Great DX** - Excellent documentation and error messages

---

## 🚀 Quick Start (< 10 Lines!)

### React (with Hooks)

```tsx
import { FhevmProvider, useFhevmClient, useEncrypt } from '@fhevm-sdk/adapters/react';

// 1. Wrap your app with FhevmProvider
function App() {
  return (
    <FhevmProvider config={{ network: 'sepolia', provider: window.ethereum }}>
      <YourComponent />
    </FhevmProvider>
  );
}

// 2. Use hooks in your components
function YourComponent() {
  const client = useFhevmClient(); // Access FHEVM client
  const { encrypt, isEncrypting } = useEncrypt({
    contractAddress: '0x...',
    userAddress: '0x...',
  });
  
  const handleEncrypt = async () => {
    const result = await encrypt({ type: 'euint32', value: 42 });
    console.log('Encrypted!', result);
  };
  
  return <button onClick={handleEncrypt} disabled={isEncrypting}>Encrypt Value</button>;
}
```

### Vanilla JS/TypeScript

```typescript
import { createFhevmClient } from '@fhevm-sdk';

// 1. Create client
const client = await createFhevmClient({
  network: 'sepolia',
  provider: window.ethereum,
});

// 2. Encrypt a value
const result = await client.encrypt(
  '0xContractAddress',
  '0xUserAddress',
  { type: 'euint32', value: 42 }
);

// 3. Decrypt with signature
const decrypted = await client.decrypt(requests, signature);
```

---

## 📦 Installation

```bash
# Using pnpm
pnpm add @fhevm-sdk

# Using npm
npm install @fhevm-sdk

# Using yarn
yarn add @fhevm-sdk
```

### Peer Dependencies

```bash
pnpm add ethers @zama-fhe/relayer-sdk
```

For React projects:
```bash
pnpm add react
```

---

## 📖 Complete Usage Guide

### 1. Core Usage (Framework-Agnostic)

#### Initialize Client

```typescript
import { createFhevmClient, NETWORKS } from '@fhevm-sdk/core';

// Option 1: Use preset network
const client = createFhevmClient({
  network: 'sepolia', // or 'localhost'
  provider: window.ethereum,
  autoInit: true,
});

// Option 2: Custom network configuration
const client = createFhevmClient({
  network: {
    chainId: 11155111,
    name: 'My Custom Network',
    aclContractAddress: '0x...',
    kmsContractAddress: '0x...',
    // ... other config
  },
  provider: 'https://my-rpc.com',
});

// Wait for initialization
await client.init();
console.log('Client ready!', client.isReady);
```

#### Encrypt Values

```typescript
// Single value
const result = await client.encrypt(
  '0xContractAddress',
  '0xUserAddress',
  { type: 'euint32', value: 1000 }
);

// Batch encryption (more efficient)
const batchResult = await client.encryptBatch(
  '0xContractAddress',
  '0xUserAddress',
  [
    { type: 'euint32', value: 100 },
    { type: 'euint64', value: 20000n },
    { type: 'ebool', value: true },
  ]
);

// Struct encryption (named fields)
const structResult = await client.encryptStruct(
  '0xContractAddress',
  '0xUserAddress',
  {
    balance: { type: 'euint64', value: 5000n },
    isActive: { type: 'ebool', value: true },
  }
);

// Use the result
const { handle, proof, handles } = client.utils.formatEncryptionResult(result);
```

#### Decrypt Values

```typescript
// 1. Generate keypair and get signature
const keypair = client.generateKeypair();
const eip712 = client.createEIP712(
  keypair.publicKey,
  ['0xContractAddress'],
  Math.floor(Date.now() / 1000),
  365 // days
);

// 2. Sign with wallet
const signatureString = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
);

const signature = {
  publicKey: keypair.publicKey,
  privateKey: keypair.privateKey,
  signature: signatureString.replace('0x', ''),
  startTimestamp: Math.floor(Date.now() / 1000),
  durationDays: 365,
  userAddress: await signer.getAddress(),
  contractAddresses: ['0xContractAddress'],
};

// 3. Decrypt
const decrypted = await client.decrypt(
  [{ handle: '0x...', contractAddress: '0x...' }],
  signature
);

console.log('Decrypted value:', decrypted['0x...']);
```

#### Public Decryption

```typescript
// No signature required for public values
const value = await client.publicDecrypt(
  '0xHandle',
  '0xContractAddress'
);
```

---

### 2. React Usage

#### Setup Provider

```tsx
import { FhevmProvider } from '@fhevm-sdk/adapters/react';

function App() {
  return (
    <FhevmProvider 
      config={{ 
        network: 'sepolia',
        provider: window.ethereum,
      }}
      onStatusChange={(status) => console.log('Status:', status)}
      onError={(error) => console.error('Error:', error)}
      onConnected={() => console.log('Connected!')}
    >
      <YourApp />
    </FhevmProvider>
  );
}
```

#### useEncrypt Hook

```tsx
import { useEncrypt } from '@fhevm-sdk/adapters/react';

function EncryptComponent() {
  const { encrypt, encryptBatch, isEncrypting, error, data } = useEncrypt({
    contractAddress: '0x...',
    userAddress: '0x...',
    onSuccess: (result) => console.log('Encrypted!', result),
    onError: (error) => console.error('Failed:', error),
  });

  const handleEncrypt = async () => {
    await encrypt({ type: 'euint32', value: 42 });
  };

  const handleBatchEncrypt = async () => {
    await encryptBatch([
      { type: 'euint32', value: 100 },
      { type: 'ebool', value: true },
    ]);
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt'}
      </button>
      {error && <div>Error: {error.message}</div>}
      {data && <div>Success! Handle: {data.handles[0]}</div>}
    </div>
  );
}
```

#### useDecrypt Hook

```tsx
import { useDecrypt, useDecryptionSignature } from '@fhevm-sdk/adapters/react';
import { useEthersSigner } from './your-wagmi-hooks';

function DecryptComponent() {
  const signer = useEthersSigner();
  
  // 1. Get/create signature
  const { signature, sign, isSigning, isValid } = useDecryptionSignature({
    contractAddresses: ['0x...'],
    signer,
    onSuccess: (sig) => console.log('Signed!', sig),
  });

  // 2. Decrypt with signature
  const { decrypt, isDecrypting, data, error } = useDecrypt({
    requests: [{ handle: '0x...', contractAddress: '0x...' }],
    signature: signature!,
    enabled: Boolean(signature && isValid),
    onSuccess: (result) => console.log('Decrypted:', result),
  });

  return (
    <div>
      {!signature && (
        <button onClick={sign} disabled={isSigning}>
          {isSigning ? 'Signing...' : 'Sign for Decryption'}
        </button>
      )}
      
      {signature && (
        <>
          <button onClick={decrypt} disabled={isDecrypting}>
            {isDecrypting ? 'Decrypting...' : 'Decrypt'}
          </button>
          {data && <div>Value: {String(data['0x...'])}</div>}
        </>
      )}
      
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

---

## 🎯 Supported FHE Types

| Type | Description | Range |
|------|-------------|-------|
| `ebool` | Encrypted boolean | true/false |
| `euint8` | Encrypted 8-bit unsigned integer | 0 to 255 |
| `euint16` | Encrypted 16-bit unsigned integer | 0 to 65,535 |
| `euint32` | Encrypted 32-bit unsigned integer | 0 to 4,294,967,295 |
| `euint64` | Encrypted 64-bit unsigned integer | 0 to 2^64-1 |
| `euint128` | Encrypted 128-bit unsigned integer | 0 to 2^128-1 |
| `euint256` | Encrypted 256-bit unsigned integer | 0 to 2^256-1 |
| `eaddress` | Encrypted Ethereum address | 20 bytes |
| `ebytes64` | Encrypted bytes (64 bytes) | Fixed size |
| `ebytes128` | Encrypted bytes (128 bytes) | Fixed size |
| `ebytes256` | Encrypted bytes (256 bytes) | Fixed size |

---

## 🛠️ Contract Helpers

```typescript
import { buildContractParams, findEncryptedInputs, isCiphertextHandle } from '@fhevm-sdk/core';

// Find encrypted inputs in ABI
const encryptedInputs = findEncryptedInputs(contractABI, 'myFunction');
console.log('Encrypted inputs:', encryptedInputs);

// Build contract call parameters
const params = buildContractParams(encryptionResult, contractABI, 'myFunction');

// Check if value is a ciphertext handle
if (isCiphertextHandle(value)) {
  console.log('This is an encrypted value');
}
```

---

## 🔧 Storage Options

The SDK supports multiple storage backends for caching:

```typescript
import { createStorage, createBestAvailableStorage } from '@fhevm-sdk/core';

// Memory storage (default, volatile)
const memoryStorage = createStorage('memory');

// LocalStorage (browser, persistent)
const localStorage = createStorage('localStorage');

// IndexedDB (browser, large capacity)
const indexedDBStorage = createStorage('indexedDB');

// Auto-select best available
const storage = createBestAvailableStorage();

// Use with client
client.setStorage(storage);
```

---

## 🚨 Error Handling

The SDK provides comprehensive error handling with helpful messages:

```typescript
import { isFhevmError, formatErrorMessage, FhevmErrorCode } from '@fhevm-sdk/core';

try {
  await client.encrypt(...);
} catch (error) {
  if (isFhevmError(error)) {
    console.log('Error code:', error.code);
    console.log('Message:', formatErrorMessage(error));
    console.log('Suggestion:', error.suggestion);
    
    if (error.code === FhevmErrorCode.WALLET_SIGNATURE_REJECTED) {
      // Handle user rejection
    }
  }
}
```

Common error codes:
- `INIT_FAILED` - Client initialization failed
- `ENCRYPTION_FAILED` - Encryption operation failed
- `DECRYPTION_FAILED` - Decryption operation failed
- `SIGNATURE_REQUIRED` - EIP-712 signature needed
- `WALLET_NOT_CONNECTED` - Wallet connection required
- `ACL_PERMISSION_DENIED` - Access control denied

---

## 📊 Examples

Check out complete examples in the `/examples` directory:

- **Next.js** - Full-stack Next.js 14+ app with App Router
- **React + Vite** - Lightweight React SPA
- **Vue 3** - Vue composition API example
- **Node.js** - Server-side encryption/decryption
- **Vanilla JS** - Plain JavaScript without frameworks

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [Zama Documentation](https://docs.zama.ai/)
- [FHEVM Whitepaper](https://github.com/zama-ai/fhevm/blob/main/fhevm-whitepaper.pdf)
- [Zama Discord](https://discord.gg/zama)
- [Developer Program](https://www.zama.ai/programs/developer-program)

---

## 🙏 Acknowledgments

Built for the [Zama Bounty Program](https://www.zama.ai/programs/developer-program) - October 2025.

Special thanks to the Zama team for building the future of confidential computing.

---

**Made with ❤️ for the FHE community**

