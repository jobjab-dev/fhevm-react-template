# 🚀 Deployment Guide

## Deploy to Vercel (Recommended)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jobjab-dev/fhevm-react-template)

### Manual Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd fhevm-react-template
vercel
```

4. **Follow prompts:**
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `fhevm-react-template`
- Directory: `./`
- Override settings: `N`

5. **Production deployment:**
```bash
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

```bash
# Required
NEXT_PUBLIC_ENABLE_TESTNETS=true

# Optional (for Sepolia deployment)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
NEXT_PUBLIC_INFURA_API_KEY=your_infura_key
```

## Deploy to Netlify

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Build the project:**
```bash
pnpm install
pnpm sdk:build
pnpm next:build
```

3. **Deploy:**
```bash
netlify deploy --dir=packages/nextjs/.next
```

## Deploy to GitHub Pages

**Note:** GitHub Pages doesn't support Next.js SSR. Use Vercel instead.

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify MetaMask connection works
- [ ] Test encryption/decryption flow
- [ ] Check contract deployment on testnet
- [ ] Verify error handling
- [ ] Test on mobile devices

## Troubleshooting

### Build fails on Vercel

**Issue:** Module not found errors

**Solution:**
1. Ensure `pnpm-workspace.yaml` is committed
2. Add `installCommand: "pnpm install"` to `vercel.json`
3. Set Node version to 20.x in Vercel dashboard

### SDK not building

**Issue:** `fhevm-sdk` build fails

**Solution:**
```bash
# Build SDK first
cd packages/fhevm-sdk
pnpm install
pnpm build
cd ../..
```

### Contract addresses missing

**Issue:** `deployedContracts.ts` is empty

**Solution:**
Deploy contracts before deploying frontend:
```bash
pnpm chain          # Terminal 1
pnpm contracts:all  # Terminal 2
```

## Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify

1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS

## Performance Optimization

### Recommended Settings

```json
// next.config.ts
{
  "compress": true,
  "productionBrowserSourceMaps": false,
  "swcMinify": true
}
```

### Image Optimization

Images are optimized automatically by Next.js Image component.

## Monitoring

### Vercel Analytics

Enable in Project Settings → Analytics

### Error Tracking

Consider adding:
- Sentry
- LogRocket
- Bugsnag

## Security

### Environment Variables

- Never commit `.env.local`
- Use Vercel/Netlify environment variables
- Rotate API keys regularly

### Headers

Add security headers in `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ];
}
```

## Continuous Deployment

### Vercel

Auto-deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview

### GitHub Actions

CI/CD workflows available in `.github/workflows/` (currently disabled for manual deployment).

---

**Need help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

