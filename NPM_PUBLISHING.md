# 📦 npm Publishing Guide

## Quick Publish (3 Steps)

### 1. Build and Test

```bash
cd packages/fhevm-sdk
pnpm build
pnpm test
```

**Expected:** All tests pass ✅

---

### 2. Login to npm

```bash
npm login
# Enter your npm username, password, email
```

**Verify:**
```bash
npm whoami
# Should show your username
```

---

### 3. Publish

```bash
# Preview what will be published
npm publish --dry-run

# Publish for real
npm publish
```

**Done!** Package is now live at: https://www.npmjs.com/package/jobjab-fhevm-sdk

---

## Update Version (For Next Release)

```bash
# Bug fixes
npm version patch   # 0.1.1 → 0.1.2

# New features
npm version minor   # 0.1.1 → 0.2.0

# Breaking changes
npm version major   # 0.1.1 → 1.0.0

# Then publish
npm publish
```

---

## Troubleshooting

### "Package name already taken"

**Option 1:** Use scoped package
```bash
# Change in package.json
"name": "@your-username/fhevm-sdk"

# Then publish
npm publish --access public
```

**Option 2:** Choose different name
```bash
# Change in package.json
"name": "your-unique-fhevm-sdk"

npm publish
```

### "Not logged in"

```bash
npm login
```

### "Build failed"

```bash
# Clean and rebuild
rm -rf dist
pnpm build
```

---

## That's It!

**Package is published at:**
- https://www.npmjs.com/package/jobjab-fhevm-sdk

**Users can install:**
```bash
npm install jobjab-fhevm-sdk
```

🎉 **Success!**
