@echo off
chcp 65001 >nul
echo ========================================
echo 推送所有變更到 Git（包含 Supabase roles 表）
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1/5] 檢查 Git 狀態...
git status --short
echo.
pause

echo [步驟 2/5] 添加所有變更的文件...
git add .
if errorlevel 1 (
    echo ❌ 添加失敗！
    pause
    exit /b 1
)
echo ✅ 所有文件已添加到暫存區
echo.

echo [步驟 3/5] 檢查暫存區狀態...
git status --short
echo.
pause

echo [步驟 4/5] 提交變更...
set /p commit_msg="請輸入提交訊息（直接按 Enter 使用預設訊息）: "
if "%commit_msg%"=="" (
    set commit_msg=更新：添加 roles 表與 users 表一對多關聯，支援 Webhook 設定，同步角色資料到 Supabase
)

git commit -m "%commit_msg%"
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

echo [步驟 5/5] 推送到遠端倉庫...
git push
if errorlevel 1 (
    echo ⚠️  推送失敗，請檢查：
    echo    1. 是否已設定遠端倉庫
    echo    2. 是否有推送權限
    echo    3. 網路連接是否正常
) else (
    echo ✅ 推送成功！
    echo.
    echo 已推送的變更包括：
    echo   ✅ src/App.tsx - 角色管理功能更新
    echo   ✅ api.ts - 新增 roles 表 API 函數
    echo   ✅ supabase/migrations/20251215000000_create_roles_table.sql - roles 表遷移文件
    echo   ✅ 所有相關的說明文件
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
pause
