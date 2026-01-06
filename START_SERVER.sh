#!/bin/bash
# Script to start the GeoLine CMS backend server

cd /Users/ugur/IdeaProjects/builerz-master

# Activate virtual environment
source venv/bin/activate

# Navigate to backend
cd backend

# Start server
echo "Starting GeoLine CMS Backend Server..."
echo "Server will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

