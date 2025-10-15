/**
 * Check command - Check environment health
 */

import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';
import { ethers } from 'ethers';

const CONFIG_FILE = '.fhevmrc.json';

export async function checkCommand() {
  console.log(chalk.blue.bold('\n🔍 FHEVM CLI - Environment Health Check\n'));

  const checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; message?: string }> = [];

  // Check 1: Configuration file
  let config: any = null;
  if (fs.existsSync(CONFIG_FILE)) {
    checks.push({ name: 'Configuration file', status: 'pass' });
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } else {
    checks.push({ 
      name: 'Configuration file', 
      status: 'fail',
      message: 'Run "fhevm init" to create configuration'
    });
  }

  // Check 2: RPC connectivity
  if (config) {
    const spinner = ora('Checking RPC connectivity...').start();
    try {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      await provider.getNetwork();
      spinner.stop();
      checks.push({ name: 'RPC connectivity', status: 'pass' });
    } catch (error) {
      spinner.stop();
      checks.push({ 
        name: 'RPC connectivity', 
        status: 'fail',
        message: `Cannot reach ${config.rpcUrl}`
      });
    }
  }

  // Check 3: Private key
  if (config?.privateKey) {
    try {
      const wallet = new ethers.Wallet(config.privateKey);
      checks.push({ 
        name: 'Wallet', 
        status: 'pass',
        message: `Address: ${wallet.address}`
      });
    } catch (error) {
      checks.push({ 
        name: 'Wallet', 
        status: 'fail',
        message: 'Invalid private key'
      });
    }
  } else {
    checks.push({ 
      name: 'Wallet', 
      status: 'warn',
      message: 'No private key configured (some operations will be limited)'
    });
  }

  // Check 4: Contract address
  if (config?.contractAddress && config.contractAddress !== '0x0000000000000000000000000000000000000000') {
    if (ethers.isAddress(config.contractAddress)) {
      checks.push({ 
        name: 'Contract address', 
        status: 'pass',
        message: config.contractAddress
      });
    } else {
      checks.push({ 
        name: 'Contract address', 
        status: 'fail',
        message: 'Invalid address format'
      });
    }
  } else {
    checks.push({ 
      name: 'Contract address', 
      status: 'warn',
      message: 'No contract configured (provide --contract flag when encrypting)'
    });
  }

  // Check 5: FHEVM SDK
  const spinner = ora('Checking FHEVM SDK...').start();
  try {
    const { createFhevmClient } = await import('../../../fhevm-sdk/dist/core/FhevmClient.js');
    if (createFhevmClient) {
      spinner.stop();
      checks.push({ name: 'FHEVM SDK', status: 'pass' });
    }
  } catch (error) {
    spinner.stop();
    checks.push({ 
      name: 'FHEVM SDK', 
      status: 'fail',
      message: 'SDK not built. Run "pnpm sdk:build" from root'
    });
  }

  // Check 6: Node.js version
  const nodeVersion = process.versions.node;
  const majorVersion = parseInt(nodeVersion.split('.')[0]);
  if (majorVersion >= 20) {
    checks.push({ 
      name: 'Node.js version', 
      status: 'pass',
      message: `v${nodeVersion}`
    });
  } else {
    checks.push({ 
      name: 'Node.js version', 
      status: 'warn',
      message: `v${nodeVersion} (recommend >= 20.0.0)`
    });
  }

  // Display results
  console.log(chalk.bold('Health Check Results:\n'));

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? chalk.green('✓') : 
                 check.status === 'fail' ? chalk.red('✗') : 
                 chalk.yellow('⚠');
    
    const statusText = check.status === 'pass' ? chalk.green('PASS') :
                       check.status === 'fail' ? chalk.red('FAIL') :
                       chalk.yellow('WARN');

    console.log(`${icon} ${statusText} ${chalk.gray(check.name)}`);
    
    if (check.message) {
      console.log(chalk.gray(`       ${check.message}`));
    }
    
    console.log();

    if (check.status === 'pass') passCount++;
    else if (check.status === 'fail') failCount++;
    else warnCount++;
  });

  // Summary
  console.log(chalk.bold('Summary:'));
  console.log(chalk.green(`  ✓ Passed: ${passCount}`));
  if (warnCount > 0) console.log(chalk.yellow(`  ⚠ Warnings: ${warnCount}`));
  if (failCount > 0) console.log(chalk.red(`  ✗ Failed: ${failCount}`));
  
  console.log();

  if (failCount === 0 && warnCount === 0) {
    console.log(chalk.green.bold('🎉 All checks passed! You\'re ready to use FHEVM CLI.\n'));
  } else if (failCount === 0) {
    console.log(chalk.yellow.bold('⚠️  Some warnings found, but core functionality should work.\n'));
  } else {
    console.log(chalk.red.bold('❌ Some checks failed. Please fix the issues above.\n'));
    process.exit(1);
  }
}

