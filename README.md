# 🔐 Universal FHEVM SDK

> Framework-agnostic SDK for building confidential dApps - works with React, Vue, Node.js, or Vanilla JS

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-43%2F43%20passing-brightgreen.svg)]()

---

## ⚡ Quick Start (Choose Your Path)

### 🎨 I want to try the demo now

```bash
git clone <your-fork>
cd fhevm-react-template
pnpm install

# One command to start everything:
pnpm all:demo
```

Open http://localhost:3000 🎉

---

### 🔧 I want to build step-by-step

```bash
# 1. Setup
git clone <your-fork>
cd fhevm-react-template
git submodule update --init --recursive
pnpm install
pnpm sdk:build

# 2. Run (3 terminals)
pnpm chain          # Terminal 1
pnpm contracts:all  # Terminal 2
pnpm start          # Terminal 3
```

Open http://localhost:3000 ✅

---

## 💡 How to Use This SDK

### For React Developers

```tsx
import { FhevmProvider, useEncrypt, useDecrypt } from 'fhevm-sdk/adapters/react';
import { EncryptedInput, DecryptButton } from 'fhevm-sdk/components/react';

// 1. Wrap app
<FhevmProvider config={{ network: 'sepolia' }}>
  <YourApp />
</FhevmProvider>

// 2. Use hooks
function MyComponent() {
  const { encrypt } = useEncrypt({ contractAddress: '0x...', userAddress: '0x...' });
  
  return (
    <EncryptedInput 
      type="euint32"
      onEncrypted={(r) => console.log('Encrypted!', r)}
    />
  );
}
```

📖 **Full Guide:** [packages/fhevm-sdk/README.md](packages/fhevm-sdk/README.md)

---

### For Backend/Node.js Developers

```typescript
import { createFhevmClient } from 'fhevm-sdk/core';

const client = await createFhevmClient({ network: 'sepolia' });

const result = await client.encrypt(
  '0xContract',
  '0xUser',
  { type: 'euint32', value: 42 }
);

await contract.myFunction(result.handles[0], result.inputProof);
```

📖 **Example:** [examples/nodejs/](examples/nodejs/)

---

### For Quick Testing (CLI)

```bash
cd packages/cli && pnpm install && pnpm build

./dist/cli.js init           # Setup
./dist/cli.js encrypt 42     # Encrypt value
./dist/cli.js decrypt 0x...  # Decrypt  
./dist/cli.js check          # Health check
```

📖 **CLI Guide:** [packages/cli/README.md](packages/cli/README.md)

---

## 📚 Documentation

| When You Need | Read This |
|---------------|-----------|
| **5-minute start** | [QUICKSTART.md](QUICKSTART.md) |
| **Code examples** | [COOKBOOK.md](COOKBOOK.md) - 29 recipes |
| **Complete API** | [API_REFERENCE.md](API_REFERENCE.md) |
| **Problems?** | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| **Security** | [SECURITY.md](SECURITY.md) |
| **Contracts** | [CONTRACTS.md](CONTRACTS.md) |

---

## 🎯 Main Features

**Core SDK:**
- Framework-agnostic (React, Vue, Node.js, Vanilla JS)
- Wagmi-like API (Provider + hooks)
- Complete encrypt/decrypt flows
- Error handling with helpful messages

**Components:**
- `<EncryptedInput>` - Auto-encrypting form input
- `<DecryptButton>` - One-click decrypt with EIP-712
- `<CipherPreview>` - Display ciphertext info

**Developer Tools:**
- CLI: `fhevm init`, `encrypt`, `decrypt`, `check`
- Scripts: `pnpm all:demo` (one-shot setup)
- Performance: Batch operations (3-5x faster)

**Quality:**
- 43/43 tests passing
- Full TypeScript support
- CI/CD with GitHub Actions

---

## 💡 Core Concepts

### Encryption Flow

```typescript
// 1. Create client
const client = createFhevmClient({ network: 'sepolia' });
await client.init();

// 2. Encrypt value
const encrypted = await client.encrypt(
  contractAddress,
  userAddress,
  { type: 'euint32', value: 42 }
);

// 3. Use in contract
await contract.myFunction(encrypted.handles[0], encrypted.inputProof);
```

### Decryption Flow

```typescript
// 1. Generate keypair
const keypair = client.generateKeypair();

// 2. Create EIP-712 & sign
const eip712 = client.createEIP712(keypair.publicKey, [contractAddress]);
const sig = await signer.signTypedData(eip712.domain, eip712.types, eip712.message);

// 3. Decrypt
const decrypted = await client.decrypt(
  [{ handle, contractAddress }],
  { ...keypair, signature: sig, ... }
);
```

### ACL in Contracts

```solidity
function myFunction(externalEuint32 input, bytes calldata proof) external {
  euint32 value = FHE.fromExternal(input, proof);
  
  // Grant permissions
  FHE.allowThis(value);        // Contract can use
  FHE.allow(value, msg.sender); // User can decrypt
}
```

---

## 🛠️ Commands

```bash
# One-shot
pnpm all:demo       # Everything at once

# Development
pnpm chain          # Start blockchain
pnpm contracts:all  # Deploy contracts
pnpm start          # Start app

# SDK
pnpm sdk:build      # Build
pnpm sdk:test       # Test (43 tests)

# CLI
fhevm init          # Setup
fhevm encrypt 42    # Encrypt
fhevm check         # Health check
```

---

## 📦 What's Included

```
packages/
├── fhevm-sdk/       # SDK (framework-agnostic core + React adapter)
├── cli/             # CLI tool (4 commands)
├── nextjs/          # Next.js example app
└── hardhat/         # Smart contracts

examples/
├── nodejs/          # Node.js example
└── vanilla-js/      # Vanilla JS example
```

---

## 🔗 Links

- [Zama Documentation](https://docs.zama.ai/)
- [Zama Discord](https://discord.gg/zama)
- [Developer Program](https://www.zama.ai/programs/developer-program)

---

## 📄 License

BSD-3-Clause-Clear - See [LICENSE](LICENSE)

---

**Made with ❤️ for the Zama Bounty Program - October 2025**

> **⚠️ This is a FORK** of [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)
