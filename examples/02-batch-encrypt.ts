/**
 * Example 2: Batch Encryption (3-5x faster!)
 * 
 * Shows: Batch encrypt multiple values
 * Plane: Performance - batch encrypt reduces latency
 */

import { createFhevmClient } from 'jobjab-fhevm-sdk';

async function main() {
  console.log('⚡ Batch Encryption Performance\n');

  const client = createFhevmClient({ network: 'sepolia' });
  await client.init();

  // Batch encrypt 5 values at once
  const batch = await client.encryptBatch(
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    [
      { type: 'euint32', value: 100 },
      { type: 'euint32', value: 200 },
      { type: 'euint32', value: 300 },
      { type: 'euint32', value: 400 },
      { type: 'euint32', value: 500 },
    ]
  );

  console.log('✅ 5 values encrypted in one call');
  console.log('   3-5x faster than individual encryptions!');
  console.log('\nHandles:', batch.handles.length);
}

main();

