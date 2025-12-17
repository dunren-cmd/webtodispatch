# Git 推送說明

## 快速推送（包含 Supabase）

### 方法 1：使用批處理文件（推薦）

1. 雙擊執行 `推送所有變更.bat`
2. 按照提示操作
3. 輸入提交訊息（或直接按 Enter 使用預設訊息）

### 方法 2：手動執行命令

```bash
# 1. 檢查狀態
git status

# 2. 添加所有文件（包括 Supabase）
git add .

# 3. 提交變更
git commit -m "更新：添加員工管理新增/刪除功能，優化角色過濾器顯示，包含 Supabase 遷移文件"

# 4. 推送到遠端
git push
```

## 包含的 Supabase 文件

根據 `.gitignore` 設定，以下 Supabase 文件會被推送到 Git：

✅ **會被包含：**
- `supabase/config.toml` - Supabase 配置
- `supabase/migrations/*.sql` - 所有資料庫遷移文件
- `supabase/seed.sql` - 種子資料（如果存在）

❌ **不會被包含（已忽略）：**
- `supabase/.branches` - 本地分支資訊
- `supabase/.temp` - 臨時文件
- `supabase/.env.local` - 本地環境變數

## 檢查 Supabase 文件是否被包含

執行以下命令檢查：

```bash
git status --short | findstr supabase
```

或者查看暫存區：

```bash
git ls-files | findstr supabase
```

## 如果尚未設定遠端倉庫

如果這是第一次推送，需要先設定遠端倉庫：

```bash
# 1. 添加遠端倉庫（替換為你的 GitHub 倉庫 URL）
git remote add origin https://github.com/你的用戶名/倉庫名稱.git

# 2. 設定主分支名稱
git branch -M main

# 3. 首次推送
git push -u origin main
```

## 注意事項

1. **API Keys**: 確保 `Code.gs` 和 `api.ts` 中的敏感資訊已處理（使用環境變數或佔位符）
2. **環境變數**: `.env` 文件不會被推送（已在 `.gitignore` 中）
3. **本地配置**: `supabase/.env.local` 不會被推送

## 驗證推送結果

推送完成後，可以在 GitHub 上檢查：

1. 前往你的 GitHub 倉庫
2. 檢查 `supabase/` 目錄是否存在
3. 確認 `supabase/migrations/` 中有所有遷移文件
4. 確認 `supabase/config.toml` 存在
