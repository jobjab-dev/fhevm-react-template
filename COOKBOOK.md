# 👨‍🍳 FHEVM Cookbook

Common recipes and patterns for building with FHEVM SDK.

## 🎯 Table of Contents

- [Encryption Recipes](#encryption-recipes)
- [Decryption Recipes](#decryption-recipes)
- [Contract Interaction](#contract-interaction)
- [React Patterns](#react-patterns)
- [Advanced Patterns](#advanced-patterns)

---

## 🔐 Encryption Recipes

### Recipe 1: Encrypt Single Value

**Use case:** Simple encrypted input

```typescript
import { createFhevmClient } from 'fhevm-sdk/core';

const client = await createFhevmClient({ network: 'sepolia' });
await client.init();

const result = await client.encrypt(
  '0xContractAddress',
  '0xUserAddress',
  { type: 'euint32', value: 42 }
);

// Use result
const { handle, proof } = client.utils.formatEncryptionResult(result);
await contract.myFunction(handle, proof);
```

### Recipe 2: Batch Encrypt Multiple Values

**Use case:** Multiple inputs for single function call

```typescript
// 3-5x faster than individual encryptions!
const batch = await client.encryptBatch(
  contractAddress,
  userAddress,
  [
    { type: 'euint32', value: 100 },
    { type: 'euint64', value: 20000n },
    { type: 'ebool', value: true },
  ]
);

// Use in contract
await contract.batchFunction(
  batch.handles[0],  // euint32: 100
  batch.handles[1],  // euint64: 20000
  batch.handles[2],  // ebool: true
  batch.inputProof
);
```

### Recipe 3: Encrypt Struct

**Use case:** Grouped encrypted data with named fields

```typescript
const { result, fields } = await client.encryptStruct(
  contractAddress,
  userAddress,
  {
    balance: { type: 'euint64', value: 5000n },
    age: { type: 'euint8', value: 25 },
    isActive: { type: 'ebool', value: true },
  }
);

// Map fields to handles
const params = {
  balance: result.handles[fields.indexOf('balance')],
  age: result.handles[fields.indexOf('age')],
  isActive: result.handles[fields.indexOf('isActive')],
  proof: result.inputProof,
};
```

### Recipe 4: Conditional Encryption

**Use case:** Only encrypt if value should be private

```typescript
async function smartEncrypt(value: number, isPrivate: boolean) {
  if (isPrivate) {
    // Encrypt for confidential operations
    const encrypted = await client.encrypt(addr, user, {
      type: 'euint32',
      value,
    });
    return { encrypted: true, data: encrypted };
  } else {
    // Use plain value for public operations
    return { encrypted: false, data: value };
  }
}
```

---

## 🔓 Decryption Recipes

### Recipe 5: User Decrypt with Signature

**Use case:** User views their private data

```typescript
// Step 1: Generate keypair
const keypair = client.generateKeypair();

// Step 2: Create EIP-712 message
const eip712 = client.createEIP712(
  keypair.publicKey,
  [contractAddress],
  Math.floor(Date.now() / 1000),
  365 // Valid for 1 year
);

// Step 3: Sign with wallet
const signatureString = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
);

// Step 4: Create signature object
const signature = {
  publicKey: keypair.publicKey,
  privateKey: keypair.privateKey,
  signature: signatureString.replace('0x', ''),
  startTimestamp: Math.floor(Date.now() / 1000),
  durationDays: 365,
  userAddress: await signer.getAddress(),
  contractAddresses: [contractAddress],
};

// Step 5: Decrypt
const handle = await contract.getMyValue();
const decrypted = await client.decrypt(
  [{ handle, contractAddress }],
  signature
);

console.log('My value:', decrypted[handle]);
```

### Recipe 6: Batch Decrypt

**Use case:** Decrypt multiple values at once

```typescript
const handles = [
  await contract.getValue1(),
  await contract.getValue2(),
  await contract.getValue3(),
];

const decrypted = await client.decrypt(
  handles.map(handle => ({ handle, contractAddress })),
  signature
);

console.log('Values:', handles.map(h => decrypted[h]));
```

### Recipe 7: Public Decrypt

**Use case:** Reveal publicly accessible encrypted value

```typescript
// No signature needed!
const publicHandle = await contract.getPublicValue();
const value = await client.publicDecrypt(publicHandle, contractAddress);

console.log('Public value:', value);
```

### Recipe 8: Cached Signature

**Use case:** Reuse signature across multiple decryptions

```typescript
// Create signature once
const signature = await createSignature();

// Use for multiple decryptions
const value1 = await client.decrypt([{ handle: h1, contractAddress }], signature);
const value2 = await client.decrypt([{ handle: h2, contractAddress }], signature);
const value3 = await client.decrypt([{ handle: h3, contractAddress }], signature);

// Check if still valid
if (client.utils.isSignatureValid(signature)) {
  console.log('Signature still valid!');
}
```

---

## 📜 Contract Interaction

### Recipe 9: Send Encrypted Transaction

**Use case:** Call contract function with encrypted input

```typescript
// Encrypt input
const encrypted = await client.encrypt(contractAddr, userAddr, {
  type: 'euint32',
  value: 1000,
});

// Get contract instance
const contract = new ethers.Contract(contractAddr, abi, signer);

// Call function
const tx = await contract.transfer(
  recipientAddress,
  encrypted.handles[0],
  encrypted.inputProof
);

// Wait for confirmation
const receipt = await tx.wait();
console.log('Transaction confirmed:', receipt.hash);
```

### Recipe 10: Read Encrypted Value

**Use case:** Get encrypted value from contract

```typescript
// Read ciphertext handle
const encryptedBalance = await contract.balanceOf(userAddress);

// Display handle (without revealing value)
console.log('Encrypted balance:', encryptedBalance);

// User can decrypt to view
const decrypted = await client.decrypt(
  [{ handle: encryptedBalance, contractAddress }],
  signature
);

console.log('Actual balance:', decrypted[encryptedBalance]);
```

### Recipe 11: Handle Contract Events

**Use case:** Listen for encrypted events

```typescript
// Listen for events
contract.on('Transfer', async (from, to, encryptedAmount) => {
  console.log('Transfer event:', from, '→', to);
  
  // Decrypt amount if user has permission
  try {
    const amount = await client.decrypt(
      [{ handle: encryptedAmount, contractAddress }],
      signature
    );
    console.log('Amount:', amount[encryptedAmount]);
  } catch {
    console.log('No permission to decrypt amount');
  }
});
```

---

## ⚛️ React Patterns

### Recipe 12: Complete Encryption Flow (React)

**Use case:** Full encryption with UI feedback

```tsx
import { useEncrypt } from 'fhevm-sdk/adapters/react';
import { EncryptedInput } from 'fhevm-sdk/components/react';

function TransferForm() {
  const [amount, setAmount] = useState(0);
  const [result, setResult] = useState(null);

  const { encrypt, isEncrypting, error } = useEncrypt({
    contractAddress,
    userAddress,
    onSuccess: (encrypted) => {
      setResult(encrypted);
      submitToContract(encrypted);
    },
    onError: (err) => alert(err.message),
  });

  return (
    <div>
      <EncryptedInput
        type="euint64"
        contractAddress={contractAddress}
        userAddress={userAddress}
        onEncrypted={(encrypted) => {
          setResult(encrypted);
        }}
        label="Transfer Amount"
      />
      
      {isEncrypting && <p>Encrypting...</p>}
      {error && <p>Error: {error.message}</p>}
      {result && <p>✅ Encrypted!</p>}
    </div>
  );
}
```

### Recipe 13: Decryption with Loading States

**Use case:** Show progress during decryption

```tsx
import { useDecrypt, useDecryptionSignature } from 'fhevm-sdk/adapters/react';

function BalanceViewer({ handle }) {
  const { signature, sign, isSigning } = useDecryptionSignature({
    contractAddresses: [contractAddress],
    signer,
  });

  const { decrypt, isDecrypting, data } = useDecrypt({
    requests: [{ handle, contractAddress }],
    signature: signature!,
    enabled: Boolean(signature),
  });

  if (isSigning) return <p>⏳ Please sign in MetaMask...</p>;
  if (isDecrypting) return <p>⏳ Decrypting...</p>;
  if (data) return <p>💰 Balance: {String(data[handle])}</p>;
  
  return <button onClick={sign}>🔓 View Balance</button>;
}
```

### Recipe 14: Auto-Refresh Encrypted Data

**Use case:** Keep decrypted values up-to-date

```tsx
function LiveCounter() {
  const [handle, setHandle] = useState<string>();
  const { decrypt, data } = useDecrypt({
    requests: handle ? [{ handle, contractAddress }] : [],
    signature,
    enabled: Boolean(handle && signature),
  });

  // Refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const newHandle = await contract.getCount();
      setHandle(newHandle);
      if (newHandle !== handle) {
        await decrypt();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [handle, decrypt]);

  return <div>Count: {data ? String(data[handle!]) : 'Loading...'}</div>;
}
```

---

## 🎨 Advanced Patterns

### Recipe 15: Transaction Queue

**Use case:** Queue multiple encrypted transactions

```typescript
class EncryptedTxQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add(fn: () => Promise<any>) {
    this.queue.push(fn);
    if (!this.processing) {
      await this.process();
    }
  }

  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      try {
        await fn();
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    }
    
    this.processing = false;
  }
}

// Usage
const txQueue = new EncryptedTxQueue();

await txQueue.add(async () => {
  const enc = await client.encrypt(...);
  await contract.function1(enc.handles[0], enc.inputProof);
});

await txQueue.add(async () => {
  const enc = await client.encrypt(...);
  await contract.function2(enc.handles[0], enc.inputProof);
});
```

### Recipe 16: Signature Pool

**Use case:** Manage multiple signatures for different contracts

```typescript
class SignaturePool {
  private signatures = new Map<string, DecryptionSignature>();

  async getOrCreate(
    client: FhevmClient,
    contractAddress: string,
    signer: any
  ): Promise<DecryptionSignature> {
    // Check cache
    const cached = this.signatures.get(contractAddress);
    if (cached && client.utils.isSignatureValid(cached)) {
      return cached;
    }

    // Create new signature
    const keypair = client.generateKeypair();
    const eip712 = client.createEIP712(
      keypair.publicKey,
      [contractAddress],
      Math.floor(Date.now() / 1000),
      365
    );

    const sig = await signer.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    );

    const signature = {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
      signature: sig.replace('0x', ''),
      startTimestamp: Math.floor(Date.now() / 1000),
      durationDays: 365,
      userAddress: await signer.getAddress(),
      contractAddresses: [contractAddress],
    };

    this.signatures.set(contractAddress, signature);
    return signature;
  }

  clear() {
    this.signatures.clear();
  }
}
```

### Recipe 17: Progressive Encryption

**Use case:** Encrypt large datasets incrementally

```typescript
async function encryptLargeDataset(
  values: number[],
  onProgress?: (percent: number) => void
) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    
    const encrypted = await client.encryptBatch(
      contractAddress,
      userAddress,
      batch.map(v => ({ type: 'euint32', value: v }))
    );
    
    results.push(encrypted);
    
    // Report progress
    const percent = Math.min(100, ((i + batchSize) / values.length) * 100);
    onProgress?.(percent);
  }
  
  return results;
}

// Usage
await encryptLargeDataset(
  [1, 2, 3, ..., 100],
  (percent) => console.log(`${percent}% complete`)
);
```

### Recipe 18: Conditional Decryption

**Use case:** Decrypt only if user has permission

```typescript
async function tryDecrypt(handle: string) {
  try {
    const value = await client.decrypt(
      [{ handle, contractAddress }],
      signature
    );
    return { success: true, value: value[handle] };
  } catch (error: any) {
    if (error.code === 'DECRYPT_3005') {
      return { success: false, error: 'Permission denied' };
    }
    throw error;
  }
}

// Usage
const result = await tryDecrypt('0x...');
if (result.success) {
  console.log('Value:', result.value);
} else {
  console.log('Cannot decrypt:', result.error);
}
```

---

## 💎 Best Practices

### Recipe 19: Error Handling

**Use case:** Graceful error handling with user feedback

```tsx
import { isFhevmError, formatErrorMessage } from 'fhevm-sdk/core';

function MyComponent() {
  const handleOperation = async () => {
    try {
      await client.encrypt(...);
    } catch (error) {
      if (isFhevmError(error)) {
        // FhevmError - show friendly message
        alert(formatErrorMessage(error));
        
        // Handle specific errors
        switch (error.code) {
          case 'WALLET_5001':
            console.log('User rejected signature');
            break;
          case 'DECRYPT_3005':
            console.log('No permission to decrypt');
            break;
          default:
            console.error('Unknown error:', error);
        }
      } else {
        // Generic error
        alert('An error occurred: ' + error.message);
      }
    }
  };

  return <button onClick={handleOperation}>Execute</button>;
}
```

### Recipe 20: Optimistic Updates

**Use case:** Update UI before transaction confirms

```tsx
function OptimisticCounter() {
  const [optimisticCount, setOptimisticCount] = useState(0);
  const [actualHandle, setActualHandle] = useState<string>();

  const increment = async () => {
    // Update UI immediately
    setOptimisticCount(prev => prev + 1);

    try {
      // Encrypt and send transaction
      const encrypted = await encrypt({ type: 'euint32', value: 1 });
      const tx = await contract.increment(encrypted.handles[0], encrypted.inputProof);
      
      // Wait for confirmation
      await tx.wait();
      
      // Get actual value
      const handle = await contract.getCount();
      setActualHandle(handle);
      
      // Decrypt actual value
      const decrypted = await decrypt([{ handle, contractAddress }], signature);
      setOptimisticCount(Number(decrypted[handle]));
    } catch (error) {
      // Revert optimistic update
      setOptimisticCount(prev => prev - 1);
      alert('Transaction failed');
    }
  };

  return <div>Count: {optimisticCount}</div>;
}
```

### Recipe 21: Encryption Validation

**Use case:** Validate before encrypting

```typescript
function validateBeforeEncrypt(type: FheType, value: any): boolean {
  switch (type) {
    case 'euint8':
      return typeof value === 'number' && value >= 0 && value <= 255;
    
    case 'euint32':
      const num = BigInt(value);
      return num >= 0n && num <= 4294967295n;
    
    case 'ebool':
      return typeof value === 'boolean';
    
    case 'eaddress':
      return /^0x[0-9a-fA-F]{40}$/.test(value);
    
    default:
      return true;
  }
}

// Usage
if (validateBeforeEncrypt('euint32', userInput)) {
  await client.encrypt(addr, user, { type: 'euint32', value: userInput });
} else {
  alert('Invalid input for euint32');
}
```

---

## 🎯 Real-World Examples

### Recipe 22: Confidential Token Transfer

```typescript
async function confidentialTransfer(
  to: string,
  amount: bigint
) {
  // 1. Encrypt amount
  const encrypted = await client.encrypt(
    tokenAddress,
    senderAddress,
    { type: 'euint64', value: amount }
  );

  // 2. Call transfer
  const tx = await tokenContract.transfer(
    to,
    encrypted.handles[0],
    encrypted.inputProof
  );

  // 3. Wait for confirmation
  const receipt = await tx.wait();

  // 4. Get new balance
  const newBalanceHandle = await tokenContract.balanceOf(senderAddress);

  // 5. Decrypt to view
  const decrypted = await client.decrypt(
    [{ handle: newBalanceHandle, contractAddress: tokenAddress }],
    signature
  );

  console.log('New balance:', decrypted[newBalanceHandle]);
}
```

### Recipe 23: Secret Voting

```typescript
async function castSecretVote(
  proposalId: number,
  voteValue: boolean
) {
  // 1. Encrypt vote (true = yes, false = no)
  const encrypted = await client.encrypt(
    governanceAddress,
    voterAddress,
    { type: 'ebool', value: voteValue }
  );

  // 2. Submit vote
  const tx = await governanceContract.vote(
    proposalId,
    encrypted.handles[0],
    encrypted.inputProof
  );

  await tx.wait();

  // 3. Verify vote was recorded (without revealing value)
  const hasVoted = await governanceContract.hasVoted(proposalId, voterAddress);
  console.log('Vote recorded:', hasVoted);
}
```

### Recipe 24: Sealed-Bid Auction

```typescript
async function placeBid(
  auctionId: number,
  bidAmount: bigint
) {
  // 1. Encrypt bid amount
  const encrypted = await client.encrypt(
    auctionAddress,
    bidderAddress,
    { type: 'euint64', value: bidAmount }
  );

  // 2. Place bid
  const tx = await auctionContract.placeBid(
    auctionId,
    encrypted.handles[0],
    encrypted.inputProof
  );

  await tx.wait();
  console.log('Bid placed successfully! Amount remains secret.');

  // 3. After auction ends, check if won
  const winner = await auctionContract.getWinner(auctionId);
  
  if (winner === bidderAddress) {
    // Decrypt winning bid
    const winningBidHandle = await auctionContract.getWinningBid(auctionId);
    const decrypted = await client.decrypt(
      [{ handle: winningBidHandle, contractAddress: auctionAddress }],
      signature
    );
    console.log('You won with bid:', decrypted[winningBidHandle]);
  }
}
```

---

## 🛠️ Integration Patterns

### Recipe 25: Express.js API

```typescript
import express from 'express';
import { createFhevmClient } from 'fhevm-sdk/core';

const app = express();
const client = await createFhevmClient({ network: 'sepolia' });

app.post('/api/encrypt', async (req, res) => {
  try {
    const { value, type } = req.body;
    
    const result = await client.encrypt(
      req.body.contractAddress,
      req.body.userAddress,
      { type, value }
    );
    
    res.json({
      success: true,
      handle: result.handles[0],
      proof: result.inputProof,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(3000);
```

### Recipe 26: Next.js API Route

```typescript
// app/api/encrypt/route.ts
import { NextResponse } from 'next/server';
import { createFhevmClient } from 'fhevm-sdk/core';

const client = await createFhevmClient({ network: 'sepolia' });

export async function POST(request: Request) {
  try {
    const { value, type, contractAddress, userAddress } = await request.json();
    
    const result = await client.encrypt(
      contractAddress,
      userAddress,
      { type, value }
    );
    
    return NextResponse.json({
      success: true,
      handle: result.handles[0],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🎁 Bonus Recipes

### Recipe 27: Multi-Contract Operations

```typescript
// Encrypt once, use with multiple contracts
const encrypted = await client.encrypt(contractA, user, {
  type: 'euint32',
  value: 100,
});

// Use same encrypted value in different contracts
await contractA.functionA(encrypted.handles[0], encrypted.inputProof);
await contractB.functionB(encrypted.handles[0], encrypted.inputProof);
```

### Recipe 28: Signature Refresh

```typescript
// Check and refresh signature before expiry
async function ensureValidSignature(signature: DecryptionSignature) {
  const remainingTime = client.utils.getSignatureRemainingTime(signature);
  
  // Refresh if less than 1 day remaining
  if (remainingTime < 24 * 60 * 60) {
    console.log('Signature expiring soon, refreshing...');
    return await createNewSignature();
  }
  
  return signature;
}
```

### Recipe 29: Type-Safe Contract Calls

```typescript
// Define typed contract interface
interface MyContract {
  transfer(to: string, amount: string, proof: string): Promise<any>;
  balanceOf(user: string): Promise<string>;
}

// Type-safe wrapper
async function transferWithEncryption(
  contract: MyContract,
  to: string,
  amount: bigint
) {
  const encrypted = await client.encrypt(
    contractAddress,
    userAddress,
    { type: 'euint64', value: amount }
  );

  return contract.transfer(
    to,
    client.utils.formatEncryptionResult(encrypted).handle,
    client.utils.formatEncryptionResult(encrypted).proof
  );
}
```

---

## 📚 Learn More

- [SDK Documentation](packages/fhevm-sdk/README.md)
- [Examples](examples/README.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [API Reference](packages/fhevm-sdk/API.md)

---

**Made with 👨‍🍳 for delicious FHE recipes**

