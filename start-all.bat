@echo off
title SmartAttend - Unified Services Launcher
cls
echo ========================================================
echo        SmartAttend - All Services Launcher
echo ========================================================
echo.
echo Launching:
echo   [1] Web Dashboard (React + Vite)        : http://localhost:5173
echo   [2] Biometric Bridge (Express + TS)      : http://localhost:8002
echo   [3] Face Recognition (FastAPI + OpenCV)  : http://localhost:8001
echo.
echo Starting all services in one go...
echo.

node scripts\run-all.mjs

pause
