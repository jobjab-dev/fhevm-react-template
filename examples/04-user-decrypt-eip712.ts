/**
 * Example 4: User Decrypt with EIP-712
 * 
 * Shows: userDecrypt with EIP-712 signing
 * Plane: Core SDK - userDecrypt (EIP-712 sign) flow
 */

import { createFhevmClient } from 'jobjab-fhevm-sdk';
import { ethers } from 'ethers';

const PRIVATE_KEY = ethers.Wallet.createRandom().privateKey;

async function main() {
  console.log('🔓 User Decrypt with EIP-712\n');

  const provider = new ethers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const client = createFhevmClient({ network: 'sepolia', provider });
  await client.init();

  // Generate keypair
  const keypair = client.generateKeypair();

  // Create EIP-712 message
  const eip712 = client.createEIP712(
    keypair.publicKey,
    ['0x0000000000000000000000000000000000000000'],
    Math.floor(Date.now() / 1000),
    365
  );

  // Sign
  const sig = await wallet.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message
  );

  console.log('✅ EIP-712 signature created');
  console.log('   User:', wallet.address);
  console.log('   Valid for: 365 days');
}

main();

