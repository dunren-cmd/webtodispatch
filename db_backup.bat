@echo off
chcp 65001 >nul
echo ====================================
echo   Supabase 資料庫備份
echo ====================================
echo.

cd /d "%~dp0"

REM 建立備份資料夾
if not exist "backups" mkdir backups

REM 生成備份檔名（使用日期時間）
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do set mytime=%%a%%b
set mytime=%mytime: =0%
set backup_file=backups\supabase_backup_%mydate%_%mytime%.sql

echo 正在檢查 Supabase 服務狀態...
echo.

supabase status >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] Supabase 服務未啟動
    echo 請先執行 supabase start 啟動服務
    echo.
    pause
    exit /b 1
)

echo Supabase 服務運行中
echo.
echo 正在備份資料庫到: %backup_file%
echo.

REM 獲取資料庫容器名稱
for /f "tokens=*" %%i in ('supabase status --output json 2^>nul ^| findstr /i "DB"') do set db_info=%%i

REM 使用 Docker 執行 pg_dump（從 Supabase 容器內）
docker exec supabase_db_WebToDispatch_2 pg_dump -U postgres postgres > "%backup_file%" 2>nul

if %errorlevel% equ 0 (
    echo 備份成功！
    echo 備份檔案：%backup_file%
) else (
    echo [錯誤] 備份失敗
    echo.
    echo 嘗試使用替代方法...
    
    REM 替代方法：使用 supabase db dump（如果支援）
    supabase db dump -f "%backup_file%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo 備份成功（使用 Supabase CLI）！
    ) else (
        echo.
        echo 請嘗試手動備份：
        echo 1. 確認 Supabase 容器正在運行
        echo 2. 執行：docker exec supabase_db_WebToDispatch_2 pg_dump -U postgres postgres ^> backup.sql
        echo.
        pause
        exit /b 1
    )
)

REM 檢查檔案大小
for %%A in ("%backup_file%") do set size=%%~zA
if %size% equ 0 (
    echo [警告] 備份檔案大小為 0，可能備份失敗
    del "%backup_file%"
    pause
    exit /b 1
)

echo.
echo ====================================
echo 備份完成！
echo 備份檔案：%backup_file%
echo 檔案大小：%size% 位元組
echo ====================================
echo.
pause
