#!/bin/bash

# SHU Landing Page & Bot Server Startup Script

echo "=========================================="
echo "    Starting SHU Services...              "
echo "=========================================="

# 1. Start the Telegram Bot Server in the background
echo "[1/2] Starting Node.js Telegram Bot Server on port 3001..."
cd bot
npm install --silent
node server.js &
BOT_PID=$!
cd ..

# Wait a moment for the bot server to initialize
sleep 2

# 2. Start the Frontend Dev Server
echo "[2/2] Starting React (Vite) Frontend on port 5175..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=========================================="
echo "✅ Both services are running!"
echo "   Frontend: http://localhost:5175"
echo "   Bot API:  http://localhost:3001"
echo "=========================================="
echo "Press [CTRL+C] to stop all services."

# Trap SIGINT (Ctrl+C) to kill both background processes
trap "echo 'Stopping services...'; kill $BOT_PID $FRONTEND_PID; exit" INT

# Keep script running to maintain the background processes
wait
