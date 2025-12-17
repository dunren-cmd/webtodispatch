@echo off
chcp 65001 >nul
echo ====================================
echo   Supabase 資料庫重置
echo ====================================
echo.

cd /d "%~dp0"

echo 正在檢查 Supabase 服務狀態...
echo.

supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] Supabase 服務未啟動
    echo 正在啟動 Supabase 服務...
    echo.
    supabase start
    if %errorlevel% neq 0 (
        echo.
        echo [錯誤] 無法啟動 Supabase 服務
        echo 請確認 Docker Desktop 是否正在運行
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Supabase 服務已啟動
    echo.
    timeout /t 3 >nul
) else (
    echo Supabase 服務運行中
    echo.
)

echo 正在執行資料庫重置...
echo.

supabase db reset

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo 資料庫重置成功！
    echo ====================================
) else (
    echo.
    echo ====================================
    echo 資料庫重置失敗！
    echo 請檢查上方的錯誤訊息
    echo ====================================
)

echo.
pause
