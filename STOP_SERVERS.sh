#!/bin/bash
# Stop both backend and admin panel servers

echo "Stopping servers..."

# Kill processes on ports 8000 and 8080
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :8080 | xargs kill -9 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Servers stopped successfully"
else
    echo "✓ No servers running (or already stopped)"
fi

echo ""
echo "Press any key to close this window..."
read -n 1

