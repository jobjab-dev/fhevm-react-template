/**
 * Example 5: Public Decrypt
 * 
 * Shows: publicDecrypt without signature
 * Plane: Core SDK - publicDecrypt for public values
 */

import { createFhevmClient } from 'jobjab-fhevm-sdk';

async function main() {
  console.log('🔓 Public Decryption (no signature needed)\n');

  const client = createFhevmClient({ network: 'sepolia' });
  await client.init();

  // Public decrypt - no EIP-712 signature required
  try {
    const value = await client.publicDecrypt(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000'
    );

    console.log('✅ Publicly decrypted value:', value);
  } catch (error: any) {
    console.log('ℹ️  Need real public handle from contract');
    console.log('   Contract must call FHE.allowThis() to make value public');
  }
}

main();

