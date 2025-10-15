/**
 * Example 1: Initialize and Encrypt
 * 
 * Shows: FheClient initialization and basic encryption
 * Plane: Core SDK - encryptScalar
 */

import { createFhevmClient } from 'jobjab-fhevm-sdk';

async function main() {
  console.log('🔐 Initialize and Encrypt\n');

  // Initialize FheClient
  const client = createFhevmClient({
    network: 'sepolia',
    provider: 'https://eth-sepolia.public.blastapi.io',
  });

  await client.init();
  console.log('✅ Client initialized\n');

  // Encrypt scalar value
  const result = await client.encrypt(
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    { type: 'euint256', value: 1000n }
  );

  console.log('Handle:', result.handles[0]);
  console.log('Proof size:', result.inputProof.length, 'bytes');
}

main();

