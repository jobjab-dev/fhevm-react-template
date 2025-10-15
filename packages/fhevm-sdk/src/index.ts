/**
 * 🔐 FHEVM SDK - Universal, Framework-Agnostic SDK for FHEVM
 * 
 * Build confidential dApps with any framework: React, Vue, Node.js, or Vanilla JS
 * 
 * @packageDocumentation
 * 
 * ## Quick Start
 * 
 * ### Core (Framework-Agnostic)
 * ```typescript
 * import { createFhevmClient } from 'fhevm-sdk/core';
 * 
 * const client = createFhevmClient({ network: 'sepolia' });
 * await client.init();
 * 
 * const encrypted = await client.encrypt(addr, user, { type: 'euint32', value: 42 });
 * ```
 * 
 * ### React
 * ```tsx
 * import { FhevmProvider, useFhevmClient, useEncrypt } from 'fhevm-sdk/adapters/react';
 * 
 * function App() {
 *   return (
 *     <FhevmProvider config={{ network: 'sepolia' }}>
 *       <MyComponent />
 *     </FhevmProvider>
 *   );
 * }
 * 
 * function MyComponent() {
 *   const client = useFhevmClient();
 *   const { encrypt } = useEncrypt({ contractAddress: '0x...', userAddress: '0x...' });
 *   // ...
 * }
 * ```
 * 
 * ### Components
 * ```tsx
 * import { EncryptedInput, DecryptButton, CipherPreview } from 'fhevm-sdk/components/react';
 * 
 * <EncryptedInput type="euint32" onEncrypted={handler} />
 * <DecryptButton handle="0x..." signer={signer} />
 * <CipherPreview handle="0x..." showDecrypt />
 * ```
 * 
 * ## Documentation
 * - [SDK README](./README.md) - Complete guide
 * - [API Reference](../../API_REFERENCE.md) - Full API docs
 * - [Cookbook](../../COOKBOOK.md) - Common recipes
 * - [Troubleshooting](../../TROUBLESHOOTING.md) - Solutions to common issues
 * 
 * @author Zama Bounty Program - October 2025
 * @license BSD-3-Clause-Clear
 */

// ============================================================================
// Core Exports (Framework-Agnostic) ⭐ PRIMARY EXPORTS
// ============================================================================
export * from "./core/index";

// ============================================================================
// Adapter Exports
// ============================================================================
export * from "./adapters/index";

// ============================================================================
// Component Exports
// ============================================================================
export * from "./components/index";

// ============================================================================
// Legacy Exports (Backward Compatibility)
// ============================================================================
export * from "./storage/index";

// Legacy types (selective to avoid conflicts with core)
export type {
  HandleContractPair,
  DecryptedResults,
  FhevmDecryptionSignatureType,
  EIP712Type,
} from "./fhevmTypes";
// Note: FhevmInstance and FhevmInstanceConfig are exported from core/types

export * from "./FhevmDecryptionSignature";

// Legacy React exports (selective to avoid conflicts)
export { useFhevm } from "./react/useFhevm";
export { useFHEEncryption, buildParamsFromAbi } from "./react/useFHEEncryption";
export { useFHEDecrypt } from "./react/useFHEDecrypt";
export { useInMemoryStorage, InMemoryStorageProvider } from "./react/useInMemoryStorage";

// Note: getEncryptionMethod and toHex from ./react are superseded by core versions

