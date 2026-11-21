@echo off
echo Starting Titan Documents App...
start http://localhost:3000
python -m http.server 3000
pause
