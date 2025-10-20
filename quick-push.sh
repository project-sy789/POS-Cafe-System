#!/bin/bash

# Cafe POS System - Quick Push Script
# This script helps you quickly push to GitHub

echo "🚀 Quick Push to GitHub"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git repository not initialized${NC}"
    echo "Run ./git-setup.sh first"
    exit 1
fi

# Ask for GitHub repository URL
echo -e "${YELLOW}📝 Enter your GitHub repository URL:${NC}"
echo "Example: https://github.com/username/cafe-pos-system.git"
read -p "URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}❌ Repository URL is required${NC}"
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
    read -p "Do you want to update it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        echo -e "${GREEN}✅ Removed old remote${NC}"
    else
        echo -e "${BLUE}ℹ️  Keeping existing remote${NC}"
    fi
fi

# Add remote
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}🔗 Adding remote...${NC}"
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote added${NC}"
fi

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Successfully pushed to GitHub!${NC}"
    echo ""
    echo "Your repository is now available at:"
    echo -e "${BLUE}${REPO_URL%.git}${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Add a description to your repository"
    echo "2. Add topics/tags (pos, cafe, mern, react, mongodb)"
    echo "3. Enable GitHub Pages (optional)"
    echo "4. Add collaborators (optional)"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Push failed${NC}"
    echo "Please check:"
    echo "- Repository URL is correct"
    echo "- You have access to the repository"
    echo "- Repository exists on GitHub"
    echo ""
fi
