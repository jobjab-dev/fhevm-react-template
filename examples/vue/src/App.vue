<template>
  <div>
    <h1>🔐 FHEVM SDK - Vue Example</h1>
    <p>Framework-agnostic encryption/decryption with Vue 3 Composition API</p>

    <div class="card">
      <h2>Connection</h2>
      <button v-if="!isConnected" @click="connectWallet" :disabled="isConnecting">
        {{ isConnecting ? 'Connecting...' : 'Connect MetaMask' }}
      </button>
      <div v-else>
        <p class="success">✅ Connected: {{ truncateAddress(userAddress) }}</p>
        <p>Network: {{ networkName }}</p>
      </div>
      <div v-if="connectionError" class="error">{{ connectionError }}</div>
    </div>

    <div v-if="isConnected" class="card">
      <h2>Encryption</h2>
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
        <input 
          v-model="valueToEncrypt" 
          type="number" 
          placeholder="Enter value to encrypt"
          :disabled="isEncrypting"
        />
        <button @click="handleEncrypt" :disabled="isEncrypting || !valueToEncrypt">
          {{ isEncrypting ? 'Encrypting...' : '🔒 Encrypt' }}
        </button>
      </div>
      <div v-if="encryptedHandle" class="success">
        <p>✅ Encrypted!</p>
        <p style="word-break: break-all; font-size: 0.9em;">Handle: {{ encryptedHandle }}</p>
      </div>
      <div v-if="encryptError" class="error">{{ encryptError }}</div>
    </div>

    <div v-if="isConnected && encryptedHandle" class="card">
      <h2>Decryption</h2>
      <button @click="handleDecrypt" :disabled="isDecrypting">
        {{ isDecrypting ? 'Decrypting...' : '🔓 Decrypt' }}
      </button>
      <div v-if="decryptedValue !== null" class="success">
        <p>✅ Decrypted Value: {{ decryptedValue }}</p>
      </div>
      <div v-if="decryptError" class="error">{{ decryptError }}</div>
    </div>

    <div class="card">
      <h3>SDK Status</h3>
      <p>Status: <span :class="fhevmStatus === 'ready' ? 'success' : 'loading'">{{ fhevmStatus }}</span></p>
      <p>Client Ready: {{ fhevmReady ? '✅' : '❌' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ethers } from 'ethers'
import { createFhevmClient } from 'jobjab-fhevm-sdk/core'
import type { FhevmClient } from 'jobjab-fhevm-sdk/core'

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'

const fhevmClient = ref<FhevmClient | null>(null)
const fhevmStatus = ref<string>('idle')
const fhevmReady = computed(() => fhevmStatus.value === 'ready')

const provider = ref<ethers.BrowserProvider | null>(null)
const signer = ref<ethers.Signer | null>(null)
const userAddress = ref<string>('')
const networkName = ref<string>('')
const isConnected = ref(false)
const isConnecting = ref(false)
const connectionError = ref<string>('')

const valueToEncrypt = ref<string>('')
const isEncrypting = ref(false)
const encryptedHandle = ref<string>('')
const encryptError = ref<string>('')

const isDecrypting = ref(false)
const decryptedValue = ref<number | null>(null)
const decryptError = ref<string>('')

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const connectWallet = async () => {
  isConnecting.value = true
  connectionError.value = ''

  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not found')
    }

    provider.value = new ethers.BrowserProvider(window.ethereum)
    await provider.value.send('eth_requestAccounts', [])
    
    signer.value = await provider.value.getSigner()
    userAddress.value = await signer.value.getAddress()
    
    const network = await provider.value.getNetwork()
    networkName.value = network.name

    isConnected.value = true

    await initFhevm()
  } catch (error: any) {
    connectionError.value = error.message
    console.error('Connection error:', error)
  } finally {
    isConnecting.value = false
  }
}

const initFhevm = async () => {
  try {
    fhevmStatus.value = 'initializing'
    
    fhevmClient.value = createFhevmClient({
      network: 'sepolia',
      provider: window.ethereum,
      autoInit: false,
    })

    await fhevmClient.value.init()
    fhevmStatus.value = 'ready'
    
    console.log('FHEVM client initialized')
  } catch (error: any) {
    fhevmStatus.value = 'error'
    connectionError.value = `FHEVM init failed: ${error.message}`
    console.error('FHEVM init error:', error)
  }
}

const handleEncrypt = async () => {
  if (!fhevmClient.value || !fhevmReady.value) {
    encryptError.value = 'FHEVM client not ready'
    return
  }

  isEncrypting.value = true
  encryptError.value = ''
  encryptedHandle.value = ''

  try {
    const result = await fhevmClient.value.encrypt(
      CONTRACT_ADDRESS as `0x${string}`,
      userAddress.value as `0x${string}`,
      { type: 'euint32', value: parseInt(valueToEncrypt.value) }
    )

    const handleHex = '0x' + Array.from(result.handles[0])
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    encryptedHandle.value = handleHex
    console.log('Encrypted:', result)
  } catch (error: any) {
    encryptError.value = error.message
    console.error('Encryption error:', error)
  } finally {
    isEncrypting.value = false
  }
}

const handleDecrypt = async () => {
  if (!fhevmClient.value || !signer.value || !encryptedHandle.value) {
    decryptError.value = 'Missing client, signer, or encrypted handle'
    return
  }

  isDecrypting.value = true
  decryptError.value = ''
  decryptedValue.value = null

  try {
    const keypair = fhevmClient.value.generateKeypair()
    
    const eip712 = fhevmClient.value.createEIP712(
      keypair.publicKey,
      [CONTRACT_ADDRESS as `0x${string}`],
      Math.floor(Date.now() / 1000),
      365
    )

    const signatureString = await signer.value.signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message
    )

    const signature = {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
      signature: signatureString.replace('0x', ''),
      startTimestamp: Math.floor(Date.now() / 1000),
      durationDays: 365,
      userAddress: userAddress.value as `0x${string}`,
      contractAddresses: [CONTRACT_ADDRESS as `0x${string}`],
    }

    const result = await fhevmClient.value.decrypt(
      [{ handle: encryptedHandle.value, contractAddress: CONTRACT_ADDRESS as `0x${string}` }],
      signature
    )

    decryptedValue.value = Number(result[encryptedHandle.value])
    console.log('Decrypted:', result)
  } catch (error: any) {
    decryptError.value = error.message
    console.error('Decryption error:', error)
  } finally {
    isDecrypting.value = false
  }
}

onMounted(() => {
  console.log('Vue FHEVM Example mounted')
})
</script>

<style scoped>
h1 {
  font-size: 3em;
  line-height: 1.1;
  margin-bottom: 0.5em;
}

h2 {
  margin-bottom: 1em;
}

p {
  margin: 0.5em 0;
}
</style>

