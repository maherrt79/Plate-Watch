#!/bin/bash

# Plate-Watch Local Deployment Script

set -e # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Plate-Watch Local Deployment...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${RED}Stopping services...${NC}"
    
    # Kill background jobs
    if [ -n "$WEB_PID" ]; then
        echo "Stopping Web App (PID: $WEB_PID)..."
        kill $WEB_PID 2>/dev/null || true
    fi
    
    if [ -n "$EDGE_PID" ]; then
        echo "Stopping Edge Device (PID: $EDGE_PID)..."
        kill $EDGE_PID 2>/dev/null || true
    fi

    echo "Stopping Docker services..."
    docker-compose down

    echo -e "${GREEN}All services stopped.${NC}"
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# 1. Check Prerequisites
echo -e "${BLUE}[1/4] Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo >&2 "python3 is required but not installed. Aborting."; exit 1; }

# 2. Start Backend & Database
echo -e "${BLUE}[2/4] Starting Backend & Database (Docker)...${NC}"
docker-compose up -d --build
echo -e "${GREEN}Backend & Database started.${NC}"

# 3. Start Web Application
echo -e "${BLUE}[3/4] Starting Web Application...${NC}"
cd web_app
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm run dev &
WEB_PID=$!
cd ..
echo -e "${GREEN}Web Application started (PID: $WEB_PID).${NC}"

# 4. Start Edge Device Simulation
echo -e "${BLUE}[4/4] Starting Edge Device Simulation...${NC}"
cd edge_device
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null
python main.py &
EDGE_PID=$!
cd ..
echo -e "${GREEN}Edge Device Simulation started (PID: $EDGE_PID).${NC}"

echo -e "\n${GREEN}Deployment Complete!${NC}"
echo -e "---------------------------------------------------"
echo -e "Backend API:    http://localhost:8000/docs"
echo -e "Database GUI:   http://localhost:8080"
echo -e "Web Dashboard:  http://localhost:5173"
echo -e "---------------------------------------------------"
echo -e "${BLUE}Press Ctrl+C to stop all services.${NC}"

# Wait for background processes
wait
