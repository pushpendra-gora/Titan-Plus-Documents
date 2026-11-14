@echo off
title Titan Plus Documents
echo Starting Titan Plus Documents...

:: Check if server is running on 3000
netstat -ano | findstr :3000 >nul
if %errorlevel% neq 0 (
    start /min python -m http.server 3000
    timeout /t 1 /nobreak >nul
)

:: Launch as dedicated standalone desktop app (without browser address bar or tabs)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:3000" --window-size=460,860 --window-position=500,80
    exit
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="http://localhost:3000" --window-size=460,860 --window-position=500,80
    exit
)

:: Fallback
start http://localhost:3000

