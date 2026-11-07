@echo off
echo ========================================================
echo  BufferGuard - Starting Vite Frontend Server
echo ========================================================

cd ..\frontend
set PATH=C:\Program Files\nodejs;%PATH%
npm run dev
pause
