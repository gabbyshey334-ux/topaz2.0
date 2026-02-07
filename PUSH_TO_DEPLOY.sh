#!/bin/bash

# TOPAZ 2.0 - Push to Deploy Script
# This script will push your committed changes and trigger Vercel deployment

echo "🚀 TOPAZ 2.0 - Deployment Script"
echo "================================"
echo ""
echo "✅ Changes committed locally:"
echo "   - Division Type filter for judge scoring"
echo "   - Enhanced medal points logging"
echo ""
echo "📤 Pushing to GitHub..."
cd /Users/cipher/Documents/TOPAZ/topaz-scoring

# Try to push
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Vercel will auto-deploy from main branch"
    echo "   2. Check https://vercel.com/your-project for deployment status"
    echo "   3. Changes will be live in 2-3 minutes"
    echo ""
    echo "📋 What was deployed:"
    echo "   ✅ Division Type filter (Solo, Duo/Trio, Groups, etc.)"
    echo "   ✅ Enhanced medal points debugging"
    echo "   ✅ Improved error handling"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please use one of these methods:"
    echo ""
    echo "METHOD 1: GitHub Desktop (Easiest)"
    echo "   1. Open GitHub Desktop"
    echo "   2. Click 'Push origin' button"
    echo "   3. Done!"
    echo ""
    echo "METHOD 2: Manual Terminal Push"
    echo "   1. cd /Users/cipher/Documents/TOPAZ/topaz-scoring"
    echo "   2. git push origin main"
    echo "   3. Enter credentials if prompted"
    echo ""
    echo "METHOD 3: VS Code Source Control"
    echo "   1. Open VS Code"
    echo "   2. Click Source Control panel"
    echo "   3. Click '...' menu → Push"
    echo ""
fi

echo "💾 Your changes are safely committed locally!"
echo "================================"


