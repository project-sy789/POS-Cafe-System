#!/bin/bash

# Cafe POS System - Deployment Script
# This script builds and prepares the application for production deployment

echo "🚀 Starting deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Install server dependencies
echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
cd server
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install server dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server dependencies installed${NC}"

# Install client dependencies
echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install client dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Client dependencies installed${NC}"

# Build client
echo -e "${YELLOW}🔨 Building client...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build client${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Client built successfully${NC}"

# Check if .env files exist
cd ..
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: server/.env not found. Please create it from server/.env.example${NC}"
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: client/.env not found. Please create it from client/.env.example${NC}"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "server/uploads" ]; then
    mkdir -p server/uploads
    touch server/uploads/.gitkeep
    echo -e "${GREEN}✅ Created uploads directory${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Configure environment variables in server/.env"
echo "3. Run: cd server && npm start"
echo ""
echo "For production deployment:"
echo "- Set NODE_ENV=production in server/.env"
echo "- Use a process manager like PM2"
echo "- Configure reverse proxy (nginx)"
echo "- Set up SSL certificate"
echo ""
