@echo off
title SmartAttend - Stop All Services
cls
echo ========================================================
echo        SmartAttend - Stopping All Services
echo ========================================================
echo.
echo Freeing ports 5173, 8001, and 8002...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
  taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8001') do (
  taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8002') do (
  taskkill /f /pid %%a >nul 2>&1
)

echo All SmartAttend ports have been freed.
echo Done!
