@echo off
chcp 65001 >nul
echo ========================================
echo 檢查 users 表遷移文件狀態
echo ========================================
echo.

cd /d "%~dp0"

echo [1] 檢查遷移文件是否存在...
if exist "supabase\migrations\20251214000000_fix_users_table_structure.sql" (
    echo ✅ 找到修復文件
) else (
    echo ❌ 未找到修復文件
)
echo.

echo [2] 檢查文件是否在 Git 中...
git ls-files supabase/migrations/20251214000000_fix_users_table_structure.sql >nul 2>&1
if errorlevel 1 (
    echo ⚠️  文件尚未被 Git 追蹤
    echo.
    echo 解決方法：
    echo   git add supabase/migrations/20251214000000_fix_users_table_structure.sql
    echo   git commit -m "添加 users 表修復遷移文件"
    echo   git push
) else (
    echo ✅ 文件已在 Git 中
)
echo.

echo [3] 檢查所有 Supabase 遷移文件...
echo.
echo 已追蹤的遷移文件：
git ls-files supabase/migrations/*.sql
echo.

echo [4] 檢查未追蹤的文件...
echo.
git status --short supabase/
echo.

echo [5] 檢查 .gitignore 設定...
echo.
findstr /i "migrations" .gitignore >nul 2>&1
if errorlevel 1 (
    echo ✅ migrations 目錄未被 .gitignore 排除
) else (
    echo ⚠️  migrations 目錄可能被 .gitignore 排除
    echo.
    echo 檢查 .gitignore 內容：
    findstr /i "migrations" .gitignore
)
echo.

echo ========================================
echo 檢查完成
echo ========================================
echo.
pause
