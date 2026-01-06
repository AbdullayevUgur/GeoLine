#!/bin/bash
# Start both backend and admin panel servers

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Activate virtual environment and start backend server
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR' && source venv/bin/activate && cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000\""

# Wait a moment
sleep 1

# Start admin panel server in a new terminal window
osascript -e "tell application \"Terminal\" to do script \"cd '$SCRIPT_DIR/admin' && python3 -m http.server 8080\""

echo "✓ Servers starting in Terminal windows..."
echo "✓ Backend API: http://localhost:8000"
echo "✓ Admin Panel: http://localhost:8080"
echo ""
echo "Press any key to close this window..."
read -n 1

