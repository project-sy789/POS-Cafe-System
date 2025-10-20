#!/bin/bash

# Cafe POS System - Update Existing Repository Script
# This script updates your existing GitHub repository

echo "🔄 Updating Existing GitHub Repository"
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

echo -e "${GREEN}✅ Git repository found${NC}"

# Check current status
echo -e "${YELLOW}📊 Checking current status...${NC}"
git status

echo ""
echo -e "${YELLOW}📝 What would you like to do?${NC}"
echo "1. Add remote and push (first time)"
echo "2. Update existing repository (add, commit, push)"
echo "3. Force push (overwrite remote - use with caution!)"
echo "4. Cancel"
echo ""
read -p "Choose option (1-4): " OPTION

case $OPTION in
    1)
        # Add remote and push
        echo ""
        echo -e "${YELLOW}📝 Enter your GitHub repository URL:${NC}"
        echo "Example: https://github.com/username/cafe-pos-system.git"
        read -p "URL: " REPO_URL

        if [ -z "$REPO_URL" ]; then
            echo -e "${RED}❌ Repository URL is required${NC}"
            exit 1
        fi

        # Check if remote exists
        if git remote | grep -q "origin"; then
            echo -e "${YELLOW}⚠️  Remote 'origin' already exists${NC}"
            git remote -v
            read -p "Do you want to update it? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git remote remove origin
                echo -e "${GREEN}✅ Removed old remote${NC}"
            else
                echo -e "${BLUE}ℹ️  Keeping existing remote${NC}"
                REPO_URL=""
            fi
        fi

        if [ ! -z "$REPO_URL" ]; then
            echo -e "${YELLOW}🔗 Adding remote...${NC}"
            git remote add origin "$REPO_URL"
            echo -e "${GREEN}✅ Remote added${NC}"
        fi

        # Push
        echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
        git push -u origin main

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}🎉 Successfully pushed to GitHub!${NC}"
        else
            echo ""
            echo -e "${RED}❌ Push failed${NC}"
        fi
        ;;

    2)
        # Update existing repository
        echo ""
        echo -e "${YELLOW}📝 Enter commit message:${NC}"
        read -p "Message: " COMMIT_MSG

        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
            echo -e "${BLUE}ℹ️  Using default message: $COMMIT_MSG${NC}"
        fi

        # Add all changes
        echo -e "${YELLOW}📦 Adding changes...${NC}"
        git add .
        echo -e "${GREEN}✅ Changes added${NC}"

        # Commit
        echo -e "${YELLOW}💾 Creating commit...${NC}"
        git commit -m "$COMMIT_MSG"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Commit created${NC}"
        else
            echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
        fi

        # Push
        echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
        git push origin main

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}🎉 Successfully updated GitHub repository!${NC}"
        else
            echo ""
            echo -e "${RED}❌ Push failed${NC}"
            echo "Try: git pull origin main --rebase"
        fi
        ;;

    3)
        # Force push
        echo ""
        echo -e "${RED}⚠️  WARNING: Force push will overwrite remote repository!${NC}"
        echo "This will delete all remote changes that are not in your local repository."
        echo ""
        read -p "Are you sure? Type 'yes' to continue: " CONFIRM

        if [ "$CONFIRM" != "yes" ]; then
            echo -e "${BLUE}ℹ️  Cancelled${NC}"
            exit 0
        fi

        # Add and commit
        echo -e "${YELLOW}📦 Adding changes...${NC}"
        git add .
        git commit -m "Force update: $(date '+%Y-%m-%d %H:%M:%S')"

        # Force push
        echo -e "${YELLOW}📤 Force pushing to GitHub...${NC}"
        git push -f origin main

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}🎉 Successfully force pushed to GitHub!${NC}"
        else
            echo ""
            echo -e "${RED}❌ Force push failed${NC}"
        fi
        ;;

    4)
        echo -e "${BLUE}ℹ️  Cancelled${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "Repository URL:"
git remote get-url origin 2>/dev/null || echo "No remote configured"
echo ""
