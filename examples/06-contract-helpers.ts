/**
 * Example 6: Contract Helpers
 * 
 * Shows: readCipher, buildParams, ACL helpers
 * Plane: Contract helpers - callEncrypted, readCipher, decode
 */

import { 
  isCiphertextHandle,
  isValidContractAddress,
  findEncryptedInputs,
} from 'jobjab-fhevm-sdk';

async function main() {
  console.log('🔧 Contract Helpers\n');

  // Validate ciphertext handle
  const handle = '0x1234567890123456789012345678901234567890123456789012345678901234';
  console.log('Is valid handle?', isCiphertextHandle(handle));

  // Validate contract address
  const addr = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  console.log('Is valid address?', isValidContractAddress(addr));

  // Find encrypted inputs in ABI
  const abi = [
    {
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address', internalType: 'address' },
        { name: 'amount', type: 'bytes32', internalType: 'externalEuint64' },
        { name: 'proof', type: 'bytes', internalType: 'bytes' },
      ],
    },
  ];

  const encryptedInputs = findEncryptedInputs(abi, 'transfer');
  console.log('\nEncrypted inputs in transfer():', encryptedInputs);
}

main();

