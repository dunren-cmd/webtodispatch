# 推送到 GitHub 指南

## 🚀 快速開始

### 方法 1：使用 PowerShell 腳本（推薦）

1. **執行腳本**
   ```powershell
   .\推送到_GitHub.ps1
   ```

2. **如果遇到執行政策錯誤**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\推送到_GitHub.ps1
   ```

### 方法 2：手動執行 Git 命令

#### 步驟 1：初始化 Git 倉庫

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
git init
```

#### 步驟 2：添加所有文件

```powershell
git add .
```

#### 步驟 3：創建初始提交

```powershell
git commit -m "初始提交：任務交辦系統"
```

#### 步驟 4：在 GitHub 上創建新倉庫

1. 前往 https://github.com 並登入
2. 點擊右上角的「+」→「New repository」
3. 輸入倉庫名稱（例如：`WebToDispatch_2` 或 `task-dispatch-system`）
4. 選擇「Public」或「Private」
5. **不要勾選**「Initialize this repository with a README」
6. 點擊「Create repository」

#### 步驟 5：連接並推送到 GitHub

GitHub 會顯示命令，執行以下命令：

```powershell
# 添加遠端倉庫（替換為你的 GitHub 用戶名和倉庫名稱）
git remote add origin https://github.com/你的用戶名/倉庫名稱.git

# 設定主分支為 main（或使用 master）
git branch -M main

# 推送到 GitHub
git push -u origin main
```

如果使用 `master` 分支：

```powershell
git branch -M master
git push -u origin master
```

## 📋 已排除的敏感文件

以下文件已透過 `.gitignore` 排除，不會被推送到 GitHub：

- `node_modules/` - 依賴套件
- `.env` 和 `.env.local` - 環境變數
- `dist/` - 建置輸出
- `*.log` - 日誌文件
- `service-account-key.json` - 服務帳號金鑰
- Supabase 本地配置檔案

## ⚠️ 重要提醒

### 1. API Keys 和敏感資訊

在推送前，請確認：

- ✅ `Code.gs` 中的 `SUPABASE_ANON_KEY` 是佔位符 `"YOUR_SUPABASE_ANON_KEY"`
- ✅ `api.ts` 中的 `SUPABASE_ANON_KEY` 如果是實際的 key，請考慮替換為佔位符

**注意**：`api.ts` 中目前有一個本地開發的 key：
```typescript
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
```

這是本地 Supabase 的 key，通常不敏感，但如果你擔心，可以替換為：
```typescript
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 從 supabase status 取得
```

### 2. 檢查要提交的文件

在提交前，可以查看將要提交的文件：

```powershell
git status
```

### 3. 如果已經有 GitHub 倉庫

如果專案已經連接到 GitHub 倉庫，直接推送即可：

```powershell
git push
```

## 🔧 疑難排解

### 問題 1：Git 未安裝

**錯誤訊息**：`'git' is not recognized`

**解決方案**：
1. 下載並安裝 Git：https://git-scm.com/download/win
2. 重新啟動 PowerShell

### 問題 2：執行政策錯誤

**錯誤訊息**：`cannot be loaded because running scripts is disabled`

**解決方案**：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 問題 3：認證失敗

**錯誤訊息**：`Authentication failed`

**解決方案**：
1. 使用 Personal Access Token（推薦）
   - 前往 GitHub → Settings → Developer settings → Personal access tokens
   - 生成新的 token
   - 使用 token 作為密碼

2. 或使用 GitHub CLI：
   ```powershell
   gh auth login
   ```

### 問題 4：分支名稱衝突

**錯誤訊息**：`refusing to merge unrelated histories`

**解決方案**：
```powershell
git pull origin main --allow-unrelated-histories
```

## 📝 後續更新

推送後，每次更新代碼：

```powershell
git add .
git commit -m "更新說明"
git push
```

## 🎯 完成檢查清單

- [ ] Git 已安裝
- [ ] 已初始化 Git 倉庫
- [ ] 已檢查敏感資訊（API Keys）
- [ ] 已在 GitHub 創建倉庫
- [ ] 已連接遠端倉庫
- [ ] 已成功推送代碼

## 📚 相關資源

- Git 官方文件：https://git-scm.com/doc
- GitHub 文件：https://docs.github.com
- GitHub CLI：https://cli.github.com
