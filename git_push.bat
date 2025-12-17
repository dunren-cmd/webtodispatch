@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 推送到 Git
echo ========================================
echo.

echo [1/4] 檢查 Git 狀態...
git status --short
echo.

echo [2/4] 添加所有變更...
git add .
if errorlevel 1 (
    echo 錯誤：添加檔案失敗
    pause
    exit /b 1
)
echo 完成
echo.

echo [3/4] 提交變更...
git commit -m "更新：新增 Supabase migration - 將 level 5 改為 level 4"
if errorlevel 1 (
    echo 警告：提交失敗或沒有變更需要提交
    echo 這可能是因為所有檔案都已經提交過了
) else (
    echo 完成
)
echo.

echo [4/4] 推送到遠端倉庫...
git push origin main
if errorlevel 1 (
    echo 錯誤：推送失敗
    echo 請檢查網路連線和認證設定
    pause
    exit /b 1
) else (
    echo 完成
)
echo.

echo ========================================
echo 完成！已成功推送到 GitHub
echo ========================================
pause
