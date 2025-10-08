#!/bin/bash

# Development helper script to kill existing processes and start Shopify app cleanly
# Usage: npm run dev:clean

set -e

echo "🧹 Cleaning up existing processes..."

# Ports to check and kill
PORTS=(9293 3457 49665)

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    echo "Checking port $port..."
    
    # Find processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo "Found processes on port $port: $pids"
        echo "Killing processes..."
        echo $pids | xargs kill -9 2>/dev/null || true
        echo "✅ Port $port cleared"
    else
        echo "✅ Port $port is free"
    fi
}

# Kill processes on each port
for port in "${PORTS[@]}"; do
    kill_port $port
done

echo ""
echo "🚀 Starting Shopify app development server..."
echo "Using theme port 9393 to avoid conflicts"
echo ""

# Start the Shopify app with a different theme port
shopify app dev --theme-port=9393
