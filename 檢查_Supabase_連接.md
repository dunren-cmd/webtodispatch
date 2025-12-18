# 檢查 Supabase 連接指南

## 🔍 問題說明

你輸入 `http://192.168.62.101:3050/` 看到的是**前端應用**，不是 Supabase API。

- **端口 3050**：前端開發服務器（Vite）
- **端口 54321**：Supabase API 服務（資料庫 API）

## ✅ 檢查 Supabase 狀態

### 步驟 1：確認 Supabase 是否正在運行

在專案目錄下執行：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
supabase status
```

如果 Supabase 正在運行，你會看到類似以下的輸出：

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步驟 2：如果 Supabase 沒有運行

執行以下命令啟動 Supabase：

```powershell
supabase start
```

這會啟動所有 Supabase 服務，包括：
- API 服務（端口 54321）
- 資料庫（端口 54322）
- Studio（端口 54323）

### 步驟 3：確認網路訪問

如果 Supabase 運行在 `127.0.0.1`（localhost），只能從本機訪問。

要讓其他設備訪問（使用 `192.168.68.75`），需要：

1. **確認 Supabase 綁定到所有網路介面**
   - 檢查 `supabase/config.toml` 中的配置
   - 確認 API 服務可以從網路訪問

2. **或者使用本機 IP 訪問**
   - 如果 Supabase 只綁定到 `127.0.0.1`，只能使用 `http://localhost:54321`
   - 如果綁定到 `0.0.0.0`，可以使用 `http://192.168.62.101:54321`

## 🔧 測試 Supabase API 連接

### 方法 1：使用瀏覽器測試

訪問以下 URL（需要先設定 API Key）：

```
http://192.168.62.101:54321/rest/v1/users
```

或使用本機：

```
http://localhost:54321/rest/v1/users
```

### 方法 2：使用 PowerShell 測試

```powershell
# 先從 supabase status 取得 anon key
$anonKey = "你的_anon_key"

# 測試連接
Invoke-RestMethod -Uri "http://192.168.62.101:54321/rest/v1/users" `
  -Headers @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
  }
```

### 方法 3：檢查 Supabase Studio

訪問 Supabase Studio（通常在端口 54323）：

```
http://localhost:54323
```

或

```
http://192.168.62.101:54323
```

在 Studio 中你可以：
- 查看資料庫表格
- 查看資料
- 執行 SQL 查詢

## 📝 更新配置

已更新的檔案：

1. **`Code.gs`**：`SUPABASE_URL = "http://192.168.62.101:54321"`
2. **`api.ts`**：`SUPABASE_URL = 'http://192.168.62.101:54321'`

## ⚠️ 重要提醒

1. **確認 Supabase 正在運行**
   - 執行 `supabase status` 確認所有服務運行中

2. **取得正確的 API Key**
   - 從 `supabase status` 輸出中複製 `anon key` 或 `Publishable key`
   - 更新 `Code.gs` 和 `api.ts` 中的 `SUPABASE_ANON_KEY`

3. **網路訪問問題**
   - 如果 `192.168.62.101:54321` 無法訪問，嘗試使用 `localhost:54321`
   - 確認防火牆允許端口 54321

4. **Google Apps Script 連接**
   - Google Apps Script 無法訪問 `localhost` 或本地 IP
   - 需要使用 ngrok 或其他隧道服務將本地 Supabase 暴露到網際網路

## 🎯 下一步

1. 執行 `supabase status` 確認 Supabase 運行中
2. 從輸出中複製 `anon key` 或 `Publishable key`
3. 更新 `Code.gs` 和 `api.ts` 中的 `SUPABASE_ANON_KEY`
4. 測試 API 連接
