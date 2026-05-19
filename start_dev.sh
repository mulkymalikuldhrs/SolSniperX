#!/bin/bash

# SolSniperX Portable Start Script

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 1. Start Backend
echo "Starting SolSniperX Backend..."
cd "$SCRIPT_DIR/backend"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment and installing dependencies..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
    ./venv/bin/python -m playwright install chromium
fi
source venv/bin/activate
PYTHONPATH=src python src/main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# 2. Start Frontend
echo "Starting SolSniperX Frontend..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
fi

if command -v pnpm &> /dev/null; then
    pnpm run dev --host > frontend.log 2>&1 &
else
    npm run dev -- --host > frontend.log 2>&1 &
fi
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo "SolSniperX development servers are starting in the background."
echo "Check backend.log and frontend.log for details."
echo "To stop them, run: kill $BACKEND_PID $FRONTEND_PID"
