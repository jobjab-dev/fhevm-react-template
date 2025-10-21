# 🔐 Universal FHEVM SDK

> Production-ready, framework-agnostic SDK for building confidential dApps with Fully Homomorphic Encryption

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-jobjab--fhevm--sdk-red.svg)](https://www.npmjs.com/package/jobjab-fhevm-sdk)

**🌐 Live Demo:** https://jobjab-fhevm-react-template-nextjs.vercel.app/  
**📦 npm Package:** https://www.npmjs.com/package/jobjab-fhevm-sdk  
**🎬 Video Walkthrough:** https://www.youtube.com/watch?v=ASWVwOE1iPk  
**📚 Full Documentation:** https://github.com/jobjab-dev/fhevm-react-template/tree/main/docs

**Works with:** React • Vue • Node.js • Vanilla JS • Any JavaScript framework

---

## ⚡ Quick Start

**Prerequisites:** Node.js ≥ 20.0.0 + pnpm

```bash
git clone https://github.com/jobjab-dev/fhevm-react-template
cd fhevm-react-template
```

**Terminal 1** - Start blockchain:
```bash
pnpm chain
```

**Terminal 2** - Run demo:
```bash
pnpm all:demo
# Installs → Builds SDK → Deploys contracts → Starts app
```

**Try it:**
1. Open http://localhost:3000
2. Connect MetaMask to **Hardhat Local**
3. Import test account: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Increment counter → Decrypt → See your private value! ✅

---

## 💡 How to Use This SDK

### For React Developers

```tsx
import { FhevmProvider, useEncrypt, useDecrypt } from 'jobjab-fhevm-sdk/adapters/react';
import { EncryptedInput, DecryptButton } from 'jobjab-fhevm-sdk/components/react';

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
import { createFhevmClient } from 'jobjab-fhevm-sdk/core';

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
| **Runnable examples** | [examples/](examples/) - 10 .ts files |
| **API docs (detailed)** | [docs/](docs/) - Per-function docs |
| **Code recipes** | [COOKBOOK.md](COOKBOOK.md) - 29 patterns |
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
- 142+ tests passing
- Full TypeScript support
- CI/CD with GitHub Actions

**Live Showcase:**
- 🔢 **Private Counter** - Fully functional encrypted counter with increment/decrement
- 📖 [More Showcase Ideas](examples/showcase/) - Secret Bidding, Private Poll concepts

---

## 💡 How It Works

**3-Step Process:**

1. **Encrypt** → Client-side encryption with SDK
2. **Compute** → Encrypted operations on-chain
3. **Decrypt** → User reveals with EIP-712 signature

```typescript
// Encrypt
const enc = await client.encrypt(addr, user, { type: 'euint32', value: 42 });

// Use in contract
await contract.increment(enc.handles[0], enc.inputProof);

// Decrypt to view
const result = await client.decrypt([{ handle, contractAddress }], signature);
```

📖 **Learn More:** [QUICKSTART.md](QUICKSTART.md) | [COOKBOOK.md](COOKBOOK.md) | [Examples](examples/)

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
pnpm sdk:test       # Test (142+ tests)

# CLI
fhevm init          # Setup
fhevm encrypt 42    # Encrypt
fhevm check         # Health check
```

---

## 📦 Repository Structure

```
packages/
├── fhevm-sdk/    ⭐ Universal SDK (publishable to npm)
├── cli/          ⚡ Command-line tool
├── nextjs/       🎨 Next.js demo (Private Counter)
└── hardhat/      🔧 Smart contracts

examples/
├── 01-10.ts      📝 10 TypeScript examples
├── nodejs/       🟢 Node.js server
├── vanilla-js/   🌐 Browser app
├── vue/          💚 Vue 3 Composition API
└── showcase/     💡 dApp ideas
```

**Includes:** SDK • CLI • Contracts • Next.js Demo • 4 Framework Examples • 10 Code Examples

🎨 **Live Demo:** [Private Counter →](examples/showcase/) | 💡 **More Ideas:** [Secret Bidding, Private Poll →](examples/showcase/)

---

## 🔗 Links

- [Zama Documentation](https://docs.zama.ai/)
- [Zama Discord](https://discord.gg/zama)
- [Developer Program](https://www.zama.ai/programs/developer-program)

---

## ✨ Features

**SDK Capabilities:**
- ✅ Framework-agnostic core (works anywhere)
- ✅ React hooks & components (wagmi-like API)
- ✅ Batch encryption (3-5x faster)
- ✅ User & public decryption
- ✅ CLI tool (4 commands)
- ✅ 57 error codes with helpful messages
- ✅ Full TypeScript support
- ✅ 142+ tests passing

📋 **[See Complete Feature List →](FEATURES.md)**

---

## 📄 License

BSD-3-Clause-Clear - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

Built with [Zama's FHEVM](https://github.com/zama-ai/fhevm) - the leading Fully Homomorphic Encryption solution for Ethereum.

Special thanks to the Zama team for pioneering confidential smart contracts and the FHE ecosystem.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

For major changes, please open an issue first to discuss proposed changes.

---

**Built with ❤️ for the Zama community**
