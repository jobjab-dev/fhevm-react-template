# jobjab-fhevm-sdk

> Universal, framework-agnostic SDK for building confidential dApps with FHEVM

[![npm](https://img.shields.io/npm/v/jobjab-fhevm-sdk)](https://www.npmjs.com/package/jobjab-fhevm-sdk)
[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)

## Installation

```bash
npm install jobjab-fhevm-sdk
```

## Quick Start

### Core (Framework-Agnostic)

```typescript
import { createFhevmClient } from 'jobjab-fhevm-sdk';

const client = createFhevmClient({ network: 'sepolia' });
await client.init();

const result = await client.encrypt(
  contractAddress,
  userAddress,
  { type: 'euint32', value: 42 }
);
```

### React

```tsx
import { FhevmProvider, useEncrypt } from 'jobjab-fhevm-sdk/adapters/react';
import { EncryptedInput } from 'jobjab-fhevm-sdk/components/react';

<FhevmProvider config={{ network: 'sepolia' }}>
  <YourApp />
</FhevmProvider>

function YourApp() {
  const { encrypt } = useEncrypt({ contractAddress, userAddress });
  return <EncryptedInput type="euint32" onEncrypted={(r) => console.log(r)} />;
}
```

## Features

- 🎯 **Framework-Agnostic** - React, Vue, Node.js, Vanilla JS
- 🪝 **Wagmi-like API** - Provider + hooks pattern
- 📦 **Components** - EncryptedInput, DecryptButton, CipherPreview
- ⚡ **Performance** - Batch operations (3-5x faster), caching
- 🔐 **Complete** - Encrypt, decrypt (user + public), EIP-712
- 🚨 **Error Handling** - Helpful error codes and suggestions
- 🧪 **Tested** - 43/43 tests passing

## API

### Core

```typescript
createFhevmClient(config)           // Create client
client.init()                        // Initialize
client.encrypt(addr, user, value)    // Encrypt value
client.encryptBatch(addr, user, values) // Batch (3-5x faster)
client.decrypt(requests, signature)  // Decrypt with EIP-712
client.publicDecrypt(handle, addr)   // Public decrypt
```

### React

```tsx
<FhevmProvider config={...}>         // Provider
useFhevmClient()                     // Access client
useEncrypt({ contractAddress, userAddress })
useDecrypt({ requests, signature })
useDecryptionSignature({ contractAddresses, signer })
```

### Components

```tsx
<EncryptedInput type="euint32" onEncrypted={handler} />
<DecryptButton handle="0x..." signer={signer} showValue />
<CipherPreview handle="0x..." showDecrypt />
```

## Supported Types

- `ebool`, `euint8`, `euint16`, `euint32`, `euint64`, `euint128`, `euint256`
- `eaddress`, `ebytes64`, `ebytes128`, `ebytes256`

## Documentation

- **Examples** - [../../examples/](../../examples/) - 10 runnable .ts files
- **API Docs** - [../../docs/](../../docs/) - Detailed per-function docs
- **Recipes** - [../../COOKBOOK.md](../../COOKBOOK.md) - 29 common patterns
- **Troubleshooting** - [../../TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)

## Example Usage

```typescript
// Encrypt
const encrypted = await client.encrypt(addr, user, { type: 'euint32', value: 100 });
await contract.myFunction(encrypted.handles[0], encrypted.inputProof);

// Decrypt
const keypair = client.generateKeypair();
const eip712 = client.createEIP712(keypair.publicKey, [addr]);
const sig = await signer.signTypedData(eip712.domain, eip712.types, eip712.message);
const decrypted = await client.decrypt([{ handle, contractAddress }], { ...keypair, signature: sig, ... });
```

## Links

- [GitHub](https://github.com/jobjab-dev/fhevm-react-template)
- [npm](https://www.npmjs.com/package/jobjab-fhevm-sdk)
- [Zama Docs](https://docs.zama.ai/)

## License

BSD-3-Clause-Clear

---

**Built for Zama Bounty Program - October 2025**
