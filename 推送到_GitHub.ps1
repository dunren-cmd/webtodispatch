# 任務交辦系統 - 推送到 GitHub 腳本
# 執行此腳本前，請確保已安裝 Git 並已設定 GitHub 帳號

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 任務交辦系統 - 推送到 GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 切換到專案目錄
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "📁 專案目錄：$projectPath" -ForegroundColor Green
Write-Host ""

# 步驟 1：檢查是否已初始化 Git
if (Test-Path ".git") {
    Write-Host "✅ Git 倉庫已初始化" -ForegroundColor Green
} else {
    Write-Host "📦 初始化 Git 倉庫..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Git 初始化失敗！請確認已安裝 Git" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Git 倉庫初始化完成" -ForegroundColor Green
}
Write-Host ""

# 步驟 2：檢查是否有未提交的變更
Write-Host "📋 檢查檔案狀態..." -ForegroundColor Yellow
git status --short
Write-Host ""

# 步驟 3：添加所有文件
Write-Host "➕ 添加所有文件到 Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 添加文件失敗！" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 文件已添加" -ForegroundColor Green
Write-Host ""

# 步驟 4：創建提交
Write-Host "💾 創建提交..." -ForegroundColor Yellow
$commitMessage = "初始提交：任務交辦系統"
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  提交失敗或沒有變更需要提交" -ForegroundColor Yellow
    Write-Host "   這可能是因為所有文件都已經提交過了" -ForegroundColor Yellow
} else {
    Write-Host "✅ 提交完成" -ForegroundColor Green
}
Write-Host ""

# 步驟 5：檢查是否已有遠端倉庫
Write-Host "🔍 檢查遠端倉庫..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ 已設定遠端倉庫：$remoteUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 推送到 GitHub..." -ForegroundColor Yellow
    git push -u origin main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  推送到 main 分支失敗，嘗試 master 分支..." -ForegroundColor Yellow
        git push -u origin master
    }
} else {
    Write-Host "⚠️  尚未設定遠端倉庫" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 請按照以下步驟設定 GitHub 倉庫：" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 前往 https://github.com 登入你的帳號" -ForegroundColor White
    Write-Host "2. 點擊右上角的「+」→「New repository」" -ForegroundColor White
    Write-Host "3. 輸入倉庫名稱（例如：WebToDispatch_2 或 task-dispatch-system）" -ForegroundColor White
    Write-Host "4. 選擇「Public」或「Private」" -ForegroundColor White
    Write-Host "5. 不要勾選「Initialize this repository with a README」" -ForegroundColor White
    Write-Host "6. 點擊「Create repository」" -ForegroundColor White
    Write-Host ""
    Write-Host "7. 複製 GitHub 提供的命令，或執行以下命令：" -ForegroundColor White
    Write-Host ""
    Write-Host "   git remote add origin https://github.com/你的用戶名/倉庫名稱.git" -ForegroundColor Cyan
    Write-Host "   git branch -M main" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   或如果使用 master 分支：" -ForegroundColor Yellow
    Write-Host "   git branch -M master" -ForegroundColor Cyan
    Write-Host "   git push -u origin master" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
