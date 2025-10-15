/**
 * Example 3: Struct Encryption
 * 
 * Shows: encryptStruct<T>() for typed objects
 * Plane: Core SDK - encryptStruct with named fields
 */

import { createFhevmClient } from 'jobjab-fhevm-sdk';

async function main() {
  console.log('📦 Struct Encryption\n');

  const client = createFhevmClient({ network: 'sepolia' });
  await client.init();

  // Encrypt structured data
  const { result, fields } = await client.encryptStruct(
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    {
      balance: { type: 'euint64', value: 5000n },
      age: { type: 'euint8', value: 25 },
      isActive: { type: 'ebool', value: true },
    }
  );

  console.log('✅ Struct encrypted');
  console.log('Fields:', fields);
  console.log('Handles:', result.handles.length);
}

main();

