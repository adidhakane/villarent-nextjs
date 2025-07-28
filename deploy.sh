#!/bin/bash

# Villa Rental System - Quick Deploy Script

echo "🚀 Villa Rental System - Team Deployment"
echo "========================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Villa Rental System"
else
    echo "📁 Git repository exists, updating..."
    git add .
    git commit -m "Deploy: Villa Rental System updates"
fi

echo ""
echo "🎯 Choose your deployment platform:"
echo "1. Vercel (Recommended - Free)"
echo "2. Railway (Database included)"
echo "3. Netlify (Static hosting)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔧 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚂 Deploying to Railway..."
        echo "1. Go to https://railway.app"
        echo "2. Connect your GitHub account"
        echo "3. Deploy this repository"
        echo "4. Add environment variables in Railway dashboard"
        ;;
    3)
        echo "🌐 Deploying to Netlify..."
        echo "1. Go to https://netlify.com"
        echo "2. Connect your GitHub account" 
        echo "3. Deploy this repository"
        echo "4. Build command: npm run build"
        echo "5. Publish directory: .next"
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo ""
echo "✅ Don't forget to set these environment variables:"
echo "   DATABASE_URL=file:./dev.db"
echo "   NEXTAUTH_SECRET=your-production-secret"
echo "   NEXTAUTH_URL=https://your-deployed-url.com"
echo "   NODE_ENV=production"
echo ""
echo "🎯 Demo Credentials for your team:"
echo "   Admin: admin@example.com / admin123"
echo "   Villa Owner: owner@example.com / owner123"
