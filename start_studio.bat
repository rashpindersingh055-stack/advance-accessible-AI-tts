@echo off
title Vision Max Intelligence - Neural Voice Studio
echo ========================================================
echo   VISION MAX INTELLIGENCE - NEURAL VOICE STUDIO v2.0
echo ========================================================
echo.

set ROOT_DIR=%~dp0

echo [1/2] Starting Python FastAPI Backend Server on port 8000...
start "Vision Max Backend" cmd /k "cd /d "%ROOT_DIR%backend" && pip install -r requirements.txt && python run.py"

echo [2/2] Starting React / Vite Frontend on port 3000...
start "Vision Max Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && npm install && npm run dev"

echo.
echo ========================================================
echo  🚀 Servers Launching!
echo  👉 Web App:     http://localhost:3000
echo  👉 Backend API: http://localhost:8000/docs
echo ========================================================
echo.
pause
