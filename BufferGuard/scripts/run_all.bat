@echo off
echo ========================================================
echo  BufferGuard - Starting Full-Stack Application
echo ========================================================

start cmd /k "scripts\run_backend.bat"
timeout /t 3
start cmd /k "scripts\run_frontend.bat"

echo.
echo Application launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo.
pause
