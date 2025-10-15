# 🔒 Security Guidelines

Critical security considerations when building with FHEVM SDK.

## ⚠️ Critical Rules

### 🚨 1. NEVER Log Plaintext Values

```typescript
// ❌ DANGEROUS - Exposes decrypted values
const decrypted = await client.decrypt(requests, signature);
console.log('Decrypted value:', decrypted); // ❌ DON'T DO THIS!

// ✅ SAFE - Log only handles
console.log('Decrypting handle:', handle); // ✅ OK
const decrypted = await client.decrypt(requests, signature);
// Use decrypted value without logging
```

**Why:** Console logs can be accessed by attackers, third-party scripts, or browser extensions.

**Best Practice:**
- Only log ciphertext handles
- Never log plaintext in production
- Use debug flags for development only

---

### 🚨 2. Side-Channel Protection

**Avoid Timing Attacks:**

```typescript
// ❌ DANGEROUS - Timing reveals information
if (decryptedValue === secretPassword) {
  return 'Access granted';
} else {
  return 'Access denied';
}

// ✅ SAFE - Constant-time comparison
// Use FHE operations on-chain instead of decrypting
```

**Avoid Size/Pattern Leakage:**

```typescript
// ❌ DANGEROUS - UI reveals data through patterns
{decryptedBalance > 1000 && <div>High balance warning</div>}

// ✅ SAFE - Use FHE comparisons on-chain
// Contract emits encrypted result, not plaintext condition
```

**Why:** Side channels can leak information through:
- Response timing
- UI state changes
- Network payload sizes
- Execution patterns

---

### 🚨 3. Access Control

**Always Use ACL in Contracts:**

```solidity
// ✅ REQUIRED - Allow specific addresses
FHE.allow(encryptedValue, msg.sender);        // Allow sender
FHE.allow(encryptedValue, specificAddress);   // Allow specific user
FHE.allowThis(encryptedValue);                // Allow contract

// ❌ DANGEROUS - Don't allow everyone
// Missing ACL = anyone can decrypt!
```

**Client-Side Validation:**

```typescript
// Always check permissions before attempting decrypt
async function safeDecrypt(handle: string) {
  try {
    const value = await client.decrypt([{ handle, contractAddress }], signature);
    return value;
  } catch (error) {
    if (error.code === 'DECRYPT_3005') {
      console.log('Access denied - you do not have permission');
      return null;
    }
    throw error;
  }
}
```

---

### 🚨 4. Private Key Management

```typescript
// ❌ DANGEROUS - Never hardcode or log private keys
const PRIVATE_KEY = '0x1234...'; // ❌ NEVER!
console.log('Key:', privateKey); // ❌ NEVER!

// ✅ SAFE - Use environment variables
const privateKey = process.env.PRIVATE_KEY;

// ✅ SAFE - Use wallet providers
const signer = await provider.getSigner();
```

**Best Practices:**
- Use environment variables
- Never commit private keys to Git
- Add `.env` to `.gitignore`
- Use wallet providers (MetaMask, WalletConnect)
- Rotate keys regularly

---

### 🚨 5. Signature Security

**EIP-712 Signature Best Practices:**

```typescript
// ✅ Set reasonable expiration
const signature = await sign({
  durationDays: 7, // Not too long
});

// ✅ Check validity before use
if (!client.utils.isSignatureValid(signature)) {
  console.log('Signature expired, requesting new one');
  await sign();
}

// ✅ Store securely
// Don't store in localStorage (XSS risk)
// Use secure session storage or generate on-demand
```

**Never Reuse Keypairs:**

```typescript
// ❌ DANGEROUS - Reusing same keypair
const keypair = client.generateKeypair();
// Use keypair for months... ❌

// ✅ SAFE - Generate fresh keypair per session
const keypair = client.generateKeypair(); // Each session
```

---

## 🛡️ Data Protection

### Input Validation

```typescript
// Always validate before encryption
function validateInput(type: FheType, value: any): boolean {
  // Range checks
  if (type === 'euint8' && (value < 0 || value > 255)) {
    return false;
  }
  
  // Type checks
  if (type === 'ebool' && typeof value !== 'boolean') {
    return false;
  }
  
  // Address validation
  if (type === 'eaddress' && !isValidAddress(value)) {
    return false;
  }
  
  return true;
}

// Use before encryption
if (!validateInput(type, value)) {
  throw new Error('Invalid input - security check failed');
}
```

### Sanitize User Input

```typescript
// ✅ Sanitize before encryption
function sanitizeValue(value: string, type: FheType): any {
  if (type === 'eaddress') {
    // Convert to checksum address
    return ethers.getAddress(value);
  }
  
  if (type.startsWith('euint')) {
    // Parse and validate numeric input
    const num = BigInt(value);
    if (num < 0n) throw new Error('Negative values not allowed');
    return num;
  }
  
  return value;
}
```

---

## 🔐 Smart Contract Security

### Proper ACL Usage

```solidity
contract SecureContract {
  mapping(address => euint64) private balances;
  
  function transfer(address to, externalEuint64 amount, bytes calldata proof) external {
    euint64 value = FHE.fromExternal(amount, proof);
    
    // Check balance (encrypted)
    ebool hasEnough = FHE.gte(balances[msg.sender], value);
    euint64 transferValue = FHE.select(hasEnough, value, FHE.asEuint64(0));
    
    // Update balances
    balances[msg.sender] = FHE.sub(balances[msg.sender], transferValue);
    balances[to] = FHE.add(balances[to], transferValue);
    
    // ✅ CRITICAL - Set ACL permissions
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allow(balances[to], to);
    FHE.allowThis(balances[msg.sender]);
    FHE.allowThis(balances[to]);
  }
}
```

### Reentrancy Protection

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SecureContract is ReentrancyGuard {
  function sensitiveFunction(...) external nonReentrant {
    // FHE operations
  }
}
```

---

## 🌐 Frontend Security

### XSS Prevention

```tsx
// ❌ DANGEROUS - Can execute scripts
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - React escapes by default
<div>{userInput}</div>

// ✅ SAFE - Validate and sanitize
const sanitized = DOMPurify.sanitize(userInput);
```

### CSRF Protection

```typescript
// Use proper authentication
const token = await getCSRFToken();

fetch('/api/encrypt', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## 📊 Privacy Best Practices

### 1. Minimize Decryption

```typescript
// ❌ Decrypt everything
const balance = await decrypt(balanceHandle);
const limit = await decrypt(limitHandle);
if (balance > limit) { ... }

// ✅ Compare on-chain using FHE
// Only decrypt final result
const canTransfer = await contract.checkTransfer(); // Returns ebool
const result = await decrypt(canTransfer); // Decrypt boolean, not amounts
```

### 2. Batch Operations

```typescript
// ❌ Multiple decryption requests
const val1 = await client.decrypt([{ handle: h1, contractAddress }], sig);
const val2 = await client.decrypt([{ handle: h2, contractAddress }], sig);
const val3 = await client.decrypt([{ handle: h3, contractAddress }], sig);

// ✅ Single batch request
const values = await client.decrypt([
  { handle: h1, contractAddress },
  { handle: h2, contractAddress },
  { handle: h3, contractAddress },
], signature);
```

**Why:** Reduces metadata leakage and improves performance.

---

## 🔑 Key Management

### Decryption Keypair Storage

```typescript
// ❌ DANGEROUS - Store in localStorage (XSS risk)
localStorage.setItem('privateKey', keypair.privateKey);

// ✅ SAFE - Generate per-session
const keypair = client.generateKeypair(); // Fresh each time

// ✅ SAFE - Use secure storage
const storage = createStorage('indexedDB'); // Better than localStorage
```

### Signature Caching

```typescript
// ✅ Cache with expiration check
async function getCachedSignature() {
  const cached = await storage.getItem('signature');
  
  if (cached) {
    const sig = JSON.parse(cached);
    if (client.utils.isSignatureValid(sig)) {
      return sig;
    }
  }
  
  // Generate new if expired
  return await createSignature();
}
```

---

## 🚫 Common Vulnerabilities

### 1. Replay Attacks

**Protected by:**
- EIP-712 includes timestamp and duration
- Signatures expire automatically
- KMS validates signature freshness

### 2. Man-in-the-Middle

**Protected by:**
- HTTPS for all communications
- Relayer uses TLS
- ZKPoK prevents tampering

### 3. Front-Running

**Protected by:**
- Encrypted inputs hide values
- MEV bots can't see amounts
- Fair ordering maintained

### 4. Permission Bypass

**Protected by:**
- On-chain ACL enforcement
- KMS validates permissions
- Cannot decrypt without proper ACL

---

## 📋 Security Checklist

### Development

- [ ] No plaintext logging in code
- [ ] All user inputs validated
- [ ] ACL properly set in contracts
- [ ] Private keys in environment variables
- [ ] No sensitive data in Git
- [ ] `.env` in `.gitignore`
- [ ] Error messages don't leak data

### Production

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Rate limiting implemented
- [ ] Input sanitization
- [ ] Output encoding
- [ ] Security headers configured
- [ ] Regular security audits

### Contracts

- [ ] ACL set for all encrypted values
- [ ] Reentrancy guards where needed
- [ ] Overflow/underflow checks
- [ ] Access control implemented
- [ ] Events don't leak plaintext
- [ ] Audited by professionals

---

## 🔍 Security Audit Points

### Code Review Checklist

```typescript
// ✅ Check: No plaintext logging
console.log('Encrypted value:', encryptedHandle); // ✅ OK
console.log('Decrypted value:', decryptedValue); // ❌ BAD

// ✅ Check: Proper error handling
try {
  const result = await client.encrypt(...);
} catch (error) {
  // Don't log sensitive data in error
  console.error('Operation failed'); // ✅ OK
  console.error('Failed to encrypt', value); // ❌ BAD if value is sensitive
}

// ✅ Check: ACL in contracts
FHE.allow(encryptedValue, authorizedAddress); // ✅ Required

// ✅ Check: Input validation
if (!validateInput(value)) {
  throw new Error('Invalid input');
}
```

---

## 📚 Resources

### Security Standards

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Solidity Security](https://docs.soliditylang.org/en/latest/security-considerations.html)

### FHEVM-Specific

- [FHEVM Security](https://docs.zama.ai/protocol/security)
- [ACL Documentation](https://docs.zama.ai/protocol/solidity-guides/smart-contract/acl)
- [Best Practices](https://docs.zama.ai/protocol/solidity-guides/best-practices)

---

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@zama.ai
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We take security seriously and will respond promptly.

---

## ✅ Security Best Practices Summary

### Always Do ✅

- ✅ Validate all inputs
- ✅ Set ACL in contracts
- ✅ Use environment variables for secrets
- ✅ Check signature validity
- ✅ Handle errors gracefully
- ✅ Use HTTPS in production
- ✅ Regular security audits

### Never Do ❌

- ❌ Log plaintext values
- ❌ Hardcode private keys
- ❌ Skip input validation
- ❌ Ignore ACL in contracts
- ❌ Store keys in localStorage
- ❌ Reuse old signatures
- ❌ Trust user input blindly

---

## 🎓 Learn More

### Encryption Best Practices

```typescript
// ✅ Good pattern
async function secureEncrypt(value: number) {
  // 1. Validate input
  if (value < 0 || value > MAX_VALUE) {
    throw new Error('Invalid value range');
  }
  
  // 2. Sanitize
  const sanitized = Math.floor(value);
  
  // 3. Encrypt
  const encrypted = await client.encrypt(addr, user, {
    type: 'euint32',
    value: sanitized,
  });
  
  // 4. Verify result
  if (!encrypted.handles || encrypted.handles.length === 0) {
    throw new Error('Encryption failed');
  }
  
  return encrypted;
}
```

### Decryption Best Practices

```typescript
// ✅ Good pattern
async function secureDecrypt(handle: string) {
  // 1. Validate handle
  if (!isCiphertextHandle(handle)) {
    throw new Error('Invalid ciphertext handle');
  }
  
  // 2. Check signature
  if (!client.utils.isSignatureValid(signature)) {
    signature = await renewSignature();
  }
  
  // 3. Decrypt with error handling
  try {
    const result = await client.decrypt(
      [{ handle, contractAddress }],
      signature
    );
    
    // 4. Use value securely (no logging!)
    return result[handle];
  } catch (error) {
    if (error.code === 'DECRYPT_3005') {
      console.log('Permission denied');
      return null;
    }
    throw error;
  }
}
```

---

## 🛡️ Defense in Depth

### Multiple Layers of Security

1. **Client-Side**
   - Input validation
   - Secure storage
   - No plaintext logging

2. **Network**
   - HTTPS/TLS
   - Relayer authentication
   - ZKPoK verification

3. **Smart Contract**
   - ACL enforcement
   - Access control
   - Reentrancy guards

4. **Protocol**
   - FHE encryption (post-quantum!)
   - MPC for key management
   - Verifiable computation

---

## 🎯 Security Testing

### Test for Common Issues

```typescript
describe('Security Tests', () => {
  it('should not log plaintext', () => {
    const spy = vi.spyOn(console, 'log');
    
    await decrypt(handle);
    
    // Check that console.log was not called with plaintext
    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining('plaintext'));
  });

  it('should validate inputs', () => {
    expect(() => encrypt({ type: 'euint8', value: 256 })).toThrow();
    expect(() => encrypt({ type: 'euint8', value: -1 })).toThrow();
  });

  it('should handle unauthorized access', async () => {
    await expect(
      client.decrypt([{ handle, contractAddress }], invalidSignature)
    ).rejects.toThrow('DECRYPT_3005');
  });
});
```

---

## 🚨 Incident Response

If you suspect a security breach:

1. **Immediately:**
   - Pause affected operations
   - Rotate all keys
   - Notify users

2. **Investigate:**
   - Review logs (without exposing plaintext)
   - Identify attack vector
   - Assess damage

3. **Remediate:**
   - Fix vulnerability
   - Deploy patches
   - Update documentation

4. **Report:**
   - Contact Zama security team
   - Provide details
   - Coordinate disclosure

---

## 📞 Security Contact

- **Email:** security@zama.ai
- **Discord:** [Zama Security Channel](https://discord.gg/zama)
- **Bug Bounty:** (Check Zama's program)

---

## ⚖️ Compliance

### Data Privacy

- **GDPR:** Encrypted data is pseudonymized
- **CCPA:** Users control their data
- **HIPAA:** End-to-end encryption protects PHI

### Audit Requirements

For production systems:
1. Smart contract audit (recommended: Trail of Bits, OpenZeppelin)
2. Frontend security review
3. Penetration testing
4. Regular security updates

---

## 🎓 Additional Resources

- [Zama Security Documentation](https://docs.zama.ai/protocol/security)
- [FHEVM Whitepaper](https://github.com/zama-ai/fhevm/blob/main/fhevm-whitepaper.pdf)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

**Remember: Security is not a feature, it's a requirement. 🔒**

**Last Updated:** October 2025

