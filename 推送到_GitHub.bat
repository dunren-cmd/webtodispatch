@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 任務交辦系統 - 推送到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo 📁 專案目錄：%CD%
echo.

REM 檢查是否已初始化 Git
if exist ".git" (
    echo ✅ Git 倉庫已初始化
) else (
    echo 📦 初始化 Git 倉庫...
    git init
    if errorlevel 1 (
        echo ❌ Git 初始化失敗！請確認已安裝 Git
        pause
        exit /b 1
    )
    echo ✅ Git 倉庫初始化完成
)
echo.

echo 📋 檢查檔案狀態...
git status --short
echo.

echo ➕ 添加所有文件到 Git...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失敗！
    pause
    exit /b 1
)
echo ✅ 文件已添加
echo.

echo 💾 創建提交...
git commit -m "初始提交：任務交辦系統"
if errorlevel 1 (
    echo ⚠️  提交失敗或沒有變更需要提交
    echo    這可能是因為所有文件都已經提交過了
) else (
    echo ✅ 提交完成
)
echo.

echo 🔍 檢查遠端倉庫...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  尚未設定遠端倉庫
    echo.
    echo 📝 請按照以下步驟設定 GitHub 倉庫：
    echo.
    echo 1. 前往 https://github.com 登入你的帳號
    echo 2. 點擊右上角的「+」→「New repository」
    echo 3. 輸入倉庫名稱（例如：WebToDispatch_2）
    echo 4. 選擇「Public」或「Private」
    echo 5. 不要勾選「Initialize this repository with a README」
    echo 6. 點擊「Create repository」
    echo.
    echo 7. 執行以下命令：
    echo.
    echo    git remote add origin https://github.com/你的用戶名/倉庫名稱.git
    echo    git branch -M main
    echo    git push -u origin main
    echo.
) else (
    echo ✅ 已設定遠端倉庫
    echo.
    echo 📤 推送到 GitHub...
    git push -u origin main
    if errorlevel 1 (
        echo ⚠️  推送到 main 分支失敗，嘗試 master 分支...
        git push -u origin master
    )
)

echo.
echo ========================================
echo ✅ 完成！
echo ========================================
echo.
pause
