@echo off
chcp 65001 >nul
echo ========================================
echo 檢查並推送 Supabase 遷移文件
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1/5] 檢查 Supabase 遷移文件...
echo.
if exist "supabase\migrations" (
    echo ✅ 找到 migrations 目錄
    echo.
    echo 遷移文件列表：
    dir /b supabase\migrations\*.sql
    echo.
) else (
    echo ❌ 未找到 migrations 目錄！
    pause
    exit /b 1
)

echo [步驟 2/5] 檢查 users 表相關的遷移文件...
echo.
findstr /i /c:"users" /c:"CREATE TABLE" /c:"ALTER TABLE" supabase\migrations\*.sql >nul
if errorlevel 1 (
    echo ⚠️  警告：未找到 users 表相關的遷移文件
) else (
    echo ✅ 找到 users 表相關的遷移文件
    echo.
    echo 包含 users 的文件：
    findstr /i /c:"users" supabase\migrations\*.sql | findstr /i /c:".sql"
)
echo.

echo [步驟 3/5] 檢查 Git 狀態...
git status --short supabase/
echo.

echo [步驟 4/5] 添加 Supabase 文件到 Git...
git add supabase/
if errorlevel 1 (
    echo ❌ 添加失敗！
    pause
    exit /b 1
)
echo ✅ Supabase 文件已添加
echo.

echo [步驟 5/5] 檢查暫存區中的 Supabase 文件...
git ls-files supabase/ | findstr /v ".branches .temp .env"
echo.

echo ========================================
echo 檢查完成！
echo ========================================
echo.
echo 下一步：
echo   1. 執行 git commit -m "修復 users 表結構，添加所有必要欄位"
echo   2. 執行 git push
echo.
echo 或者執行「快速推送.bat」來自動完成所有步驟
echo.
pause
