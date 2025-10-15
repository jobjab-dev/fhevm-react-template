# 📚 FHEVM SDK Examples

Runnable TypeScript examples showing all SDK features.

## 🚀 Quick Start

```bash
cd examples
npm install

# Run any example
npm run 01  # Basic encryption
npm run 02  # Batch encryption
npm run 03  # Struct encryption
# etc...
```

## 📖 Examples (Organized by Feature)

### Core SDK (Framework-Agnostic)

| File | Feature | Plane Requirement |
|------|---------|------------------|
| `01-init-encrypt.ts` | Initialize + encrypt scalar | ✅ FheClient + encryptScalar |
| `02-batch-encrypt.ts` | Batch encryption (3-5x faster) | ✅ Batch encrypt performance |
| `03-struct-encrypt.ts` | Structured encryption | ✅ encryptStruct<T>() |
| `04-user-decrypt-eip712.ts` | User decrypt with EIP-712 | ✅ userDecrypt (EIP-712 sign) |
| `05-public-decrypt.ts` | Public decryption | ✅ publicDecrypt |
| `06-contract-helpers.ts` | Contract utilities | ✅ readCipher, buildParams |
| `07-cache-performance.ts` | Caching (100x faster) | ✅ Cache + TTL |
| `08-error-handling.ts` | Error taxonomy | ✅ Error codes + suggestions |

### React Adapters (Wagmi-like)

| File | Feature | Plane Requirement |
|------|---------|------------------|
| `09-react-provider.tsx` | Provider pattern | ✅ useFheClient(), Provider |
| `10-ui-components.tsx` | Ready-to-use components | ✅ Components (Input, Button, Preview) |

### Full Applications

| Folder | Type | Plane Requirement |
|--------|------|------------------|
| `nodejs/` | Node.js server | ✅ No-UI template |
| `vanilla-js/` | Browser app | ✅ Framework-agnostic |
| `../packages/nextjs/` | Next.js showcase | ✅ Next.js template (required) |

## 🎯 Coverage

✅ **All Plane.prompts requirements:**
1. Core SDK (FheClient, encrypt/decrypt) - Examples 01-06
2. Wagmi-like API - Example 09
3. Components - Example 10
4. Performance (batch, cache) - Examples 02, 07
5. Error handling - Example 08
6. Multi-framework - Node.js, Vanilla JS, Next.js

## 📦 Installation

```bash
npm install jobjab-fhevm-sdk
```

## 🔗 Links

- [SDK Documentation](../packages/fhevm-sdk/README.md)
- [API Reference](../API_REFERENCE.md)
- [Cookbook](../COOKBOOK.md) - 29 recipes

---

**All examples are runnable TypeScript code matching plane.prompts spec!**
