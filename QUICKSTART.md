# ⚡ Quick Start Guide

Get up and running with FHEVM SDK in **5 minutes**!

## 🎯 Choose Your Path

### 🎨 Frontend Developer (React)
**Time:** 5 minutes | **Difficulty:** ⭐

```bash
# 1. Clone and setup (1 min)
git clone <your-fork>
cd fhevm-react-template
git submodule update --init --recursive
pnpm install

# 2. Build SDK (1 min)
pnpm sdk:build

# 3. Start development (1 min)
pnpm chain          # Terminal 1
pnpm contracts:all  # Terminal 2
pnpm start          # Terminal 3

# 4. Open browser (1 min)
# http://localhost:3000

# 5. Connect wallet & play! (1 min)
```

---

### 🟢 Backend Developer (Node.js)
**Time:** 3 minutes | **Difficulty:** ⭐

```bash
# 1. Install (1 min)
cd examples/nodejs
npm install

# 2. Configure (30 sec)
cp .env.example .env
# Edit .env with your RPC_URL and PRIVATE_KEY

# 3. Run (30 sec)
npm start

# 4. See encryption in action! (1 min)
```

---

### 🌐 No Framework (Vanilla JS)
**Time:** 2 minutes | **Difficulty:** ⭐

```bash
# 1. Navigate (10 sec)
cd examples/vanilla-js

# 2. Open in browser (10 sec)
# Just double-click index.html

# 3. Connect MetaMask (30 sec)

# 4. Encrypt/decrypt! (1 min)
```

---

### 💻 Using CLI
**Time:** 3 minutes | **Difficulty:** ⭐

```bash
# 1. Build CLI (1 min)
cd packages/cli
pnpm install && pnpm build

# 2. Initialize (30 sec)
./dist/cli.js init
# Follow prompts

# 3. Encrypt (30 sec)
./dist/cli.js encrypt 42 --type euint32

# 4. Check health (30 sec)
./dist/cli.js check
```

---

## 📖 Your First FHEVM App (React)

### Step 1: Create Component (2 min)

```tsx
// app/my-component.tsx
'use client';

import { useFhevmClient, useEncrypt } from 'jobjab-fhevm-sdk/adapters/react';
import { EncryptedInput } from 'jobjab-fhevm-sdk/components/react';

export function MyFirstFhevmComponent() {
  const client = useFhevmClient();
  
  const handleEncrypted = (result) => {
    console.log('Encrypted!', result.handles[0]);
  };

  return (
    <div>
      <h1>My First FHEVM App</h1>
      <EncryptedInput
        type="euint32"
        contractAddress="0x..."
        userAddress="0x..."
        onEncrypted={handleEncrypted}
      />
    </div>
  );
}
```

### Step 2: Use in App (30 sec)

```tsx
// app/page.tsx
import { FhevmProvider } from 'jobjab-fhevm-sdk/adapters/react';
import { MyFirstFhevmComponent } from './my-component';

export default function Page() {
  return (
    <FhevmProvider config={{ network: 'sepolia' }}>
      <MyFirstFhevmComponent />
    </FhevmProvider>
  );
}
```

### Step 3: Run! (30 sec)

```bash
pnpm start
```

**Done! 🎉**

---

## 🎓 Learning Path

### Beginner (Day 1)

1. ✅ Run Next.js example
2. ✅ Play with Private Counter
3. ✅ Read SDK README
4. ✅ Try encrypting different types

### Intermediate (Day 2-3)

1. ✅ Study encryption/decryption flow
2. ✅ Understand EIP-712 signatures
3. ✅ Deploy your own contract
4. ✅ Build custom component

### Advanced (Week 1)

1. ✅ Implement Secret Bidding
2. ✅ Create Private Poll
3. ✅ Optimize performance
4. ✅ Contribute to SDK

---

## 🎯 Common Tasks

### Add New FHE Type

```typescript
// 1. Add to core types
export type FheType = '...' | 'mynewtype';

// 2. Add encryption method mapping
const methodMap = {
  // ...
  'mynewtype': 'addMyNewType',
};

// 3. Add validation
if (type === 'mynewtype') {
  // validate...
}

// 4. Update documentation
```

### Create Custom Hook

```typescript
// packages/fhevm-sdk/src/adapters/react/useMyHook.ts
export function useMyHook(options) {
  const client = useFhevmClient();
  
  const myFunction = useCallback(async () => {
    // Implementation
  }, [client]);

  return { myFunction };
}
```

### Add UI Component

```tsx
// packages/fhevm-sdk/src/components/react/MyComponent.tsx
export function MyComponent(props) {
  return (
    <div className="my-component">
      {/* Implementation */}
    </div>
  );
}

// Export from index.ts
export * from './MyComponent';
```

---

## 🚨 Common Pitfalls

### ❌ Forgetting to Build

```bash
# Always build after changes
pnpm sdk:build
```

### ❌ Not Waiting for Init

```typescript
// ❌ Bad
const client = createFhevmClient({ ... });
await client.encrypt(...); // Fails! Not ready yet

// ✅ Good
const client = createFhevmClient({ ... });
await client.init();
await client.encrypt(...); // Works!
```

### ❌ Missing Submodules

```bash
# Always initialize submodules
git submodule update --init --recursive
```

---

## 💡 Tips & Tricks

### Fast Development Loop

```bash
# Terminal 1: Watch SDK changes
pnpm sdk:watch

# Terminal 2: Watch Next.js
pnpm start

# Changes auto-reload! 🔥
```

### Debug Mode

```typescript
// Enable verbose logging
const client = createFhevmClient({
  network: 'sepolia',
  debug: true, // Show all internal logs
});
```

### Quick Testing

```bash
# Test specific module
pnpm sdk:test encryption

# Test with watch
pnpm sdk:test:watch encryption
```

---

## 📚 Next Steps

1. ✅ **Read** [SDK Documentation](packages/fhevm-sdk/README.md)
2. ✅ **Explore** [Examples](examples/README.md)
3. ✅ **Study** [Contract Guide](CONTRACTS.md)
4. ✅ **Build** Your own dApp!
5. ✅ **Share** Your creation!

---

## 🎉 Success!

You're now ready to build confidential dApps with FHEVM!

**What to build next?**
- 💰 Confidential token
- 🎯 Sealed-bid auction
- 🗳️ Private voting
- 🎰 Fair gaming
- Your own idea!

**Need help?**
- 💬 [Discord](https://discord.gg/zama)
- 📖 [Documentation](https://docs.zama.ai/)
- 🐛 [GitHub Issues](https://github.com/your-fork/issues)

---

**Happy building with FHE! 🔐**

