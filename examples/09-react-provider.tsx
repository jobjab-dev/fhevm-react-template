/**
 * Example 9: React Provider Pattern
 * 
 * Shows: Wagmi-like Provider + hooks
 * Plane: Wagmi-like API - Provider pattern
 */

import { FhevmProvider, useFhevmClient, useEncrypt } from 'jobjab-fhevm-sdk/adapters/react';

// App wrapper
export function App() {
  return (
    <FhevmProvider config={{ network: 'sepolia', provider: window.ethereum }}>
      <EncryptComponent />
    </FhevmProvider>
  );
}

// Component using hooks
function EncryptComponent() {
  const client = useFhevmClient();
  const { encrypt, isEncrypting, error } = useEncrypt({
    contractAddress: '0x0000000000000000000000000000000000000000',
    userAddress: '0x0000000000000000000000000000000000000000',
  });

  const handleClick = async () => {
    const result = await encrypt({ type: 'euint32', value: 100 });
    console.log('Encrypted!', result);
  };

  return (
    <button onClick={handleClick} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
    </button>
  );
}

/*
Usage:
1. Wrap app with <FhevmProvider>
2. Use hooks: useFhevmClient(), useEncrypt(), useDecrypt()
3. Wagmi-like pattern - familiar to Web3 devs!
*/

