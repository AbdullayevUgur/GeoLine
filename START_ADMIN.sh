#!/bin/bash
# Script to start admin panel web server

cd /Users/ugur/IdeaProjects/builerz-master/admin

echo "Starting Admin Panel Web Server..."
echo "Admin panel will be available at: http://localhost:8080"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

python3 -m http.server 8080

