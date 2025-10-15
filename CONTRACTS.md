# 📜 Contract Tooling Guide

Complete guide for working with FHEVM smart contracts in this monorepo.

## 🚀 Quick Start

```bash
# All-in-one: Build → Deploy → Generate ABIs
pnpm contracts:all

# Or run individually:
pnpm contracts:build        # Compile contracts
pnpm contracts:deploy       # Deploy to localhost
pnpm contracts:abi          # Generate TypeScript ABIs
```

---

## 📦 Available Scripts

### From Root

| Command | Description |
|---------|-------------|
| `pnpm contracts:build` | Compile Solidity contracts |
| `pnpm contracts:deploy` | Deploy contracts to localhost |
| `pnpm contracts:deploy:sepolia` | Deploy contracts to Sepolia testnet |
| `pnpm contracts:abi` | Generate TypeScript ABI definitions |
| `pnpm contracts:all` | Run all steps: build → deploy → ABI |
| `pnpm chain` | Start local Hardhat node |
| `pnpm compile` | Alias for contracts:build |

### Testing & Verification

| Command | Description |
|---------|-------------|
| `pnpm test` | Run contract tests |
| `pnpm hardhat:test` | Run Hardhat tests |
| `pnpm hardhat:verify` | Verify contracts |
| `pnpm hardhat:verify:sepolia` | Verify on Sepolia |

---

## 🛠️ Development Workflow

### 1. Start Local Development

```bash
# Terminal 1: Start local blockchain
pnpm chain
# RPC: http://127.0.0.1:8545
# Chain ID: 31337

# Terminal 2: Compile and deploy
pnpm contracts:all

# Terminal 3: Start frontend
pnpm start
```

### 2. Add New Contract

1. Create contract in `packages/hardhat/contracts/`
2. Compile: `pnpm contracts:build`
3. Create deploy script in `packages/hardhat/deploy/`
4. Deploy: `pnpm contracts:deploy`
5. Generate ABIs: `pnpm contracts:abi`

### 3. Deploy to Sepolia

```bash
# Make sure you have:
# - MNEMONIC in .env
# - INFURA_API_KEY in .env
# - Sepolia ETH in your wallet

pnpm contracts:deploy:sepolia
```

---

## 📂 Directory Structure

```
packages/
├── hardhat/                    # Smart contracts
│   ├── contracts/             # Solidity files
│   │   └── FHECounter.sol     # Example contract
│   ├── deploy/                # Deploy scripts
│   │   └── deploy.ts          # Deployment logic
│   ├── test/                  # Contract tests
│   │   ├── FHECounter.ts      # Local tests
│   │   └── FHECounterSepolia.ts # Testnet tests
│   └── hardhat.config.ts      # Hardhat configuration
│
├── nextjs/
│   └── contracts/             # Generated ABIs
│       └── deployedContracts.ts  # Auto-generated
│
└── fhevm-sdk/                 # SDK for contract interactions
```

---

## 🔐 Example: FHECounter Contract

### Contract Code

```solidity
// packages/hardhat/contracts/FHECounter.sol
import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";

contract FHECounter {
  euint32 private _count;

  function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedEuint32 = FHE.fromExternal(inputEuint32, inputProof);
    _count = FHE.add(_count, encryptedEuint32);
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
  }

  function getCount() external view returns (euint32) {
    return _count;
  }
}
```

### Usage from Frontend

```typescript
import { useEncrypt, useDecrypt } from 'fhevm-sdk/adapters/react';
import deployedContracts from '~/contracts/deployedContracts';

function Counter() {
  const contract = deployedContracts[31337].FHECounter;
  
  // Encrypt value
  const { encrypt } = useEncrypt({
    contractAddress: contract.address,
    userAddress: '0x...',
  });
  
  const result = await encrypt({ type: 'euint32', value: 1 });
  
  // Call contract
  await contract.increment(result.handles[0], result.inputProof);
}
```

---

## 🎯 Contract Templates

### Basic Confidential Token

```solidity
contract ConfidentialToken {
  mapping(address => euint64) private balances;
  
  function transfer(address to, externalEuint64 amount, bytes calldata proof) external {
    euint64 value = FHE.fromExternal(amount, proof);
    balances[msg.sender] = FHE.sub(balances[msg.sender], value);
    balances[to] = FHE.add(balances[to], value);
    
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allow(balances[to], to);
  }
}
```

### Sealed-Bid Auction

```solidity
contract SealedBidAuction {
  mapping(address => euint64) private bids;
  uint256 public endTime;
  
  function placeBid(externalEuint64 amount, bytes calldata proof) external {
    require(block.timestamp < endTime, "Auction ended");
    euint64 value = FHE.fromExternal(amount, proof);
    bids[msg.sender] = value;
    FHE.allow(value, msg.sender);
  }
}
```

---

## 🔍 Testing

### Local Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm hardhat:test --grep "FHECounter"
```

### Test Example

```typescript
it("should increment counter", async function () {
  const encryptedOne = await fhevm
    .createEncryptedInput(contractAddress, signer.address)
    .add32(1)
    .encrypt();

  await contract.increment(encryptedOne.handles[0], encryptedOne.inputProof);
  
  const encryptedCount = await contract.getCount();
  const decryptedCount = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    encryptedCount,
    contractAddress,
    signer
  );
  
  expect(decryptedCount).to.eq(1);
});
```

---

## 🚨 Troubleshooting

### "Cannot find module 'hardhat'"

```bash
# Make sure submodule is initialized
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### "Deployment failed"

```bash
# Clean and rebuild
pnpm hardhat:clean
pnpm contracts:build
pnpm contracts:deploy
```

### "Nonce too high" (MetaMask)

1. Open MetaMask
2. Settings → Advanced
3. Clear activity tab data
4. Restart browser

### "Contract not found in deployedContracts.ts"

```bash
# Regenerate ABIs
pnpm contracts:abi
```

---

## 📚 Additional Resources

- [FHEVM Solidity Library](https://docs.zama.ai/protocol/solidity-guides)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Zama Examples](https://docs.zama.ai/protocol/examples)

---

**Next Steps:**
1. Explore example contracts
2. Write your own confidential dApp
3. Deploy to testnet
4. Submit to [Zama Developer Program](https://www.zama.ai/programs/developer-program)!

