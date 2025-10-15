/**
 * Encrypt command - Encrypt a value
 */

import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';

interface EncryptOptions {
  type?: string;
  contract?: string;
  user?: string;
}

const CONFIG_FILE = '.fhevmrc.json';

export async function encryptCommand(value: string, options: EncryptOptions) {
  console.log(chalk.blue.bold('\n🔒 FHEVM CLI - Encrypt Value\n'));

  // Load config
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(chalk.red('❌ Configuration not found. Run'), chalk.white('fhevm init'), chalk.red('first.\n'));
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  
  const spinner = ora('Initializing FHEVM client...').start();

  try {
    // Dynamic import to avoid issues
    const { createFhevmClient } = await import('../../../fhevm-sdk/dist/core/FhevmClient.js');

    // Create client
    const client = createFhevmClient({
      network: config.network,
      provider: config.rpcUrl,
      autoInit: false,
    });

    await client.init();
    spinner.succeed('FHEVM client initialized');

    // Get addresses
    const contractAddress = options.contract || config.contractAddress;
    let userAddress = options.user;

    if (!userAddress && config.privateKey) {
      const wallet = new ethers.Wallet(config.privateKey);
      userAddress = wallet.address;
    }

    if (!userAddress) {
      spinner.fail('User address required');
      console.error(chalk.red('❌ Provide --user flag or set privateKey in config\n'));
      process.exit(1);
    }

    // Parse value based on type
    const type = (options.type || 'euint32') as any;
    let parsedValue: any;

    spinner.text = 'Parsing value...';

    if (type === 'ebool') {
      parsedValue = value.toLowerCase() === 'true';
    } else if (type.startsWith('euint')) {
      parsedValue = BigInt(value);
    } else {
      parsedValue = value;
    }

    // Encrypt
    spinner.text = 'Encrypting value...';
    const result = await client.encrypt(
      contractAddress as `0x${string}`,
      userAddress as `0x${string}`,
      { type, value: parsedValue }
    );

    spinner.succeed('Value encrypted successfully!');

    // Display results
    console.log(chalk.green('\n✅ Encryption Results:\n'));
    console.log(chalk.gray('  Type:'), chalk.white(type));
    console.log(chalk.gray('  Value:'), chalk.white(value));
    console.log(chalk.gray('  Handle:'), chalk.yellow(result.handles[0]));
    console.log(chalk.gray('  Proof size:'), chalk.white(result.inputProof.length), 'bytes');
    
    // Show usage
    console.log(chalk.blue('\n💡 Use in contract call:'));
    console.log(chalk.gray('  contract.myFunction('));
    console.log(chalk.yellow(`    "${result.handles[0]}",`));
    console.log(chalk.yellow(`    "0x${Buffer.from(result.inputProof).toString('hex')}"`));
    console.log(chalk.gray('  )\n'));

    await client.disconnect();

  } catch (error) {
    spinner.fail('Encryption failed');
    console.error(chalk.red('\n❌ Error:'), (error as Error).message);
    console.error(chalk.gray((error as Error).stack));
    process.exit(1);
  }
}

