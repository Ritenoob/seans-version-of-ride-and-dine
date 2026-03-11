#!/bin/bash

# Ride & Dine - Development Startup Script
# =========================================

set -e

PROJECT_DIR="/home/nygmaee/Desktop/seans version of ride and dine"
STRIPE_API_KEY="sk_test_your_key"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Ride & Dine - Development Server${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

cleanup() {
    echo ""
    print_warning "Shutting down services..."
    
    # Kill all background processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    pkill -f "stripe listen" 2>/dev/null || true
    
    print_status "All services stopped"
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup SIGINT SIGTERM

print_header

cd "$PROJECT_DIR"

# Check if Supabase is running
echo "Checking Supabase status..."
if ! supabase status >/dev/null 2>&1; then
    print_warning "Supabase not running. Starting Supabase..."
    supabase start
    sleep 5
fi
print_status "Supabase is running"

# Kill any existing processes on our ports
print_warning "Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "stripe listen" 2>/dev/null || true
sleep 2

# Create log directory
mkdir -p /tmp/ridendine-logs

# Start Customer Web App (port 3002)
echo ""
echo "Starting Customer Web App on port 3002..."
cd "$PROJECT_DIR/apps/web"
nohup pnpm dev > /tmp/ridendine-logs/web.log 2>&1 &
WEB_PID=$!
sleep 3

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 | grep -q "200\|302"; then
    print_status "Customer Web App running at http://localhost:3002"
else
    print_warning "Customer Web App starting... (check /tmp/ridendine-logs/web.log)"
fi

# Start Admin Dashboard (port 3003)
echo ""
echo "Starting Admin Dashboard on port 3003..."
cd "$PROJECT_DIR/apps/admin"
nohup pnpm dev > /tmp/ridendine-logs/admin.log 2>&1 &
ADMIN_PID=$!
sleep 3

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 | grep -q "200\|302"; then
    print_status "Admin Dashboard running at http://localhost:3003"
else
    print_warning "Admin Dashboard starting... (check /tmp/ridendine-logs/admin.log)"
fi

# Start Driver App (port 3004)
echo ""
echo "Starting Driver App on port 3004..."
cd "$PROJECT_DIR/apps/driver"
nohup pnpm dev > /tmp/ridendine-logs/driver.log 2>&1 &
DRIVER_PID=$!
sleep 3

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3004 | grep -q "200\|302"; then
    print_status "Driver App running at http://localhost:3004"
else
    print_warning "Driver App starting... (check /tmp/ridendine-logs/driver.log)"
fi

# Start Stripe Webhook Listener
echo ""
echo "Starting Stripe Webhook Listener..."
if [ -f ~/.local/bin/stripe ]; then
    nohup ~/.local/bin/stripe listen \
        --forward-to localhost:3002/api/webhooks/stripe \
        --api-key "$STRIPE_API_KEY" \
        > /tmp/ridendine-logs/stripe.log 2>&1 &
    STRIPE_PID=$!
    sleep 3
    print_status "Stripe Webhook Listener running"
else
    print_error "Stripe CLI not found at ~/.local/bin/stripe"
fi

# Print summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  All Services Started!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  ${GREEN}Customer Web:${NC}  http://localhost:3002"
echo -e "  ${GREEN}Admin Dashboard:${NC} http://localhost:3003"
echo -e "  ${GREEN}Driver App:${NC}     http://localhost:3004"
echo -e "  ${GREEN}Supabase Studio:${NC} http://localhost:54323"
echo ""
echo -e "${BLUE}Test Credentials:${NC}"
echo "  Customer: customer@example.com / password123"
echo "  Driver:   driver.john@example.com / password123"
echo "  Chef:     chef.maria@example.com / password123"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  Web:    /tmp/ridendine-logs/web.log"
echo "  Admin:  /tmp/ridendine-logs/admin.log"
echo "  Driver: /tmp/ridendine-logs/driver.log"
echo "  Stripe: /tmp/ridendine-logs/stripe.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and tail logs
tail -f /tmp/ridendine-logs/*.log 2>/dev/null
