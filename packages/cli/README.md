# ⚡ FHEVM CLI

Command-line tool for FHEVM operations - encrypt, decrypt, and manage confidential data from your terminal.

## 🚀 Installation

```bash
# From root
pnpm install

# Build CLI
cd packages/cli
pnpm build

# Link globally (optional)
npm link
```

## 📋 Commands

### Initialize Configuration

```bash
fhevm init

# With options
fhevm init --network sepolia
fhevm init --network localhost --rpc http://localhost:8545
```

**Creates:** `.fhevmrc.json` with your configuration

### Encrypt Value

```bash
fhevm encrypt <value>

# Examples
fhevm encrypt 42
fhevm encrypt 1000 --type euint64
fhevm encrypt true --type ebool
fhevm encrypt 42 --contract 0x... --user 0x...
```

**Options:**
- `-t, --type <type>` - FHE type (euint32, euint64, ebool)
- `-c, --contract <address>` - Contract address
- `-u, --user <address>` - User address

### Decrypt Value

```bash
fhevm decrypt <handle>

# Examples
fhevm decrypt 0x1234...
fhevm decrypt 0x1234... --public
fhevm decrypt 0x1234... --contract 0x...
```

**Options:**
- `-c, --contract <address>` - Contract address
- `--public` - Use public decryption (no signature)

### Check Environment

```bash
fhevm check
```

Verifies:
- ✓ Configuration file
- ✓ RPC connectivity
- ✓ Wallet setup
- ✓ Contract address
- ✓ FHEVM SDK
- ✓ Node.js version

---

## 📖 Quick Start

### 1. Initialize

```bash
$ fhevm init

? Select network: sepolia
? RPC URL: https://eth-sepolia.public.blastapi.io
? Default contract address: 0x...
? Private key: 0x...

✅ Configuration saved!
```

### 2. Encrypt

```bash
$ fhevm encrypt 42 --type euint32

🔒 Encrypting value...
✅ Value encrypted successfully!

  Type: euint32
  Value: 42
  Handle: 0x1234abcd...
  Proof size: 1024 bytes
```

### 3. Decrypt

```bash
$ fhevm decrypt 0x1234abcd...

🔓 Decrypting value...
✅ Value decrypted successfully!

  Handle: 0x1234abcd...
  Value: 42
```

---

## 🎯 Use Cases

### CI/CD Pipeline

```yaml
# .github/workflows/encrypt.yml
- name: Encrypt sensitive data
  run: |
    fhevm init --network sepolia
    fhevm encrypt ${{ secrets.SENSITIVE_VALUE }} > encrypted.txt
```

### Automated Scripts

```bash
#!/bin/bash
# encrypt-batch.sh

for value in 10 20 30 40 50; do
  echo "Encrypting $value..."
  fhevm encrypt $value --type euint32
done
```

### Testing

```bash
# test-encryption.sh
fhevm init --network localhost
fhevm check || exit 1
fhevm encrypt 42 --type euint32
```

---

## ⚙️ Configuration File

`.fhevmrc.json`:

```json
{
  "network": "sepolia",
  "rpcUrl": "https://eth-sepolia.public.blastapi.io",
  "contractAddress": "0x...",
  "privateKey": "0x...",
  "chainId": 11155111,
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Security Notes:**
- Add `.fhevmrc.json` to `.gitignore`
- Never commit private keys
- Use environment variables for sensitive data

---

## 🔐 Security

### Environment Variables

Instead of storing in config:

```bash
export FHEVM_PRIVATE_KEY=0x...
export FHEVM_CONTRACT=0x...
export FHEVM_RPC_URL=https://...

fhevm encrypt 42
```

### CI/CD Secrets

```bash
# GitHub Actions
fhevm init \
  --network sepolia \
  --rpc ${{ secrets.RPC_URL }}

echo ${{ secrets.PRIVATE_KEY }} > .fhevmrc.json
```

---

## 🚨 Troubleshooting

### "Configuration not found"

```bash
# Run init first
fhevm init
```

### "RPC not reachable"

```bash
# Check RPC URL
fhevm check

# Update config
fhevm init --rpc https://new-rpc-url
```

### "FHEVM SDK not found"

```bash
# Build SDK from root
cd ../../
pnpm sdk:build
```

### "Invalid private key"

```bash
# Generate new wallet
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"
```

---

## 📚 Examples

### Encrypt Multiple Values

```bash
#!/bin/bash
VALUES=(100 200 300 400 500)

for val in "${VALUES[@]}"; do
  result=$(fhevm encrypt $val --type euint64)
  handle=$(echo "$result" | grep "Handle:" | awk '{print $2}')
  echo "$val -> $handle"
done
```

### Decrypt All Handles

```bash
#!/bin/bash
HANDLES=(
  "0x1234..."
  "0x5678..."
  "0x9abc..."
)

for handle in "${HANDLES[@]}"; do
  fhevm decrypt $handle
done
```

### Health Check Script

```bash
#!/bin/bash
if fhevm check; then
  echo "✅ Environment ready"
  exit 0
else
  echo "❌ Environment check failed"
  exit 1
fi
```

---

## 🎨 Output Formatting

### JSON Output (coming soon)

```bash
fhevm encrypt 42 --json
{
  "type": "euint32",
  "value": "42",
  "handle": "0x1234...",
  "proof": "0xabcd...",
  "proofSize": 1024
}
```

### Quiet Mode (coming soon)

```bash
# Only output handle
fhevm encrypt 42 --quiet
0x1234abcd...
```

---

## 🔧 Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

### Test Locally

```bash
# Without installing
node dist/cli.js init
node dist/cli.js encrypt 42
```

---

## 📖 Learn More

- [FHEVM SDK Documentation](https://www.npmjs.com/package/jobjab-fhevm-sdk)
- [Contract Tooling Guide](../../CONTRACTS.md)
- [Zama Documentation](https://docs.zama.ai/)

---

**Made with ❤️ for the FHE community**

