@echo off
chcp 65001 >nul
echo ========================================
echo 完整推送 users 表遷移文件到 Git
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1/6] 檢查 users 相關的遷移文件...
echo.
if exist "supabase\migrations\20251214000000_fix_users_table_structure.sql" (
    echo ✅ 找到修復 users 表的遷移文件
) else (
    echo ⚠️  未找到 20251214000000_fix_users_table_structure.sql
)
echo.

echo 包含 users 的遷移文件列表：
dir /b supabase\migrations\*.sql | findstr /i "users init merge change update fix"
echo.

echo [步驟 2/6] 檢查文件是否在 Git 中...
git ls-files supabase/migrations/20251214000000_fix_users_table_structure.sql >nul 2>&1
if errorlevel 1 (
    echo ⚠️  文件尚未被 Git 追蹤，需要添加
) else (
    echo ✅ 文件已在 Git 中
)
echo.

echo [步驟 3/6] 強制添加所有 Supabase 遷移文件...
git add -f supabase/migrations/*.sql
if errorlevel 1 (
    echo ❌ 添加失敗！
    pause
    exit /b 1
)
echo ✅ 所有遷移文件已強制添加到暫存區
echo.

echo [步驟 4/6] 添加 Supabase 配置文件...
git add -f supabase/config.toml
if exist "supabase\seed.sql" (
    git add -f supabase/seed.sql
    echo ✅ 已添加 seed.sql
)
echo ✅ Supabase 配置文件已添加
echo.

echo [步驟 5/6] 檢查暫存區狀態...
git status --short supabase/
echo.

echo [步驟 6/6] 提交並推送...
echo.
set /p commit_msg="請輸入提交訊息（直接按 Enter 使用預設訊息）: "
if "%commit_msg%"=="" (
    set commit_msg=修復 users 表結構：添加 level, mail, employee_id, headshot 欄位，移除 avatar 欄位
)

git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ⚠️  提交失敗或沒有變更需要提交
    echo.
    echo 檢查是否有未追蹤的文件...
    git status --short
    echo.
    echo 如果看到未追蹤的文件，請手動添加：
    echo   git add 文件名
    echo   git commit -m "提交訊息"
    echo.
    pause
    exit /b 1
) else (
    echo ✅ 提交成功
)
echo.

echo 推送到遠端倉庫...
git push
if errorlevel 1 (
    echo ⚠️  推送失敗，請檢查：
    echo    1. 是否已設定遠端倉庫
    echo    2. 是否有推送權限
    echo    3. 網路連接是否正常
    echo.
    echo 如果是第一次推送，請先執行：
    echo   git remote add origin https://github.com/你的用戶名/倉庫名稱.git
    echo   git branch -M main
    echo   git push -u origin main
) else (
    echo ✅ 推送成功！
    echo.
    echo users 表的遷移文件已成功推送到 Git！
    echo.
    echo 已推送的文件包括：
    echo   ✅ supabase/migrations/20251212134638_init.sql
    echo   ✅ supabase/migrations/20251212170000_merge_personnel_to_users.sql
    echo   ✅ supabase/migrations/20251213000000_change_avatar_to_level.sql
    echo   ✅ supabase/migrations/20251213120000_update_level5_to_level4.sql
    echo   ✅ supabase/migrations/20251214000000_fix_users_table_structure.sql
    echo   ✅ supabase/config.toml
    if exist "supabase\seed.sql" (
        echo   ✅ supabase/seed.sql
    )
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
pause
