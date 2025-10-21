# 🚨 Troubleshooting Guide

Common issues and solutions for FHEVM SDK development.

## 🔍 Quick Diagnosis

```bash
# Run health check
fhevm check

# Or manually check:
pnpm sdk:test           # Test SDK
pnpm contracts:build    # Test contracts
pnpm start              # Test Next.js
```

---

## 🐛 Installation Issues

### "Submodule not initialized"

**Symptom:**
```
Error: Cannot find module './packages/hardhat/contracts'
```

**Solution:**
```bash
git submodule update --init --recursive
pnpm install
```

### "pnpm not found"

**Symptom:**
```
'pnpm' is not recognized as a command
```

**Solution:**
```bash
# Install pnpm globally
npm install -g pnpm

# Or use npx
npx pnpm install
```

### "Node version incompatible"

**Symptom:**
```
Error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check version
node --version

# Install Node.js >= 20.0.0
# Download from https://nodejs.org/
```

---

## 🔐 SDK Issues

### "FHEVM instance not initialized"

**Symptom:**
```
Error: [INIT_1000] FHEVM instance not initialized
```

**Solution:**
```typescript
// ❌ Bad
const client = createFhevmClient({ network: 'sepolia' });
await client.encrypt(...); // Fails!

// ✅ Good
const client = createFhevmClient({ network: 'sepolia' });
await client.init(); // Wait for init!
await client.encrypt(...); // Works!
```

### "Provider not available"

**Symptom:**
```
Error: [INIT_1003] Provider not available
```

**Solution:**
```typescript
// Check MetaMask is installed
if (!window.ethereum) {
  alert('Please install MetaMask');
}

// Or provide RPC URL
const client = createFhevmClient({
  network: 'sepolia',
  provider: 'https://eth-sepolia.public.blastapi.io', // Direct RPC
});
```

### "Wallet signature rejected"

**Symptom:**
```
Error: [WALLET_5001] Wallet signature rejected
```

**Solution:**
- User cancelled signature in MetaMask
- This is normal - ask user to try again
- Add retry button in UI

```tsx
const handleDecrypt = async () => {
  try {
    await decrypt();
  } catch (error) {
    if (error.code === 'WALLET_5001') {
      alert('Please approve the signature in MetaMask');
    }
  }
};
```

### "ACL permission denied"

**Symptom:**
```
Error: [DECRYPT_3005] ACL permission denied
```

**Solution:**
```solidity
// In your contract, allow user to decrypt:
FHE.allow(_count, msg.sender);

// For contract itself:
FHE.allowThis(_count);
```

---

## 🌐 Network Issues

### "RPC not reachable"

**Symptom:**
```
Error: [NETWORK_6001] RPC not reachable
```

**Solution:**
```typescript
// 1. Check RPC URL
const client = createFhevmClient({
  network: 'sepolia',
  provider: 'https://eth-sepolia.public.blastapi.io', // Public RPC
});

// 2. Or use Infura/Alchemy
const client = createFhevmClient({
  network: 'sepolia',
  provider: `https://sepolia.infura.io/v3/${YOUR_API_KEY}`,
});
```

### "Chain mismatch"

**Symptom:**
```
Error: [NETWORK_6002] Chain mismatch
```

**Solution:**
```typescript
// Make sure wallet is on correct network
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xaa36a7' }], // Sepolia
});
```

### "Localhost not working"

**Symptom:**
```
Error: Cannot connect to http://localhost:8545
```

**Solution:**
```bash
# Make sure chain is running
pnpm chain

# Check if port is in use
netstat -ano | findstr :8545  # Windows
lsof -i :8545                 # macOS/Linux

# Use different port
pnpm chain --port 8546
```

---

## 🦊 MetaMask Issues

### "Nonce too high"

**Symptom:**
```
Error: nonce has already been used
```

**Solution:**
```
1. Open MetaMask
2. Settings → Advanced
3. Click "Clear activity tab data"
4. Restart browser
```

### "Cached view function results"

**Symptom:**
```
Contract shows old data after redeploying
```

**Solution:**
```
1. Restart entire browser (not just refresh)
2. Or use Incognito mode for testing
3. Or clear MetaMask cache (see above)
```

### "Transaction underpriced"

**Symptom:**
```
Error: transaction underpriced
```

**Solution:**
```typescript
// Increase gas price
const tx = await contract.myFunction(..., {
  gasPrice: ethers.parseUnits('50', 'gwei'),
});
```

---

## 📦 Build Issues

### "Cannot find module '@fhevm-sdk'"

**Symptom:**
```
Error: Cannot find module 'jobjab-fhevm-sdk'
```

**Solution:**
```bash
# Build SDK first
pnpm sdk:build

# Or from root
pnpm install
```

### "TypeScript errors"

**Symptom:**
```
TS2307: Cannot find module 'jobjab-fhevm-sdk/core'
```

**Solution:**
```bash
# Rebuild
pnpm sdk:clean
pnpm sdk:build

# Check tsconfig.json paths
```

### "React hooks error"

**Symptom:**
```
Error: Invalid hook call
```

**Solution:**
```tsx
// ❌ Bad - hooks outside component
const { encrypt } = useEncrypt();

function Component() {
  return <div>...</div>;
}

// ✅ Good - hooks inside component
function Component() {
  const { encrypt } = useEncrypt();
  return <div>...</div>;
}
```

---

## 🔒 Encryption Issues

### "Invalid input type"

**Symptom:**
```
Error: [ENCRYPT_2001] Invalid input type
```

**Solution:**
```typescript
// Check type matches value
await encrypt({ type: 'euint32', value: 42 });        // ✅
await encrypt({ type: 'euint32', value: 'string' });  // ❌

// For large numbers, use BigInt
await encrypt({ type: 'euint64', value: 1000000n });  // ✅
```

### "Value exceeds maximum"

**Symptom:**
```
Error: Value exceeds maximum for euint8: 255
```

**Solution:**
```typescript
// Use appropriate type for value
await encrypt({ type: 'euint8', value: 256 });   // ❌ Too large
await encrypt({ type: 'euint16', value: 256 });  // ✅ Fits
```

### "Encryption failed"

**Symptom:**
```
Error: [ENCRYPT_2000] Encryption failed
```

**Solution:**
```typescript
// 1. Check client is initialized
if (!client.isReady) {
  await client.init();
}

// 2. Check addresses are valid
if (!isValidAddress(contractAddress)) {
  throw new Error('Invalid contract address');
}

// 3. Check network is connected
const network = await provider.getNetwork();
console.log('Connected to:', network.chainId);
```

---

## 🔓 Decryption Issues

### "Signature expired"

**Symptom:**
```
Error: [DECRYPT_3003] Signature expired
```

**Solution:**
```typescript
// Check signature validity
if (!isSignatureValid(signature)) {
  // Request new signature
  await sign();
}

// Or increase duration
const eip712 = client.createEIP712(
  publicKey,
  contracts,
  timestamp,
  365 // 1 year instead of default
);
```

### "Cannot decrypt - no permission"

**Symptom:**
```
Error: Access denied: You do not have permission to decrypt this value
```

**Solution:**
```solidity
// In your contract, add:
FHE.allow(encryptedValue, msg.sender);

// Or for everyone:
FHE.allowThis(encryptedValue);
```

---

## 📜 Contract Issues

### "Contract not found"

**Symptom:**
```
Error: Contract 'MyContract' not found in deployedContracts.ts
```

**Solution:**
```bash
# Regenerate ABIs
pnpm contracts:abi

# Or full rebuild
pnpm contracts:all
```

### "Function not found in ABI"

**Symptom:**
```
Error: Function 'myFunction' not found in ABI
```

**Solution:**
```bash
# 1. Recompile contracts
pnpm contracts:build

# 2. Redeploy
pnpm contracts:deploy

# 3. Regenerate ABIs
pnpm contracts:abi
```

### "Deployment failed"

**Symptom:**
```
Error: Transaction reverted without a reason string
```

**Solution:**
```bash
# 1. Check constructor arguments
# 2. Ensure sufficient gas
# 3. Check network funds

# Get detailed error:
pnpm hardhat:deploy --network localhost --verbose
```

---

## 🧪 Testing Issues

### "Tests failing"

**Symptom:**
```
Tests failed: 5 failed, 10 passed
```

**Solution:**
```bash
# 1. Check specific error
pnpm sdk:test --reporter=verbose

# 2. Run single test
pnpm sdk:test encryption.test.ts

# 3. Clean and rebuild
pnpm sdk:clean
pnpm sdk:build
pnpm sdk:test
```

### "Timeout error"

**Symptom:**
```
Error: Test timeout exceeded
```

**Solution:**
```typescript
// Increase timeout
it('slow test', async () => {
  // ...
}, { timeout: 10000 }); // 10 seconds
```

---

## 🎨 React-Specific Issues

### "Hook rules violation"

**Symptom:**
```
Error: Rendered more hooks than during the previous render
```

**Solution:**
```tsx
// ❌ Bad - conditional hooks
function Component({ show }) {
  if (show) {
    const { encrypt } = useEncrypt(); // Conditional!
  }
}

// ✅ Good - hooks at top level
function Component({ show }) {
  const { encrypt } = useEncrypt(); // Always called
  
  if (!show) return null;
  // Use encrypt here
}
```

### "Context not found"

**Symptom:**
```
Error: useFhevmContext must be used within FhevmProvider
```

**Solution:**
```tsx
// ❌ Bad - outside provider
function App() {
  const client = useFhevmClient(); // Error!
  return <div>...</div>;
}

// ✅ Good - inside provider
function App() {
  return (
    <FhevmProvider config={{ network: 'sepolia' }}>
      <Component /> {/* useFhevmClient works here */}
    </FhevmProvider>
  );
}
```

---

## ⚡ Performance Issues

### "Slow encryption"

**Symptom:**
- Takes > 1 second per encryption

**Solution:**
```typescript
// Use batch operations
const batch = await client.encryptBatch(addr, user, [
  { type: 'euint32', value: 1 },
  { type: 'euint32', value: 2 },
  { type: 'euint32', value: 3 },
]); // 3-5x faster!
```

### "Too many re-renders"

**Symptom:**
- React components re-rendering constantly

**Solution:**
```tsx
// Memoize callbacks
const handleEncrypt = useCallback(async () => {
  await encrypt(value);
}, [encrypt, value]); // Only recreate when dependencies change

// Memoize objects
const options = useMemo(() => ({
  contractAddress: '0x...',
  userAddress: '0x...',
}), []); // Stable reference
```

---

## 🗂️ Error Code Reference

| Code | Meaning | Common Cause | Solution |
|------|---------|--------------|----------|
| `INIT_1000` | Init failed | Network/config issue | Check `fhevm check` |
| `ENCRYPT_2000` | Encryption failed | Invalid input | Validate value & type |
| `DECRYPT_3000` | Decryption failed | No permission | Check ACL in contract |
| `DECRYPT_3002` | Signature required | Missing signature | Call `sign()` first |
| `WALLET_5000` | Wallet not connected | No MetaMask | Connect wallet |
| `WALLET_5001` | Signature rejected | User cancelled | Retry operation |
| `NETWORK_6000` | RPC error | Network issue | Check RPC URL |
| `CONTRACT_4001` | Invalid contract | Wrong address | Verify contract address |

📖 [Full Error Reference](packages/fhevm-sdk/src/core/errors.ts)

---

## 💻 Development Issues

### "Hot reload not working"

**Solution:**
```bash
# Use watch mode
pnpm sdk:watch  # Terminal 1
pnpm start      # Terminal 2
```

### "Changes not reflected"

**Solution:**
```bash
# Clean rebuild
pnpm sdk:clean
pnpm sdk:build
# Restart Next.js
```

### "Type errors in IDE"

**Solution:**
```bash
# Rebuild types
pnpm sdk:build

# Restart TypeScript server in VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 🔧 Environment Issues

### Windows-Specific

**Issue:** "Script execution disabled"

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue:** "Long path names"

```bash
# Enable long paths
git config --system core.longpaths true
```

### macOS-Specific

**Issue:** "Permission denied"

```bash
# Fix permissions
chmod +x scripts/*.sh
chmod +x packages/cli/dist/cli.js
```

### Linux-Specific

**Issue:** "ENOSPC: System limit for number of file watchers reached"

```bash
# Increase watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📱 Browser Issues

### "MetaMask not detected"

**Solution:**
```typescript
if (typeof window !== 'undefined' && !window.ethereum) {
  alert('Please install MetaMask: https://metamask.io/download/');
}
```

### "CORS errors"

**Solution:**
```bash
# Use local server, not file://
npx http-server examples/vanilla-js

# Or configure Next.js properly
```

### "Storage quota exceeded"

**Solution:**
```typescript
// Use IndexedDB instead of LocalStorage
import { createStorage } from 'jobjab-fhevm-sdk/core';

const storage = createStorage('indexedDB'); // Larger capacity
client.setStorage(storage);
```

---

## 🎯 Contract Deployment Issues

### "Deployment failed on Sepolia"

**Symptom:**
```
Error: insufficient funds for gas
```

**Solution:**
```bash
# 1. Get Sepolia ETH from faucet
# https://sepoliafaucet.com/

# 2. Check balance
# In MetaMask, switch to Sepolia network

# 3. Retry deployment
pnpm contracts:deploy:sepolia
```

### "Contract verification failed"

**Symptom:**
```
Error: Contract verification failed
```

**Solution:**
```bash
# Verify manually
pnpm hardhat:verify --network sepolia DEPLOYED_ADDRESS

# Or use Etherscan
# https://sepolia.etherscan.io/verifyContract
```

---

## 🧪 Testing Issues

### "Mock not working"

**Solution:**
```typescript
import { vi } from 'vitest';

// Mock before importing module
vi.mock('ethers', () => ({
  JsonRpcProvider: vi.fn(),
  Wallet: vi.fn(),
}));

import { myFunction } from './module';
```

### "Async tests timing out"

**Solution:**
```typescript
// Increase timeout
it('async test', async () => {
  await slowOperation();
}, { timeout: 10000 }); // 10 seconds

// Or globally in vitest.config.ts
export default {
  test: {
    testTimeout: 10000,
  },
};
```

---

## 🚀 Deployment Issues

### "Vercel build fails"

**Solution:**
```bash
# Check environment variables
# Add to Vercel dashboard:
NEXT_PUBLIC_ALCHEMY_API_KEY=...

# Check build locally
pnpm next:build
```

### "Build size too large"

**Solution:**
```typescript
// Dynamic imports
const { createFhevmClient } = await import('jobjab-fhevm-sdk/core');

// Tree shaking
import { createFhevmClient } from 'jobjab-fhevm-sdk/core'; // Not /index
```

---

## 📚 Getting Help

### Before Asking

1. ✅ Run `fhevm check`
2. ✅ Check error code in this guide
3. ✅ Search existing issues
4. ✅ Try the solution
5. ✅ Still stuck? Ask below!

### Where to Ask

- 💬 **Discord:** [#developer-program](https://discord.gg/zama)
- 🐛 **GitHub Issues:** [Open an issue](https://github.com/your-fork/issues)
- 📧 **Email:** support@zama.ai (for serious bugs)

### What to Include

```markdown
**Environment:**
- OS: macOS 14.0
- Node: v20.10.0
- SDK version: 0.1.0
- Framework: Next.js 14.0.0

**Issue:**
Clear description of the problem.

**Steps to reproduce:**
1. Do this
2. Then this
3. See error

**Error message:**
Full error message and stack trace.

**What I tried:**
Solutions attempted.
```

---

## 🔍 Debug Mode

### Enable Verbose Logging

```typescript
// Core client
const client = createFhevmClient({
  network: 'sepolia',
  debug: true, // Enable debug logs
});

// Or set environment variable
process.env.FHEVM_DEBUG = 'true';
```

### Browser DevTools

```javascript
// Set breakpoint in Chrome DevTools
// Sources → packages/fhevm-sdk/dist/core/FhevmClient.js
// Or add debugger statement:

const result = await client.encrypt(...);
debugger; // Execution pauses here
```

---

## 📊 Common Patterns

### Retry Logic

```typescript
async function encryptWithRetry(value, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.encrypt(addr, user, value);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 1000)); // Wait 1s
    }
  }
}
```

### Graceful Degradation

```typescript
try {
  const storage = createStorage('indexedDB');
} catch {
  // Fallback to localStorage
  try {
    const storage = createStorage('localStorage');
  } catch {
    // Fallback to memory
    const storage = createStorage('memory');
  }
}
```

---

## 🎓 Best Practices

1. ✅ **Always init client** before use
2. ✅ **Use batch operations** when possible
3. ✅ **Handle errors gracefully** with try/catch
4. ✅ **Memoize React hooks** to avoid re-renders
5. ✅ **Clean up resources** with `client.disconnect()`
6. ✅ **Validate inputs** before encryption
7. ✅ **Use TypeScript** for type safety

---

## 🆘 Still Stuck?

If you've tried everything and still have issues:

1. 🔍 Search [GitHub Issues](https://github.com/zama-ai/fhevm/issues)
2. 💬 Ask in [Discord](https://discord.gg/zama)
3. 📧 Email support@zama.ai
4. 🐛 [Open an issue](https://github.com/your-fork/issues/new)

**We're here to help! 🤝**

---

**Made with ❤️ to help you debug faster**

