# 🟢 FHEVM SDK - Node.js Example

Server-side encryption and decryption using FHEVM SDK in pure Node.js (no frontend framework).

## ✨ Features

- ✅ Framework-agnostic FHEVM operations
- ✅ Server-side encryption/decryption
- ✅ Batch operations
- ✅ EIP-712 signature generation
- ✅ Works in any Node.js environment

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run example
npm start
```

## 📋 Requirements

- Node.js >= 20.0.0
- Ethereum wallet with private key
- Access to Sepolia RPC (or local node)

## 🔧 Configuration

Create a `.env` file:

```env
# RPC endpoint
RPC_URL=https://eth-sepolia.public.blastapi.io

# Contract address (or use zero address for testing)
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Your private key (DO NOT commit this!)
PRIVATE_KEY=0x...
```

## 📖 Examples

### Basic Usage

```javascript
import { createFhevmClient } from 'jobjab-fhevm-sdk/core';

// Create client
const client = createFhevmClient({
  network: 'sepolia',
  provider: 'https://eth-sepolia.public.blastapi.io',
});

await client.init();

// Encrypt
const result = await client.encrypt(
  contractAddress,
  userAddress,
  { type: 'euint32', value: 42 }
);

console.log('Encrypted:', result.handles[0]);
```

### Batch Encryption

```javascript
const batchResult = await client.encryptBatch(
  contractAddress,
  userAddress,
  [
    { type: 'euint32', value: 100 },
    { type: 'euint64', value: 20000n },
    { type: 'ebool', value: true },
  ]
);

console.log('Batch encrypted:', batchResult.handles.length, 'values');
```

### Decryption with Signature

```javascript
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
const signature = await wallet.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
);

// 4. Decrypt
const decrypted = await client.decrypt(
  [{ handle: '0x...', contractAddress }],
  {
    publicKey: keypair.publicKey,
    privateKey: keypair.privateKey,
    signature: signature.replace('0x', ''),
    startTimestamp: Math.floor(Date.now() / 1000),
    durationDays: 365,
    userAddress: wallet.address,
    contractAddresses: [contractAddress],
  }
);

console.log('Decrypted value:', decrypted['0x...']);
```

## 🎯 Use Cases

### 1. Backend API

```javascript
import express from 'express';
import { createFhevmClient } from 'jobjab-fhevm-sdk/core';

const app = express();
const client = await createFhevmClient({ network: 'sepolia' });

app.post('/encrypt', async (req, res) => {
  const { value, type } = req.body;
  
  const result = await client.encrypt(
    CONTRACT_ADDRESS,
    USER_ADDRESS,
    { type, value }
  );
  
  res.json({ handle: result.handles[0] });
});

app.listen(3000);
```

### 2. Batch Processing

```javascript
// Process multiple encryptions in parallel
const values = [1, 2, 3, 4, 5];

const results = await Promise.all(
  values.map(value => 
    client.encrypt(contractAddress, userAddress, { type: 'euint32', value })
  )
);

console.log('Encrypted', results.length, 'values');
```

### 3. Scheduled Jobs

```javascript
import cron from 'node-cron';

// Encrypt data every hour
cron.schedule('0 * * * *', async () => {
  const data = await fetchDataFromDatabase();
  
  const encrypted = await client.encryptBatch(
    contractAddress,
    userAddress,
    data.map(item => ({ type: 'euint64', value: item.value }))
  );
  
  await saveToBlockchain(encrypted);
});
```

## 📚 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run the main example |
| `npm run encrypt` | Encryption-only example |
| `npm run decrypt` | Decryption-only example |

## 🔒 Security Notes

- **Never commit private keys** to version control
- Use environment variables for sensitive data
- Implement proper error handling in production
- Validate all inputs before encryption
- Use secure storage for signatures

## 🚨 Troubleshooting

### "Cannot find module 'jobjab-fhevm-sdk'"

```bash
# Build the SDK first
cd ../../packages/fhevm-sdk
npm install
npm run build
cd ../../examples/nodejs
npm install
```

### "Provider not reachable"

Check your RPC URL in `.env`:
```env
RPC_URL=https://eth-sepolia.public.blastapi.io
```

### "Invalid private key"

Make sure your private key is valid:
```javascript
// Generate a new wallet for testing
import { ethers } from 'ethers';
const wallet = ethers.Wallet.createRandom();
console.log('Private key:', wallet.privateKey);
```

## 📖 Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama Documentation](https://docs.zama.ai/)
- [Node.js Best Practices](https://nodejs.org/en/docs/)

## 🤝 Contributing

Found a bug or have a suggestion? Please open an issue!

---

**Made with ❤️ for the FHE community**

