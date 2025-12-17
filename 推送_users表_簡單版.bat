@echo off
chcp 65001 >nul
echo ========================================
echo 推送 users 表遷移文件（簡單版）
echo ========================================
echo.

cd /d "%~dp0"

echo 強制添加所有 Supabase 遷移文件...
git add -f supabase/migrations/*.sql
git add -f supabase/config.toml
if exist "supabase\seed.sql" (
    git add -f supabase/seed.sql
)

echo.
echo 提交變更...
git commit -m "修復 users 表結構：添加 level, mail, employee_id, headshot 欄位"

echo.
echo 推送到遠端...
git push

echo.
echo 完成！
pause
