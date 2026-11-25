@echo off
title SmartAttend - Parent Mobile App (Expo)
cls
echo ========================================================
echo        SmartAttend - Parent Mobile App (Expo)
echo ========================================================
echo.
echo Starting Expo Metro Bundler (with clean cache)...
echo.
echo Instructions:
echo   - Make sure your phone and PC are connected to the SAME Wi-Fi network.
echo   - Open the "Expo Go" app on your Android phone.
echo   - Scan the QR code displayed below.
echo.
call npm.cmd --workspace=@smartattend/mobile start -- --clear
pause


