#!/bin/bash

# Deployment setup script for Cloudflare Pages
echo "🚀 Setting up Cloudflare Pages deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    bun add -D wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Please login to Cloudflare if prompted..."
bunx wrangler login

# Build the project
echo "🔨 Building the project..."
bun run build

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
bunx wrangler pages deploy dist --project-name employees-map

echo "✅ Deployment complete!"
echo "📝 Don't forget to set environment variables in Cloudflare Pages dashboard"
