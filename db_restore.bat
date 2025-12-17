@echo off
chcp 65001 >nul
echo ====================================
echo   Supabase 資料庫恢復
echo ====================================
echo.

cd /d "%~dp0"

REM 檢查備份資料夾是否存在
if not exist "backups" (
    echo [錯誤] 找不到備份資料夾
    echo 請先執行備份腳本建立備份
    echo.
    pause
    exit /b 1
)

REM 列出可用的備份檔案
echo 可用的備份檔案：
echo.
dir /b /o-d backups\*.sql backups\*.dump 2>nul | findstr /v "^$"
if %errorlevel% neq 0 (
    echo [錯誤] 找不到備份檔案
    echo 請先執行備份腳本建立備份
    echo.
    pause
    exit /b 1
)

echo.
set /p backup_file="請輸入要恢復的備份檔案名稱（不含路徑，或按 Enter 使用最新的）: "

REM 如果使用者直接按 Enter，使用最新的檔案
if "%backup_file%"=="" (
    for /f "delims=" %%i in ('dir /b /o-d backups\*.sql backups\*.dump 2^>nul') do set backup_file=%%i & goto :found
    :found
    if "%backup_file%"=="" (
        echo [錯誤] 找不到備份檔案
        echo.
        pause
        exit /b 1
    )
    echo 使用最新備份：%backup_file%
)

REM 檢查檔案是否存在
if not exist "backups\%backup_file%" (
    echo [錯誤] 找不到檔案：backups\%backup_file%
    echo.
    pause
    exit /b 1
)

set full_path=%~dp0backups\%backup_file%

echo.
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

echo [警告] 恢復資料庫將覆蓋現有資料！
echo 備份檔案：%backup_file%
echo.
set /p confirm="確定要繼續嗎？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消恢復操作
    echo.
    pause
    exit /b 0
)

echo.
echo 正在恢復資料庫...
echo.

REM 使用 Docker 執行 psql 來恢復
docker exec -i supabase_db_WebToDispatch_2 psql -U postgres postgres < "%full_path%" 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo 資料庫恢復成功！
    echo ====================================
) else (
    echo.
    echo [錯誤] 恢復失敗
    echo.
    echo 請嘗試手動恢復：
    echo docker exec -i supabase_db_WebToDispatch_2 psql -U postgres postgres ^< backups\%backup_file%
    echo.
    pause
    exit /b 1
)

echo.
pause
