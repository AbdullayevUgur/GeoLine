#!/bin/bash
# Start both servers in the background (no terminal windows)

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start backend server in background
cd "$SCRIPT_DIR"
source venv/bin/activate
cd backend
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment
sleep 2

# Start admin panel server in background
cd "$SCRIPT_DIR/admin"
nohup python3 -m http.server 8080 > ../admin.log 2>&1 &
ADMIN_PID=$!

# Save PIDs to file for easy stopping
echo "$BACKEND_PID" > "$SCRIPT_DIR/.server_pids"
echo "$ADMIN_PID" >> "$SCRIPT_DIR/.server_pids"

echo "✓ Servers started in background!"
echo "✓ Backend API: http://localhost:8000"
echo "✓ Admin Panel: http://localhost:8080"
echo ""
echo "Logs saved to: backend.log and admin.log"
echo ""
echo "Press any key to close..."
read -n 1

