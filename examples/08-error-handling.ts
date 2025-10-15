/**
 * Example 8: Error Handling
 * 
 * Shows: Error taxonomy with helpful messages
 * Plane: Error taxonomy - dev can catch and understand errors
 */

import { createFhevmClient, isFhevmError, formatErrorMessage } from 'jobjab-fhevm-sdk';

async function main() {
  console.log('🚨 Error Handling with Helpful Messages\n');

  const client = createFhevmClient({ network: 'sepolia' });
  await client.init();

  // Example 1: Invalid encryption
  try {
    await client.encrypt(
      'invalid-address' as any,
      '0x0000000000000000000000000000000000000000',
      { type: 'euint32', value: 42 }
    );
  } catch (error) {
    if (isFhevmError(error)) {
      console.log('Error Code:', error.code);
      console.log('Message:', error.message);
      console.log('Suggestion:', error.suggestion);
      console.log('Context:', error.context);
    }
  }

  // Example 2: Formatted error message
  try {
    await client.encrypt(
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      { type: 'euint8', value: 256 } // Too large!
    );
  } catch (error) {
    console.log('\n' + formatErrorMessage(error));
  }

  console.log('\n✅ Errors have codes, messages, and suggestions!');
}

main();

