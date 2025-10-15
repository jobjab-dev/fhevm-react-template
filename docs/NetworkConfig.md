# NetworkConfig

Network configuration for FHEVM.

## Type

```typescript
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  isTestnet?: boolean;
  
  // FHEVM Contract Addresses (Host Chain)
  aclContractAddress: `0x${string}`;
  kmsContractAddress: `0x${string}`;
  inputVerifierContractAddress: `0x${string}`;
  
  // Gateway Contract Addresses
  verifyingContractAddressDecryption: `0x${string}`;
  verifyingContractAddressInputVerification: `0x${string}`;
  
  // Gateway Chain ID
  gatewayChainId: number;
  
  // Relayer URL
  relayerUrl: string;
}
```

## Predefined Networks

### Sepolia

```typescript
{
  chainId: 11155111,
  name: 'Sepolia Testnet',
  isTestnet: true,
  aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
  kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
  inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
  verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
  verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
  gatewayChainId: 55815,
  relayerUrl: 'https://relayer.testnet.zama.cloud',
}
```

### Localhost

```typescript
{
  chainId: 31337,
  name: 'Localhost',
  rpcUrl: 'http://localhost:8545',
  isTestnet: true,
  // Addresses auto-detected for Hardhat nodes
  ...
}
```

## Usage

```typescript
// Use preset
const client = createFhevmClient({ network: 'sepolia' });

// Custom network
const client = createFhevmClient({
  network: {
    chainId: 11155111,
    name: 'My Custom Network',
    aclContractAddress: '0x...',
    // ... other addresses
  }
});
```

## Contract Addresses

All addresses from [Zama docs](https://docs.zama.ai/protocol/solidity-guides/smart-contract/configure/contract_addresses).

## See Also

- [FhevmClient](FhevmClient.md)
- [Initialization Example](../examples/01-init-encrypt.ts)

