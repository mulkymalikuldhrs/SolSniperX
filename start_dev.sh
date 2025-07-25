#!/bin/bash

echo "Starting SolSniperX Backend..."
cd /home/mulky/Desktop/SolSniperX/backend
source venv/bin/activate
python src/main.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
cd - # Go back to the previous directory

echo "Starting SolSniperX Frontend..."
cd /home/mulky/Desktop/SolSniperX/frontend
pnpm run dev --host &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
cd - # Go back to the previous directory

echo "SolSniperX development servers are starting in the background."
echo "Backend is likely accessible at http://0.0.0.0:5000"
echo "Frontend is likely accessible at http://localhost:5173 (check terminal output for exact URL)"
echo ""
echo "To stop the backend, run: kill $BACKEND_PID"
echo "To stop the frontend, run: kill $FRONTEND_PID"
echo "Or to stop both, you might use: pkill -f gunicorn && pkill -f vite"
