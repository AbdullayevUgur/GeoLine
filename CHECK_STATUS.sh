#!/bin/bash
# Check status of both servers

echo "Checking server status..."
echo ""

# Check backend server (port 8000)
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✓ Backend API Server: RUNNING on http://localhost:8000"
else
    echo "✗ Backend API Server: NOT RUNNING"
fi

# Check admin panel server (port 8080)
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✓ Admin Panel Server: RUNNING on http://localhost:8080"
else
    echo "✗ Admin Panel Server: NOT RUNNING"
fi

echo ""
echo "Press any key to close this window..."
read -n 1

