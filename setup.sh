#!/bin/bash

# FHEVM SDK - Automated Setup Script
# This script sets up the entire project in one command

echo "🔐 Universal FHEVM SDK - Automated Setup"
echo "=========================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Error: Node.js >= 20.0.0 required"
  echo "   Current version: $(node -v)"
  echo "   Install from: https://nodejs.org/"
  exit 1
fi
echo "✅ Node.js version OK: $(node -v)"
echo ""

# Check pnpm
echo "📋 Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm not found, installing..."
  npm install -g pnpm
fi
echo "✅ pnpm ready: $(pnpm -v)"
echo ""

# Initialize submodules
echo "📦 Initializing git submodules..."
git submodule update --init --recursive
echo "✅ Submodules initialized"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Build SDK
echo "🔨 Building FHEVM SDK..."
pnpm sdk:build
echo "✅ SDK built successfully"
echo ""

# Success message
echo "=========================================="
echo "🎉 Setup Complete!"
echo ""
echo "📚 Quick Commands:"
echo "   pnpm all:demo    - Full demo (chain + deploy + start)"
echo "   pnpm all:setup   - Setup only (install + build)"
echo "   pnpm all:test    - Run all tests"
echo ""
echo "🚀 Next Steps:"
echo "   1. pnpm chain          # Start local blockchain"
echo "   2. pnpm contracts:all  # Deploy contracts"
echo "   3. pnpm start          # Start Next.js app"
echo ""
echo "📖 Documentation:"
echo "   • Quick Start: QUICKSTART.md"
echo "   • API Reference: API_REFERENCE.md"
echo "   • Cookbook: COOKBOOK.md"
echo ""
echo "✨ Happy building with FHEVM! 🔐"

