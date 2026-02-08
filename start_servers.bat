@echo off
echo Starting Gamification Catalog...

echo Starting Backend (FastAPI)...
start "Backend Server" cmd /k "py -m pip install -r backend/requirements.txt && py -m uvicorn backend.main:app --reload --port 8000"

echo Starting Frontend (React)...
start "Frontend Server" cmd /k "cd frontend && npm install && npm run dev"

echo Both servers should be starting in new windows.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
