@echo off
echo ========================================================
echo  BufferGuard - Starting FastAPI Backend Server
echo ========================================================

cd ..\backend
set PYTHONPATH=%CD%\..
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
