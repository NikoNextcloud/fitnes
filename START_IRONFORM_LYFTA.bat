@echo off
cd /d "%~dp0"
set /p LYFTA_API_KEY=Paste Lyfta API key for local testing: 
start "" http://127.0.0.1:8767/index.html
python lyfta_proxy_server.py
