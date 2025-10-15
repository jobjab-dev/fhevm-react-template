/**
 * Init command - Initialize FHEVM configuration
 */

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

interface InitOptions {
  network?: string;
  rpc?: string;
}

const CONFIG_FILE = '.fhevmrc.json';

export async function initCommand(options: InitOptions) {
  console.log(chalk.blue.bold('\n🚀 FHEVM CLI - Initialize Configuration\n'));

  // Check if config already exists
  if (fs.existsSync(CONFIG_FILE)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Configuration file already exists. Overwrite?',
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('Initialization cancelled.'));
      return;
    }
  }

  // Prompt for configuration
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select network:',
      choices: ['sepolia', 'localhost', 'custom'],
      default: options.network || 'sepolia',
    },
    {
      type: 'input',
      name: 'rpcUrl',
      message: 'RPC URL:',
      default: (answers: any) => {
        if (answers.network === 'sepolia') {
          return 'https://eth-sepolia.public.blastapi.io';
        } else if (answers.network === 'localhost') {
          return 'http://localhost:8545';
        }
        return '';
      },
      when: (answers: any) => !options.rpc,
    },
    {
      type: 'input',
      name: 'contractAddress',
      message: 'Default contract address (optional):',
      default: '0x0000000000000000000000000000000000000000',
    },
    {
      type: 'input',
      name: 'privateKey',
      message: 'Private key (optional, for signing):',
      default: '',
    },
  ]);

  const spinner = ora('Creating configuration...').start();

  // Create config object
  const config = {
    network: answers.network,
    rpcUrl: options.rpc || answers.rpcUrl,
    contractAddress: answers.contractAddress,
    privateKey: answers.privateKey,
    chainId: answers.network === 'sepolia' ? 11155111 : 31337,
    createdAt: new Date().toISOString(),
  };

  // Write config file
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    spinner.succeed('Configuration created successfully!');
    
    console.log(chalk.green('\n✅ Configuration saved to:'), CONFIG_FILE);
    console.log(chalk.gray('\nConfiguration:'));
    console.log(chalk.gray('  Network:'), chalk.white(config.network));
    console.log(chalk.gray('  RPC URL:'), chalk.white(config.rpcUrl));
    console.log(chalk.gray('  Chain ID:'), chalk.white(config.chainId));
    
    if (config.contractAddress && config.contractAddress !== '0x0000000000000000000000000000000000000000') {
      console.log(chalk.gray('  Contract:'), chalk.white(config.contractAddress));
    }

    console.log(chalk.blue('\n💡 Next steps:'));
    console.log(chalk.gray('  • Run'), chalk.white('fhevm check'), chalk.gray('to verify setup'));
    console.log(chalk.gray('  • Run'), chalk.white('fhevm encrypt <value>'), chalk.gray('to encrypt a value'));
    console.log(chalk.gray('  • Run'), chalk.white('fhevm decrypt <handle>'), chalk.gray('to decrypt a ciphertext\n'));

  } catch (error) {
    spinner.fail('Failed to create configuration');
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}

