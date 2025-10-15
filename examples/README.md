# 📚 FHEVM SDK - Examples

Complete examples demonstrating FHEVM SDK usage in different environments and frameworks.

## 🚀 Available Examples

### 1. Next.js (React) - **Main Showcase** ⭐

**Location:** `../packages/nextjs/`

Full-featured Next.js 14+ application with App Router demonstrating:
- React hooks (`useFhevm`, `useEncrypt`, `useDecrypt`)
- Wagmi integration
- RainbowKit wallet connection
- Complete FHE Counter demo
- Production-ready setup

**Quick Start:**
```bash
pnpm start
```

📖 [View Documentation](../packages/nextjs/README.md)

---

### 2. Node.js - **Server-Side** 🟢

**Location:** `./nodejs/`

Pure Node.js example showing framework-agnostic SDK usage:
- Server-side encryption/decryption
- Batch operations
- EIP-712 signature generation
- Express.js integration ready

**Quick Start:**
```bash
cd nodejs
npm install
npm start
```

📖 [View Documentation](./nodejs/README.md)

---

### 3. Vanilla JavaScript - **No Framework** 🌐

**Location:** `./vanilla-js/`

Pure HTML + JavaScript example:
- Zero build tools required
- Works in any browser
- MetaMask integration
- Beautiful UI included

**Quick Start:**
```bash
# Open index.html in browser
# Or use local server:
cd vanilla-js
npx http-server .
```

📖 [View Documentation](./vanilla-js/README.md)

---

## 🎯 Choose Your Example

| Example | Best For | Difficulty | Features |
|---------|----------|------------|----------|
| **Next.js** | Production apps | ⭐⭐⭐ | Full-featured, React hooks, Wagmi |
| **Node.js** | Backend/APIs | ⭐⭐ | Server-side, no UI needed |
| **Vanilla JS** | Quick start | ⭐ | No build tools, browser only |

---

## 🛠️ Development Workflow

### Step 1: Choose Your Stack

```bash
# React/Next.js?
cd ../packages/nextjs
pnpm install
pnpm start

# Pure Node.js?
cd examples/nodejs
npm install
npm start

# No framework?
cd examples/vanilla-js
# Open index.html
```

### Step 2: Start Local Blockchain

```bash
# In root directory
pnpm chain
```

### Step 3: Deploy Contracts

```bash
# In root directory
pnpm contracts:all
```

### Step 4: Run Your Example

See individual example READMEs for specific instructions.

---

## 📖 Common Patterns

### Pattern 1: Encrypt → Call Contract → Decrypt

```typescript
// 1. Encrypt input
const encrypted = await client.encrypt(
  contractAddress,
  userAddress,
  { type: 'euint32', value: 42 }
);

// 2. Call contract
const tx = await contract.myFunction(
  encrypted.handles[0],
  encrypted.inputProof
);
await tx.wait();

// 3. Read encrypted result
const encryptedResult = await contract.getResult();

// 4. Decrypt
const decrypted = await client.decrypt(
  [{ handle: encryptedResult, contractAddress }],
  signature
);
```

### Pattern 2: Batch Encryption

```typescript
// Encrypt multiple values at once (more efficient)
const batch = await client.encryptBatch(
  contractAddress,
  userAddress,
  [
    { type: 'euint32', value: 100 },
    { type: 'euint64', value: 20000n },
    { type: 'ebool', value: true },
  ]
);

// Use in contract call
await contract.batchFunction(
  batch.handles[0],
  batch.handles[1],
  batch.handles[2],
  batch.inputProof
);
```

### Pattern 3: EIP-712 Signature for Decryption

```typescript
// 1. Generate keypair
const keypair = client.generateKeypair();

// 2. Create EIP-712 message
const eip712 = client.createEIP712(
  keypair.publicKey,
  [contractAddress],
  Math.floor(Date.now() / 1000),
  365
);

// 3. Sign with wallet
const signatureString = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
);

// 4. Create signature object
const signature = {
  publicKey: keypair.publicKey,
  privateKey: keypair.privateKey,
  signature: signatureString.replace('0x', ''),
  startTimestamp: Math.floor(Date.now() / 1000),
  durationDays: 365,
  userAddress: await signer.getAddress(),
  contractAddresses: [contractAddress],
};

// 5. Decrypt
const decrypted = await client.decrypt(requests, signature);
```

---

## 🔧 Environment Setup

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm
- MetaMask extension (for browser examples)
- Git

### Installation

```bash
# Clone repository
git clone <repo-url>
cd fhevm-react-template

# Initialize submodules
git submodule update --init --recursive

# Install dependencies
pnpm install

# Build SDK
pnpm sdk:build
```

---

## 📚 Learning Path

### For Beginners

1. Start with **Vanilla JS** example
2. Understand basic encryption/decryption
3. Move to **Node.js** for backend concepts
4. Finally explore **Next.js** for full-stack

### For Web3 Developers

1. Start with **Next.js** example
2. Study the React hooks implementation
3. Adapt patterns to your existing app
4. Explore **Node.js** for backend integration

### For Backend Developers

1. Start with **Node.js** example
2. Integrate into your Express/Fastify app
3. Study encryption patterns
4. Add frontend later with **Next.js**

---

## 🚨 Common Issues

### Build Errors

```bash
# Clean and rebuild
pnpm sdk:clean
pnpm sdk:build
```

### MetaMask Issues

```bash
# Clear MetaMask activity
# Settings → Advanced → Clear activity tab data
```

### Submodule Not Initialized

```bash
git submodule update --init --recursive
```

### Type Errors

```bash
# Regenerate ABIs
pnpm contracts:abi
```

---

## 🎓 Resources

- [FHEVM SDK Documentation](../packages/fhevm-sdk/README.md)
- [Contract Tooling Guide](../CONTRACTS.md)
- [Zama Documentation](https://docs.zama.ai/)
- [Zama Discord](https://discord.gg/zama)

---

## 🤝 Contributing

Found a bug or have an example to add? Please open an issue or PR!

---

**Made with ❤️ for the FHE community**

