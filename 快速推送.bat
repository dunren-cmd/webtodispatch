@echo off
chcp 65001 >nul
echo ========================================
echo 快速推送到 Git（包含所有變更和 Supabase）
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 添加所有文件到暫存區...
git add .
echo ✅ 已完成
echo.

echo [2/4] 檢查暫存區狀態...
git status --short
echo.

echo [3/4] 提交變更...
git commit -m "更新：添加 roles 表與 users 表一對多關聯，支援 Webhook 設定，同步角色資料到 Supabase，包含所有 Supabase 遷移文件"
if errorlevel 1 (
    echo ⚠️  提交失敗或沒有變更需要提交
) else (
    echo ✅ 提交成功
)
echo.

echo [4/4] 推送到遠端倉庫...
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
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
echo 已推送的文件包括：
echo   ✅ api.ts - 新增 roles 表 API 函數（getRolesFromSupabase, saveRoleToSupabase, updateRoleInSupabase）
echo   ✅ src/App.tsx - 角色管理功能更新，支援 Webhook，同步到 Supabase
echo   ✅ supabase/migrations/20251215000000_create_roles_table.sql - roles 表遷移文件
echo   ✅ supabase/migrations/20251214000000_fix_users_table_structure.sql - users 表結構修復
echo   ✅ supabase/seed.sql
echo   ✅ supabase/config.toml
echo   ✅ 所有相關的說明文件
echo.
pause
