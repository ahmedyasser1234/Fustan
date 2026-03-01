#!/bin/bash

# Fustan Deployment Script for AlmaLinux 10
# This script automates the build and restart process

PROJECT_ROOT="/var/www/fustan"
BACKEND_DIR="$PROJECT_ROOT/server-nestjs"

echo "🚀 Starting deployment..."

cd $PROJECT_ROOT

# Pull latest changes (assuming git is set up)
git pull origin main

# Install dependencies
pnpm install

# Build Frontend
echo "📦 Building Frontend..."
pnpm build

# Build Backend
echo "📦 Building Backend..."
cd $BACKEND_DIR
pnpm install
pnpm build
pnpm db:push

# Restart Backend with PM2
echo "🔄 Restarting Backend Service..."
pm2 restart fustan-backend || pm2 start dist/main.js --name fustan-backend

echo "✅ Deployment complete!"
