@echo off
title VotePulse E-Voting System Launcher
echo ===================================================
echo   Starting VotePulse E-Voting System (Local Engine)
echo ===================================================
echo.
echo Installing dependencies if needed...
call npm install
echo.
echo Building React SPA Assets...
call npm run build
echo.
echo ===================================================
echo   Server Active! Opening browser at http://localhost:3000
echo ===================================================
start http://localhost:3000
node server.js
pause
