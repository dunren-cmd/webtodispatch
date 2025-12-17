@echo off
chcp 65001 >nul
echo ========================================
echo 推送 users 表遷移文件（修正版）
echo ========================================
echo.

cd /d "%~dp0"

echo [步驟 1/5] 檢查當前 Git 狀態...
git status --short
echo.

echo [步驟 2/5] 添加所有 Supabase 遷移文件...
git add supabase/migrations/*.sql
if errorlevel 1 (
    echo ⚠️  使用 -f 強制添加...
    git add -f supabase/migrations/*.sql
)
echo ✅ 遷移文件已添加
echo.

echo [步驟 3/5] 添加 Supabase 配置文件...
git add supabase/config.toml
if exist "supabase\seed.sql" (
    git add supabase/seed.sql
    echo ✅ seed.sql 已添加
)
echo ✅ 配置文件已添加
echo.

echo [步驟 4/5] 檢查暫存區狀態...
git status --short supabase/
echo.

echo [步驟 5/5] 提交並推送...
echo.
echo 檢查是否有變更需要提交...
git diff --cached --quiet
if errorlevel 1 (
    echo ✅ 有變更需要提交
    echo.
    git commit -m "修復 users 表結構：添加 level, mail, employee_id, headshot 欄位，移除 avatar 欄位"
    if errorlevel 1 (
        echo ❌ 提交失敗！
        pause
        exit /b 1
    )
    echo ✅ 提交成功
    echo.
    echo 推送到遠端...
    git push
    if errorlevel 1 (
        echo ❌ 推送失敗！
    ) else (
        echo ✅ 推送成功！
    )
) else (
    echo ⚠️  沒有變更需要提交
    echo.
    echo 可能的原因：
    echo   1. 所有文件都已經在 Git 中且沒有變更
    echo   2. 文件已被 .gitignore 排除
    echo.
    echo 檢查未追蹤的文件：
    git status --short
    echo.
    echo 如果需要添加未追蹤的文件（如 .bat 文件），請執行：
    echo   git add 文件名
    echo   git commit -m "添加腳本文件"
    echo   git push
)
echo.

echo ========================================
echo 完成！
echo ========================================
echo.
pause
