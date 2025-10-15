# 🌐 FHEVM SDK - Vanilla JavaScript Example

No framework required! Use FHEVM SDK in plain HTML + JavaScript.

## ✨ Features

- ✅ Zero build tools required
- ✅ Pure HTML + JavaScript
- ✅ Works in any modern browser
- ✅ MetaMask integration
- ✅ Beautiful UI out of the box

## 🚀 Quick Start

### Method 1: Open Directly

1. Open `index.html` in your browser
2. Click "Connect MetaMask"
3. Start encrypting/decrypting!

### Method 2: Use Local Server

```bash
# Install a simple HTTP server
npm install -g http-server

# Start server
http-server .

# Open http://localhost:8080 in browser
```

## 📋 Requirements

- Modern browser (Chrome, Firefox, Edge)
- MetaMask extension installed
- Connected to Sepolia testnet

## 🎨 Features Demo

### 1. Connect Wallet
- Click "Connect MetaMask"
- Approve the connection
- FHEVM client initializes automatically

### 2. Encrypt Value
- Choose type (euint32, euint64, ebool)
- Enter value
- Click "Encrypt"
- Get encrypted handle instantly

### 3. Decrypt Value
- Enter ciphertext handle
- Click "Decrypt"
- Sign EIP-712 message
- View decrypted value

## 💻 Code Example

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>FHEVM Example</title>
</head>
<body>
  <button onclick="encrypt()">Encrypt</button>
  
  <script type="module">
    import { createFhevmClient } from 'fhevm-sdk/core';
    import { ethers } from 'ethers';

    // Connect wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Create FHEVM client
    const client = createFhevmClient({
      network: 'sepolia',
      provider: window.ethereum,
    });

    await client.init();

    // Encrypt
    window.encrypt = async function() {
      const result = await client.encrypt(
        '0xContractAddress',
        signer.address,
        { type: 'euint32', value: 42 }
      );
      
      console.log('Encrypted:', result.handles[0]);
    };
  </script>
</body>
</html>
```

### With CDN

```html
<script type="module">
  // Use ethers from CDN
  import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@6/+esm';
  
  // Import FHEVM SDK (build locally first)
  import { createFhevmClient } from '../../packages/fhevm-sdk/dist/core/FhevmClient.js';

  // Your code here...
</script>
```

## 🔧 Customization

### Change Network

```javascript
const client = createFhevmClient({
  network: {
    chainId: 11155111,
    name: 'Sepolia',
    // ... custom config
  },
  provider: window.ethereum,
});
```

### Custom Contract

```javascript
const CONTRACT_ADDRESS = '0xYourContractAddress';

const result = await client.encrypt(
  CONTRACT_ADDRESS,
  signer.address,
  { type: 'euint64', value: 1000n }
);
```

### Custom Styling

The example includes inline styles. You can:
- Extract to external CSS file
- Use Tailwind CSS
- Use any CSS framework
- Customize colors and layout

## 📱 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Supported |
| Firefox | 88+ | ✅ Supported |
| Edge | 90+ | ✅ Supported |
| Safari | 14+ | ✅ Supported |
| Opera | 76+ | ✅ Supported |

## 🚨 Common Issues

### "MetaMask not found"

**Solution:** Install [MetaMask extension](https://metamask.io/download/)

### "Cannot import module"

**Solution:** Use a local HTTP server, don't open file:// directly
```bash
npm install -g http-server
http-server .
```

### "SDK not initialized"

**Solution:** Make sure to call `await client.init()` before using the client

### "CORS error"

**Solution:** 
- Use local HTTP server
- Or configure your web server to allow CORS

## 📖 Integration Guide

### Add to Existing Site

```html
<!-- Add to your HTML -->
<script type="module">
  import { createFhevmClient } from 'path/to/fhevm-sdk/dist/core/FhevmClient.js';
  
  window.fhevmClient = await createFhevmClient({
    network: 'sepolia',
    provider: window.ethereum,
  });
  
  console.log('FHEVM ready!');
</script>
```

### Use with jQuery

```html
<script type="module">
  import { createFhevmClient } from './fhevm-sdk/dist/core/FhevmClient.js';
  
  const client = await createFhevmClient({ network: 'sepolia' });
  
  $('#encrypt-btn').click(async function() {
    const value = $('#value-input').val();
    const result = await client.encrypt(...);
    $('#result').text(result.handles[0]);
  });
</script>
```

### Use with Alpine.js

```html
<div x-data="fhevmApp()">
  <button @click="encrypt()">Encrypt</button>
  <div x-text="result"></div>
</div>

<script type="module">
  import { createFhevmClient } from './fhevm-sdk/dist/core/FhevmClient.js';
  
  const client = await createFhevmClient({ network: 'sepolia' });
  
  function fhevmApp() {
    return {
      result: '',
      async encrypt() {
        const res = await client.encrypt(...);
        this.result = res.handles[0];
      }
    };
  }
  
  window.fhevmApp = fhevmApp;
</script>
```

## 📚 Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Zama Documentation](https://docs.zama.ai/)
- [Web3 Best Practices](https://ethereum.org/en/developers/)

## 🎯 Next Steps

1. Deploy your own FHEVM contract
2. Replace `CONTRACT_ADDRESS` with your contract
3. Customize the UI to match your brand
4. Add more functionality (batch encryption, etc.)
5. Deploy to production!

---

**Made with ❤️ for the FHE community**

