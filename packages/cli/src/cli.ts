#!/usr/bin/env node

/**
 * FHEVM CLI - Command-line tool for FHEVM operations
 * 
 * Usage:
 *   fhevm init                    - Initialize configuration
 *   fhevm encrypt <value>         - Encrypt a value
 *   fhevm decrypt <handle>        - Decrypt a ciphertext
 *   fhevm check                   - Check environment health
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { encryptCommand } from './commands/encrypt.js';
import { decryptCommand } from './commands/decrypt.js';
import { checkCommand } from './commands/check.js';

const program = new Command();

program
  .name('fhevm')
  .description('FHEVM CLI - Command-line tool for FHEVM operations')
  .version('0.1.0');

// Init command
program
  .command('init')
  .description('Initialize FHEVM configuration')
  .option('-n, --network <network>', 'Network (sepolia, localhost)', 'sepolia')
  .option('-r, --rpc <url>', 'Custom RPC URL')
  .action(initCommand);

// Encrypt command
program
  .command('encrypt <value>')
  .description('Encrypt a value')
  .option('-t, --type <type>', 'FHE type (euint32, euint64, ebool)', 'euint32')
  .option('-c, --contract <address>', 'Contract address')
  .option('-u, --user <address>', 'User address')
  .action(encryptCommand);

// Decrypt command
program
  .command('decrypt <handle>')
  .description('Decrypt a ciphertext handle')
  .option('-c, --contract <address>', 'Contract address')
  .option('--public', 'Use public decryption (no signature)')
  .action(decryptCommand);

// Check command
program
  .command('check')
  .description('Check environment health')
  .action(checkCommand);

// Parse arguments
program.parse();

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

