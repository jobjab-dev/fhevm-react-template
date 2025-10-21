# 🟢 FHEVM SDK - Vue.js Example

Vue 3 Composition API example using FHEVM SDK in a framework-agnostic way.

## ✨ Features

- ✅ Vue 3 with Composition API
- ✅ TypeScript support
- ✅ Framework-agnostic FHEVM SDK
- ✅ MetaMask integration
- ✅ Full encrypt/decrypt flow
- ✅ EIP-712 signature handling
- ✅ Reactive state management
- ✅ Vite for fast development

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📋 Requirements

- Node.js >= 20.0.0
- MetaMask browser extension
- pnpm (recommended) or npm

## 🎯 What This Example Shows

### 1. Framework-Agnostic SDK Usage

```typescript
import { createFhevmClient } from 'jobjab-fhevm-sdk/core'

// Works in Vue, React, or any framework
const client = createFhevmClient({
  network: 'sepolia',
  provider: window.ethereum,
})
```

### 2. Vue 3 Composition API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const fhevmClient = ref<FhevmClient | null>(null)
const isReady = computed(() => fhevmClient.value?.status === 'ready')
</script>
```

### 3. Reactive Encryption

```vue
<template>
  <button @click="encrypt" :disabled="isEncrypting">
    {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
  </button>
</template>

<script setup lang="ts">
const isEncrypting = ref(false)

const encrypt = async () => {
  isEncrypting.value = true
  try {
    const result = await client.value.encrypt(...)
  } finally {
    isEncrypting.value = false
  }
}
</script>
```

### 4. Decryption with EIP-712

```typescript
// Generate keypair
const keypair = client.generateKeypair()

// Create EIP-712 message
const eip712 = client.createEIP712(
  keypair.publicKey,
  [contractAddress],
  Math.floor(Date.now() / 1000),
  365
)

// Sign with wallet
const signature = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message
)

// Decrypt
const decrypted = await client.decrypt([...], signature)
```

## 🏗️ Project Structure

```
vue/
├── src/
│   ├── App.vue           # Main component
│   ├── main.ts           # Entry point
│   └── style.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── package.json
└── README.md
```

## 💡 Key Concepts

### Reactive State Management

```typescript
// Reactive references
const isConnected = ref(false)
const isEncrypting = ref(false)
const encryptedHandle = ref<string>('')

// Computed properties
const isReady = computed(() => 
  fhevmClient.value?.status === 'ready'
)

// Watchers
watch(isConnected, (connected) => {
  if (connected) {
    initFhevm()
  }
})
```

### Error Handling

```vue
<template>
  <div v-if="error" class="error">
    {{ error }}
  </div>
</template>

<script setup lang="ts">
const error = ref<string>('')

try {
  await encrypt(value)
} catch (err: any) {
  error.value = err.message
}
</script>
```

### Loading States

```vue
<template>
  <button :disabled="isLoading">
    <span v-if="isLoading">⏳ Processing...</span>
    <span v-else>🔒 Encrypt</span>
  </button>
</template>
```

## 🎨 Customization

### Change Network

```typescript
const client = createFhevmClient({
  network: 'localhost', // or 'sepolia'
  provider: window.ethereum,
})
```

### Custom Contract Address

```typescript
const CONTRACT_ADDRESS = '0xYourContractAddress'
```

### Styling

Edit `src/style.css` for global styles or use scoped styles in components:

```vue
<style scoped>
.my-class {
  color: blue;
}
</style>
```

## 🔧 Development Tips

### Hot Module Replacement

Vite provides instant HMR for fast development:

```bash
pnpm dev
```

Changes are reflected immediately without page reload!

### TypeScript Support

Full TypeScript support with IntelliSense:

```typescript
import type { FhevmClient, EncryptionResult } from 'jobjab-fhevm-sdk/core'

const client = ref<FhevmClient | null>(null)
const result = ref<EncryptionResult | null>(null)
```

### Debugging

```vue
<script setup lang="ts">
import { watchEffect } from 'vue'

// Debug state changes
watchEffect(() => {
  console.log('FHEVM Status:', fhevmStatus.value)
  console.log('Is Ready:', isReady.value)
})
</script>
```

## 📚 Vue Composables (Advanced)

Create reusable composables for FHEVM operations:

```typescript
// composables/useFhevm.ts
import { ref, computed } from 'vue'
import { createFhevmClient } from 'jobjab-fhevm-sdk/core'

export function useFhevm() {
  const client = ref(createFhevmClient({ network: 'sepolia' }))
  const status = ref('idle')
  const isReady = computed(() => status.value === 'ready')

  const init = async () => {
    status.value = 'initializing'
    await client.value.init()
    status.value = 'ready'
  }

  return { client, status, isReady, init }
}
```

Usage:

```vue
<script setup lang="ts">
import { useFhevm } from './composables/useFhevm'

const { client, isReady, init } = useFhevm()

onMounted(() => init())
</script>
```

## 🚨 Common Issues

### "Cannot find module 'jobjab-fhevm-sdk'"

**Solution:** Build the SDK first:
```bash
cd ../../packages/fhevm-sdk
pnpm install
pnpm build
cd ../../examples/vue
pnpm install
```

### MetaMask Not Connecting

**Solution:** Make sure:
1. MetaMask is installed
2. You're on Sepolia testnet
3. Site is allowed in MetaMask settings

### Vite Build Errors

**Solution:** Clear cache and rebuild:
```bash
rm -rf node_modules .vite
pnpm install
pnpm dev
```

## 📖 Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

This is a minimal example. Feel free to:
- Add more components
- Create composables
- Implement Pinia store
- Add Vue Router
- Style with Tailwind CSS

## 🎯 Next Steps

1. ✅ Explore the code
2. ✅ Modify encryption types
3. ✅ Add batch encryption
4. ✅ Create custom components
5. ✅ Build your own dApp!

---

**Made with 💚 for Vue developers using FHEVM**

