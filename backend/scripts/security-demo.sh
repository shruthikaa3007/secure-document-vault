#!/bin/bash

# Security Demo Script
# This script demonstrates the security features of the Secure Document Vault

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Secure Document Vault              ${NC}"
echo -e "${BLUE}   Security Features Demonstration    ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Function to check if a package is installed
check_package() {
    if ! npm list --depth=0 | grep -q "$1"; then
        echo -e "${YELLOW}Installing $1...${NC}"
        npm install $1 --save
    fi
}

# Check and install required packages
echo -e "${CYAN}Checking required packages...${NC}"
check_package "axios"
check_package "form-data"

# Run the security demo
echo -e "${GREEN}Running security demo...${NC}"
node scripts/security-demo.js

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Demo completed!${NC}"