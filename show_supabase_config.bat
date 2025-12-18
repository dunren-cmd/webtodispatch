@echo off
chcp 65001 >nul
echo ====================================
echo   前端 Supabase 連接設定
echo ====================================
echo.

cd /d "%~dp0"

echo [前端設定檔：api.ts]
echo.
findstr /n "SUPABASE_URL SUPABASE_ANON_KEY" api.ts 2>nul
if %errorlevel% neq 0 (
    echo 找不到 api.ts 檔案
) else (
    echo.
    echo ----------------------------------------
    echo.
    echo 詳細設定：
    echo.
    
    REM 提取 SUPABASE_URL
    for /f "tokens=*" %%i in ('findstr "SUPABASE_URL" api.ts ^| findstr /v "//" ^| findstr "="') do (
        set line=%%i
        echo %%i
    )
    
    REM 提取 SUPABASE_ANON_KEY（只顯示前後各10個字元）
    for /f "tokens=*" %%i in ('findstr "SUPABASE_ANON_KEY" api.ts ^| findstr /v "//" ^| findstr "="') do (
        set line=%%i
        echo %%i
    )
)

echo.
echo ====================================
echo [Google Apps Script 設定檔：Code.gs]
echo ====================================
echo.
findstr /n "SUPABASE_URL SUPABASE_ANON_KEY" Code.gs 2>nul
if %errorlevel% neq 0 (
    echo 找不到 Code.gs 檔案
) else (
    echo.
    echo ----------------------------------------
    echo.
    echo 詳細設定：
    echo.
    
    REM 提取 SUPABASE_URL
    for /f "tokens=*" %%i in ('findstr "SUPABASE_URL" Code.gs ^| findstr /v "//" ^| findstr "="') do (
        echo %%i
    )
    
    REM 提取 SUPABASE_ANON_KEY
    for /f "tokens=*" %%i in ('findstr "SUPABASE_ANON_KEY" Code.gs ^| findstr /v "//" ^| findstr "="') do (
        echo %%i
    )
)

echo.
echo ====================================
echo [Supabase 服務狀態]
echo ====================================
echo.
supabase status 2>nul
if %errorlevel% neq 0 (
    echo Supabase 服務未運行
    echo 執行 'supabase start' 來啟動服務
)

echo.
echo ====================================
echo [連接資訊摘要]
echo ====================================
echo.
echo 前端連接的 Supabase：
echo - URL: http://192.168.62.101:54321
echo - 類型: 本地 Supabase 服務
echo - API 端點: http://192.168.62.101:54321/rest/v1
echo.
echo 注意：
echo - 這是本地 Supabase 實例
echo - 確保 Supabase 服務正在運行（supabase start）
echo - 確保本機 IP 為 192.168.62.101 或更新為正確的 IP
echo.
pause
