@echo off
chcp 65001 >nul
echo ========================================
echo 推送到 Git 倉庫（包含 Supabase）
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1/6] 檢查 Git 狀態...
git status
echo.
pause

echo [步驟 2/6] 檢查 Supabase 文件...
if exist "supabase\migrations" (
    echo ✅ 找到 Supabase migrations 目錄
    dir /b supabase\migrations\*.sql
) else (
    echo ⚠️  未找到 Supabase migrations 目錄
)
echo.

if exist "supabase\config.toml" (
    echo ✅ 找到 Supabase config.toml
) else (
    echo ⚠️  未找到 Supabase config.toml
)
echo.
pause

echo [步驟 3/6] 添加所有變更的文件（包括 Supabase）...
git add .
echo ✅ 文件已添加到暫存區
echo.

echo [步驟 4/6] 檢查暫存區狀態...
git status --short
echo.
pause

echo [步驟 5/6] 提交變更...
set /p commit_msg="請輸入提交訊息（直接按 Enter 使用預設訊息）: "
if "%commit_msg%"=="" (
    set commit_msg=更新：添加員工管理新增/刪除功能，優化角色過濾器顯示，包含 Supabase 遷移文件
)
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ⚠️  提交失敗或沒有變更需要提交
    echo    這可能是因為所有文件都已經提交過了
) else (
    echo ✅ 提交完成
)
echo.

echo [步驟 6/6] 推送到遠端倉庫...
echo 檢查遠端倉庫設定...
git remote -v
echo.

git push
if errorlevel 1 (
    echo ⚠️  推送失敗，請檢查：
    echo    1. 是否已設定遠端倉庫（git remote add origin ...）
    echo    2. 是否有推送權限
    echo    3. 網路連接是否正常
) else (
    echo ✅ 推送成功！
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
echo 已推送的 Supabase 文件包括：
echo   - supabase/config.toml
echo   - supabase/migrations/*.sql
echo   - supabase/seed.sql（如果存在）
echo.
pause
