#!/bin/bash

# Ride & Dine - Stop All Services
# ================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}Stopping Ride & Dine services...${NC}"
echo ""

# Kill Next.js processes
if pgrep -f "next dev" > /dev/null || pgrep -f "next-server" > /dev/null; then
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    echo -e "${GREEN}[✓]${NC} Stopped Next.js apps"
else
    echo -e "${YELLOW}[!]${NC} No Next.js apps were running"
fi

# Kill Stripe listener
if pgrep -f "stripe listen" > /dev/null; then
    pkill -f "stripe listen" 2>/dev/null || true
    echo -e "${GREEN}[✓]${NC} Stopped Stripe webhook listener"
else
    echo -e "${YELLOW}[!]${NC} Stripe listener was not running"
fi

echo ""
echo -e "${GREEN}All services stopped.${NC}"
echo ""
echo "To also stop Supabase, run: supabase stop"
echo ""
