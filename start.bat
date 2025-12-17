@echo off
chcp 65001 >nul
echo ========================================
echo 快速啟動任務交辦系統
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 檢查環境變數...
if not exist ".env" (
    echo ⚠️  未找到 .env 文件，從範本創建...
    copy .env.example .env
    echo.
    echo ✅ 已創建 .env 文件
    echo.
    echo 📝 請編輯 .env 文件，設定你的 Supabase 配置：
    echo    - VITE_SUPABASE_URL
    echo    - VITE_SUPABASE_ANON_KEY
    echo.
    echo 然後重新執行此腳本
    echo.
    pause
    exit /b 1
)
echo ✅ .env 文件存在
echo.

echo [2/5] 檢查 Supabase 是否運行...
supabase status >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Supabase 可能未啟動
    echo.
    echo 請執行：supabase start
    echo.
    set /p start_supabase="是否現在啟動 Supabase？(Y/N): "
    if /i "%start_supabase%"=="Y" (
        echo 啟動 Supabase...
        supabase start
    )
) else (
    echo ✅ Supabase 正在運行
)
echo.

echo [3/5] 檢查資料庫遷移...
echo 請確認已執行所有遷移文件
echo 如果尚未執行，請執行：supabase migration up
echo.
pause

echo [4/5] 安裝依賴...
if not exist "node_modules" (
    echo 正在安裝依賴...
    call npm install
    if errorlevel 1 (
        echo ❌ 安裝失敗！
        pause
        exit /b 1
    )
    echo ✅ 依賴安裝完成
) else (
    echo ✅ node_modules 已存在，跳過安裝
)
echo.

echo [5/5] 啟動應用...
echo.
echo 應用將在 http://localhost:3050 啟動
echo 按 Ctrl+C 停止
echo.
call npm run dev
