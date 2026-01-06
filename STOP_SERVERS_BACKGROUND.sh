#!/bin/bash
# Stop servers started in background mode

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Stopping servers..."

# Kill by PIDs if file exists
if [ -f "$SCRIPT_DIR/.server_pids" ]; then
    while read pid; do
        kill -9 "$pid" 2>/dev/null
    done < "$SCRIPT_DIR/.server_pids"
    rm "$SCRIPT_DIR/.server_pids"
fi

# Also kill by ports (backup method)
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :8080 | xargs kill -9 2>/dev/null

echo "✓ Servers stopped"
echo ""
echo "Press any key to close..."
read -n 1

