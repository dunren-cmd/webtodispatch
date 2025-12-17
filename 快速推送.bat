@echo off
chcp 65001 >nul
echo ========================================
echo 快速推送到 Git（包含所有變更和 Supabase）
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 添加所有文件到暫存區...
git add .
echo ✅ 已完成
echo.

echo [2/4] 檢查暫存區狀態...
git status --short
echo.

echo [3/4] 提交變更...
git commit -m "新增：資料庫資料同步功能，環境變數配置，支援導出和同步資料庫資料內容到 seed.sql，確保所有環境資料結構和內容完全一致"
if errorlevel 1 (
    echo ⚠️  提交失敗或沒有變更需要提交
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
    echo.
    echo 如果是第一次推送，請先執行：
    echo   git remote add origin https://github.com/你的用戶名/倉庫名稱.git
    echo   git branch -M main
    echo   git push -u origin main
) else (
    echo ✅ 推送成功！
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
echo 已推送的文件包括：
echo   ✅ 資料庫資料同步功能：
echo      - 導出資料庫資料_完整版.bat
echo      - 導出資料庫資料.bat
echo      - 導出資料庫資料_自動版.bat
echo      - 生成資料導出SQL.sql
echo      - 資料庫資料同步說明.md
echo   ✅ 環境變數配置：
echo      - .env.example
echo      - api.ts（已更新使用環境變數）
echo      - vite.config.ts（已更新支援環境變數）
echo      - Code.gs（已更新配置管理）
echo      - 環境變數設定說明.md
echo      - Code.gs配置說明.md
echo   ✅ 啟動指南：
echo      - 快速啟動指南.md
echo      - 完整啟動指南.md
echo      - start.bat
echo   ✅ 資料庫相關：
echo      - supabase/seed.sql（已更新）
echo      - supabase/migrations/*.sql
echo   ✅ 其他更新：
echo      - README.md（已更新）
echo      - api.ts（roles 表 API 函數）
echo      - src/App.tsx（角色管理功能更新）
echo.
pause
