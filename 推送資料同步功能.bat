@echo off
chcp 65001 >nul
echo ========================================
echo 推送資料庫資料同步功能到 Git
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 添加所有文件到暫存區...
git add .
if errorlevel 1 (
    echo ❌ 添加失敗！
    pause
    exit /b 1
)
echo ✅ 已完成
echo.

echo [2/4] 檢查暫存區狀態...
git status --short
echo.

echo [3/4] 提交變更...
git commit -m "新增：資料庫資料同步功能，支援導出和同步資料庫資料內容到 seed.sql，確保所有環境資料一致"
if errorlevel 1 (
    echo ⚠️  提交失敗或沒有變更需要提交
    echo.
    echo 檢查狀態：
    git status
    echo.
    pause
    exit /b 1
) else (
    echo ✅ 提交成功
)
echo.

echo [4/4] 推送到遠端倉庫...
git push
if errorlevel 1 (
    echo ⚠️  推送失敗，請檢查：
    echo    1. 是否已設定遠端倉庫
    echo    2. 是否有推送權限
    echo    3. 網路連接是否正常
) else (
    echo ✅ 推送成功！
    echo.
    echo 已推送的文件包括：
    echo   ✅ 導出資料庫資料_完整版.bat - 完整導出腳本
    echo   ✅ 導出資料庫資料.bat - 簡易導出腳本
    echo   ✅ 導出資料庫資料_自動版.bat - 自動導出腳本
    echo   ✅ 生成資料導出SQL.sql - SQL 查詢範本
    echo   ✅ supabase/seed.sql - 種子資料文件（已更新）
    echo   ✅ 資料庫資料同步說明.md - 完整說明文件
    echo   ✅ README.md - 已更新資料同步說明
    echo   ✅ 環境變數設定說明.md - 環境變數說明
    echo   ✅ 快速啟動指南.md - 快速啟動指南
    echo   ✅ 完整啟動指南.md - 完整啟動指南
    echo   ✅ Code.gs配置說明.md - Code.gs 配置說明
    echo   ✅ .env.example - 環境變數範本
    echo   ✅ api.ts - 已更新使用環境變數
    echo   ✅ vite.config.ts - 已更新支援環境變數
    echo   ✅ Code.gs - 已更新配置管理
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
pause
