# FHEVM SDK - Automated Setup Script (Windows)
# This script sets up the entire project in one command

Write-Host "🔐 Universal FHEVM SDK - Automated Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
$nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($nodeMajor -lt 20) {
    Write-Host "❌ Error: Node.js >= 20.0.0 required" -ForegroundColor Red
    Write-Host "   Current version: $nodeVersion" -ForegroundColor Red
    Write-Host "   Install from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js version OK: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Check pnpm
Write-Host "📋 Checking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm -v 2>$null
    Write-Host "✅ pnpm ready: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  pnpm not found, installing..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✅ pnpm installed" -ForegroundColor Green
}
Write-Host ""

# Initialize submodules
Write-Host "📦 Initializing git submodules..." -ForegroundColor Yellow
git submodule update --init --recursive
Write-Host "✅ Submodules initialized" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build SDK
Write-Host "🔨 Building FHEVM SDK..." -ForegroundColor Yellow
pnpm sdk:build
Write-Host "✅ SDK built successfully" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Quick Commands:" -ForegroundColor Cyan
Write-Host "   pnpm all:demo    - Full demo (chain + deploy + start)" -ForegroundColor White
Write-Host "   pnpm all:setup   - Setup only (install + build)" -ForegroundColor White
Write-Host "   pnpm all:test    - Run all tests" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. pnpm chain          # Start local blockchain" -ForegroundColor White
Write-Host "   2. pnpm contracts:all  # Deploy contracts" -ForegroundColor White
Write-Host "   3. pnpm start          # Start Next.js app" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   • Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "   • API Reference: API_REFERENCE.md" -ForegroundColor White
Write-Host "   • Cookbook: COOKBOOK.md" -ForegroundColor White
Write-Host ""
Write-Host "✨ Happy building with FHEVM! 🔐" -ForegroundColor Magenta

