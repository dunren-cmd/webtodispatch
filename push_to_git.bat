@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .
git commit -m "更新：WebToDispatch_2 專案"
git push origin main
pause
