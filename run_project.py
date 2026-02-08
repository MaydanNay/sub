import subprocess
import os
import sys
import platform

def run_commands():
    # Detect OS
    is_windows = platform.system() == "Windows"
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, "frontend")
    backend_dir = os.path.join(base_dir, "backend")

    print(f"Starting Gamification Project from: {base_dir}")

    # Use the same python executable that launched this script
    python_exe = sys.executable
    
    # Backend Command
    # Install requirements and run uvicorn
    backend_cmd = f'"{python_exe}" -m pip install -r {os.path.join("backend", "requirements.txt")} && "{python_exe}" -m uvicorn backend.main:app --reload --port 8000'
    
    # Frontend Command
    # Install dependencies and run dev server
    frontend_cmd = f"cd frontend && npm install && npm run dev"

    if is_windows:
        # Launch in new console windows
        print("Launching Backend...")
        subprocess.Popen(f'start "Backend Server" cmd /k "{backend_cmd}"', shell=True, cwd=base_dir)
        
        print("Launching Frontend...")
        subprocess.Popen(f'start "Frontend Server" cmd /k "{frontend_cmd}"', shell=True, cwd=base_dir)
        
    else:
        # Fallback for Linux/Mac (using gnome-terminal or similar might be needed, but simple background for now)
        print("Non-Windows OS detected. Running in background (logs might be mixed).")
        subprocess.Popen(backend_cmd, shell=True, cwd=base_dir)
        subprocess.Popen(frontend_cmd, shell=True, cwd=base_dir)

    print("\nServers are starting...")
    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:5173")
    print("\nYou can close this window/script, the servers will keep running.")

if __name__ == "__main__":
    run_commands()
