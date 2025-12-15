# Supabase CLI 安裝腳本
# 執行方式：以系統管理員身分執行 PowerShell，然後執行此腳本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supabase CLI 安裝腳本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查是否以系統管理員身分執行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "警告: 請以系統管理員身分執行此腳本！" -ForegroundColor Yellow
    Write-Host "右鍵點擊 PowerShell，選擇「以系統管理員身分執行」" -ForegroundColor Yellow
    pause
    exit
}

# 方法 1：嘗試使用 winget
Write-Host "方法 1：嘗試使用 winget 安裝..." -ForegroundColor Green
try {
    $wingetResult = winget install --id=Supabase.CLI --silent --accept-package-agreements --accept-source-agreements 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "使用 winget 安裝成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "驗證安裝..." -ForegroundColor Cyan
        supabase --version
        exit 0
    } else {
        throw "winget failed"
    }
} catch {
    Write-Host "winget 安裝失敗，嘗試方法 2..." -ForegroundColor Yellow
}

# 方法 2：直接下載執行檔
Write-Host ""
Write-Host "方法 2：直接下載執行檔..." -ForegroundColor Green

# 建立安裝目錄
$installDir = "$env:ProgramFiles\Supabase"
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# 下載 Supabase CLI
$zipPath = "$env:TEMP\supabase_windows_amd64.zip"
$downloadUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.zip"

Write-Host "正在下載 Supabase CLI..." -ForegroundColor Cyan
try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "下載完成" -ForegroundColor Green
} catch {
    Write-Host "下載失敗: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "請手動下載：" -ForegroundColor Yellow
    Write-Host "1. 前往：https://github.com/supabase/cli/releases" -ForegroundColor Yellow
    Write-Host "2. 下載最新版本的 supabase_windows_amd64.zip" -ForegroundColor Yellow
    Write-Host "3. 解壓縮後將 supabase.exe 放到：$installDir" -ForegroundColor Yellow
    pause
    exit 1
}

# 解壓縮
Write-Host "正在解壓縮..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $zipPath -DestinationPath $installDir -Force
    Write-Host "解壓縮完成" -ForegroundColor Green
} catch {
    Write-Host "解壓縮失敗: $_" -ForegroundColor Red
    pause
    exit 1
}

# 將安裝目錄加入 PATH
Write-Host "正在設定環境變數..." -ForegroundColor Cyan
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$installDir*") {
    $newPath = "$currentPath;$installDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "已將 $installDir 加入系統 PATH" -ForegroundColor Green
} else {
    Write-Host "PATH 已包含安裝目錄" -ForegroundColor Green
}

# 清理暫存檔案
Remove-Item $zipPath -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "安裝完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "請重新開啟 PowerShell 視窗，然後執行以下命令驗證：" -ForegroundColor Yellow
Write-Host "  supabase --version" -ForegroundColor White
Write-Host ""
pause
