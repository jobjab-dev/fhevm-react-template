/**
 * FHEVM SDK - Node.js Example
 * 
 * This example demonstrates how to use the FHEVM SDK in a pure Node.js environment
 * without any frontend framework.
 * 
 * Usage:
 *   node index.js
 */

import { createFhevmClient } from 'jobjab-fhevm-sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://eth-sepolia.public.blastapi.io';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const PRIVATE_KEY = process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;

async function main() {
  console.log('🚀 FHEVM SDK - Node.js Example\n');

  // Step 1: Create provider and wallet
  console.log('📡 Connecting to network...');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('✅ Connected!');
  console.log(`   Address: ${wallet.address}\n`);

  // Step 2: Initialize FHEVM client
  console.log('🔐 Initializing FHEVM client...');
  const client = createFhevmClient({
    network: 'sepolia',
    provider: RPC_URL,
    autoInit: false,
  });

  await client.init();
  console.log('✅ FHEVM client ready!\n');

  // Step 3: Encrypt a value
  console.log('🔒 Encrypting value: 42');
  const encryptionResult = await client.encrypt(
    CONTRACT_ADDRESS,
    wallet.address,
    { type: 'euint32', value: 42 }
  );

  console.log('✅ Encrypted successfully!');
  console.log(`   Handle: ${encryptionResult.handles[0].slice(0, 20)}...`);
  console.log(`   Proof size: ${encryptionResult.inputProof.length} bytes\n`);

  // Step 4: Batch encryption
  console.log('🔒 Batch encrypting multiple values...');
  const batchResult = await client.encryptBatch(
    CONTRACT_ADDRESS,
    wallet.address,
    [
      { type: 'euint32', value: 100 },
      { type: 'euint64', value: 20000n },
      { type: 'ebool', value: true },
    ]
  );

  console.log('✅ Batch encrypted successfully!');
  console.log(`   Handles: ${batchResult.handles.length}`);
  console.log(`   Values: 100, 20000, true\n`);

  // Step 5: Generate keypair for decryption
  console.log('🔑 Generating decryption keypair...');
  const keypair = client.generateKeypair();
  console.log('✅ Keypair generated!');
  console.log(`   Public key: ${keypair.publicKey.slice(0, 30)}...\n`);

  // Step 6: Create EIP-712 signature
  console.log('✍️  Creating EIP-712 signature...');
  const eip712 = client.createEIP712(
    keypair.publicKey,
    [CONTRACT_ADDRESS],
    Math.floor(Date.now() / 1000),
    365
  );

  const signatureString = await wallet.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message
  );

  console.log('✅ Signature created!\n');

  // Step 7: Cleanup
  console.log('🧹 Cleaning up...');
  await client.disconnect();
  console.log('✅ Done!\n');

  // Summary
  console.log('📊 Summary:');
  console.log('   • Encrypted 1 single value');
  console.log('   • Batch encrypted 3 values');
  console.log('   • Generated keypair for decryption');
  console.log('   • Created EIP-712 signature\n');

  console.log('💡 Next steps:');
  console.log('   • Deploy a contract using the handles');
  console.log('   • Decrypt values with the signature');
  console.log('   • Integrate into your Node.js application\n');

  console.log('🎉 Example completed successfully!');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

