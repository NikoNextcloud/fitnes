@echo off
cd /d "%~dp0"
start "" http://127.0.0.1:8767/index.html
python lyfta_proxy_server.py
