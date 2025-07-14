#!/bin/bash

# Quick Railway Deployment Script
# For users who already have Railway CLI set up

echo "🚀 Quick Railway Deployment"
echo "=========================="

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI ready"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "📱 View your app:"
echo "   railway open"
echo ""
echo "📊 Check logs:"
echo "   railway logs"
echo ""
echo "🔧 Manage variables:"
echo "   railway variables" 