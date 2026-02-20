import subprocess
import os
import sys
import platform
import time

def run_commands():
    is_windows = platform.system() == "Windows"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base_dir, ".venv", "Scripts", "python.exe") if is_windows else os.path.join(base_dir, ".venv", "bin", "python")
    
    if os.path.exists(venv_python):
        python_exe = venv_python
    else:
        python_exe = sys.executable

    if os.path.exists(venv_python):
         backend_cmd = f'"{python_exe}" -m pip install -r backend/requirements.txt && "{python_exe}" -m uvicorn backend.main:app --reload --port 8000'
    else:
         backend_cmd = f'"{python_exe}" -m uvicorn backend.main:app --reload --port 8000'
    
    frontend_cmd = f"cd frontend && npm install --legacy-peer-deps && npm run dev"

    if is_windows:
        subprocess.Popen(f'start "Backend Server" cmd /k "{backend_cmd}"', shell=True, cwd=base_dir)
        subprocess.Popen(f'start "Frontend Server" cmd /k "{frontend_cmd}"', shell=True, cwd=base_dir)
    else:
        import signal
        subprocess.run("fuser -k 8000/tcp 2>/dev/null || true", shell=True, cwd=base_dir)
        subprocess.run("fuser -k 5175/tcp 2>/dev/null || true", shell=True, cwd=base_dir)
        time.sleep(0.5)
        subprocess.Popen(backend_cmd, shell=True, cwd=base_dir, stdin=subprocess.DEVNULL)
        subprocess.Popen(frontend_cmd, shell=True, cwd=base_dir, stdin=subprocess.DEVNULL)

    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:5175")

if __name__ == "__main__":
    run_commands()
