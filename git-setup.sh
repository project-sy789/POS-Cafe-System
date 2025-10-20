#!/bin/bash

# Cafe POS System - Git Setup Script
# This script initializes git and prepares for GitHub upload

echo "🚀 Setting up Git repository..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0;33m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git is installed${NC}"

# Check if already a git repository
if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository already exists${NC}"
    read -p "Do you want to reinitialize? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .git
        echo -e "${GREEN}✅ Removed existing .git directory${NC}"
    else
        echo -e "${BLUE}ℹ️  Keeping existing repository${NC}"
        exit 0
    fi
fi

# Initialize git
echo -e "${YELLOW}📦 Initializing Git repository...${NC}"
git init
echo -e "${GREEN}✅ Git initialized${NC}"

# Add all files
echo -e "${YELLOW}📝 Adding files...${NC}"
git add .
echo -e "${GREEN}✅ Files added${NC}"

# Create initial commit
echo -e "${YELLOW}💾 Creating initial commit...${NC}"
git commit -m "Initial commit: Cafe POS System v1.0.0

Features:
- Complete POS system with real-time updates
- Theme system (Default & Minimal)
- Product options and customization
- User management (Manager, Cashier, Barista)
- Sales reporting and analytics
- Receipt printing with store information
- Socket.IO real-time communication
- Responsive design for all devices
- Role-based access control
- MongoDB database with Mongoose ODM

Tech Stack:
- Frontend: React 18, Vite, TailwindCSS, Zustand
- Backend: Node.js, Express, MongoDB
- Real-time: Socket.IO
- Authentication: JWT, Bcrypt

Demo Accounts:
- Manager: admin/admin123
- Cashier: cashier1/cashier123
- Barista: barista1/barista123"

echo -e "${GREEN}✅ Initial commit created${NC}"

# Set main branch
git branch -M main
echo -e "${GREEN}✅ Branch set to 'main'${NC}"

echo ""
echo -e "${GREEN}🎉 Git repository setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Copy the repository URL"
echo "3. Run these commands:"
echo ""
echo -e "${BLUE}   git remote add origin https://github.com/YOUR_USERNAME/cafe-pos-system.git${NC}"
echo -e "${BLUE}   git push -u origin main${NC}"
echo ""
echo "Or use the quick-push.sh script after creating the repository"
echo ""
