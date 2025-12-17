@echo off
chcp 65001 >nul
echo ========================================
echo 推送到 Git 倉庫
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 檢查 Git 狀態...
git status
echo.

echo [2/5] 添加所有變更的文件（包括 Supabase）...
git add .
echo.

echo [3/5] 檢查暫存區狀態...
git status
echo.

echo [4/5] 提交變更...
git commit -m "更新：添加員工管理新增/刪除功能，優化角色過濾器顯示，包含 Supabase 遷移文件"
echo.

echo [5/5] 推送到遠端倉庫...
git push
echo.

echo ========================================
echo 完成！
echo ========================================
pause
