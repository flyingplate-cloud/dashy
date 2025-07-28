#!/bin/bash

# Cloudflare Pages Build Script for Dashy
set -e

echo "🚀 Starting Dashy build process..."

# Install dependencies with yarn
echo "📦 Installing dependencies..."
yarn install --frozen-lockfile=false

# Build the application
echo "🔨 Building application..."
NODE_OPTIONS=--openssl-legacy-provider yarn build

echo "✅ Build completed successfully!"