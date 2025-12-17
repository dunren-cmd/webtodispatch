@echo off
chcp 65001 >nul
echo ====================================
echo   Supabase 資料庫快速恢復
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

echo [說明] 此腳本將執行資料庫遷移來重建資料庫結構
echo 如果您有資料備份，請使用 db_restore.bat
echo.
set /p confirm="確定要繼續嗎？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消操作
    echo.
    pause
    exit /b 0
)

echo.
echo 正在重置並重建資料庫（僅結構，不含資料）...
echo.

supabase db reset

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo 資料庫結構恢復成功！
    echo 注意：這只恢復了資料庫結構，資料需另行匯入
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
