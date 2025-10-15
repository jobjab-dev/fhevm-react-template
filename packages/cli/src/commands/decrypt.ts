/**
 * Decrypt command - Decrypt a ciphertext handle
 */

import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';

interface DecryptOptions {
  contract?: string;
  public?: boolean;
}

const CONFIG_FILE = '.fhevmrc.json';

export async function decryptCommand(handle: string, options: DecryptOptions) {
  console.log(chalk.blue.bold('\n🔓 FHEVM CLI - Decrypt Value\n'));

  // Load config
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(chalk.red('❌ Configuration not found. Run'), chalk.white('fhevm init'), chalk.red('first.\n'));
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  
  const spinner = ora('Initializing FHEVM client...').start();

  try {
    // Dynamic import
    const { createFhevmClient } = await import('../../../fhevm-sdk/dist/core/FhevmClient.js');

    // Create client
    const client = createFhevmClient({
      network: config.network,
      provider: config.rpcUrl,
      autoInit: false,
    });

    await client.init();
    spinner.succeed('FHEVM client initialized');

    const contractAddress = options.contract || config.contractAddress;

    if (options.public) {
      // Public decryption (no signature)
      spinner.text = 'Decrypting publicly...';
      
      const value = await client.publicDecrypt(
        handle,
        contractAddress as `0x${string}`
      );

      spinner.succeed('Value decrypted successfully!');

      console.log(chalk.green('\n✅ Decryption Result:\n'));
      console.log(chalk.gray('  Handle:'), chalk.yellow(handle));
      console.log(chalk.gray('  Value:'), chalk.white(String(value)));
      console.log();

    } else {
      // User decryption (requires signature)
      if (!config.privateKey) {
        spinner.fail('Private key required for user decryption');
        console.error(chalk.red('❌ Set privateKey in config or use --public flag\n'));
        process.exit(1);
      }

      spinner.text = 'Creating wallet...';
      const wallet = new ethers.Wallet(config.privateKey);
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const signer = wallet.connect(provider);

      // Generate keypair
      spinner.text = 'Generating keypair...';
      const keypair = client.generateKeypair();

      // Create EIP-712
      spinner.text = 'Creating EIP-712 message...';
      const eip712 = client.createEIP712(
        keypair.publicKey,
        [contractAddress],
        Math.floor(Date.now() / 1000),
        365
      );

      // Sign
      spinner.text = 'Signing with wallet...';
      const signatureString = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      // Decrypt
      spinner.text = 'Decrypting value...';
      const decrypted = await client.decrypt(
        [{ handle, contractAddress: contractAddress as `0x${string}` }],
        {
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey,
          signature: signatureString.replace('0x', ''),
          startTimestamp: Math.floor(Date.now() / 1000),
          durationDays: 365,
          userAddress: wallet.address as `0x${string}`,
          contractAddresses: [contractAddress as `0x${string}`],
        }
      );

      spinner.succeed('Value decrypted successfully!');

      console.log(chalk.green('\n✅ Decryption Result:\n'));
      console.log(chalk.gray('  Handle:'), chalk.yellow(handle));
      console.log(chalk.gray('  Value:'), chalk.white(String(decrypted[handle])));
      console.log(chalk.gray('  User:'), chalk.white(wallet.address));
      console.log();
    }

    await client.disconnect();

  } catch (error) {
    spinner.fail('Decryption failed');
    console.error(chalk.red('\n❌ Error:'), (error as Error).message);
    console.error(chalk.gray((error as Error).stack));
    process.exit(1);
  }
}

