@echo off
echo ========================================================
echo  BufferGuard - Compiling and Running C Engine Unit Tests
echo ========================================================

cd ..\c_engine
if not exist "bin" mkdir bin
gcc -std=c11 -Wall -Wextra tests/test_safe_str.c safe_functions/safe_str.c -o bin/test_safe_str.exe
bin\test_safe_str.exe
pause
