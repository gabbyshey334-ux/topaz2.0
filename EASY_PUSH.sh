#!/bin/bash

# TOPAZ 2.0 - Easy Push Script
# This script helps you push your changes to GitHub

echo "🚀 TOPAZ 2.0 - Easy Push to GitHub"
echo "===================================="
echo ""

cd /Users/cipher/Documents/TOPAZ/topaz-scoring

# Check current status
echo "📊 Checking git status..."
COMMITS_AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")

if [ "$COMMITS_AHEAD" = "0" ]; then
    echo "✅ Already up to date! Nothing to push."
    echo ""
    echo "Your changes might already be on GitHub."
    echo "Check: https://github.com/gabbyshey334-ux/topaz2.0"
    exit 0
fi

echo "📦 You have $COMMITS_AHEAD commit(s) ready to push:"
echo ""
git log origin/main..HEAD --oneline
echo ""

# Instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 EASIEST WAY TO PUSH:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Open GitHub Desktop app"
echo "    (Download from: https://desktop.github.com if needed)"
echo ""
echo "2️⃣  Add this repository:"
echo "    File → Add Local Repository"
echo "    Choose: /Users/cipher/Documents/TOPAZ/topaz-scoring"
echo ""
echo "3️⃣  Click the 'Push origin' button"
echo ""
echo "✅  Done! Vercel will auto-deploy in 2-3 minutes"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Alternative method
echo "💡 ALTERNATIVE: Use GitHub Personal Access Token"
echo ""
echo "If you prefer terminal:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click: 'Generate new token (classic)'"
echo "3. Check: 'repo' scope"
echo "4. Copy the generated token"
echo "5. Run this command (replace YOUR_TOKEN):"
echo ""
echo "   git remote set-url origin https://YOUR_TOKEN@github.com/gabbyshey334-ux/topaz2.0.git"
echo "   git push origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# What will be deployed
echo "📦 WHAT WILL BE DEPLOYED:"
echo ""
echo "  ✅ Division Type filter for judge scoring"
echo "  ✅ Filter options: Solo, Duo/Trio, Groups, etc."
echo "  ✅ Enhanced medal points logging"
echo "  ✅ Better error handling"
echo ""

# Next steps
echo "🎯 AFTER YOU PUSH:"
echo ""
echo "  1. Vercel auto-deploys (2-3 minutes)"
echo "  2. Check: https://vercel.com/dashboard"
echo "  3. Test Division Type filter on live site"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Your changes are safely committed!"
echo "   Just need to push to GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


