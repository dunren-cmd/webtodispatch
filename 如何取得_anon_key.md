# 如何取得 anon key（Publishable key）

## 🎯 快速取得

### 步驟 1：開啟終端機

在專案目錄下開啟 PowerShell 或命令提示字元：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
```

### 步驟 2：執行 supabase status

```powershell
supabase status
```

### 步驟 3：在輸出中找到 Key

執行後，你會看到類似以下的輸出：

```
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**或者新版本格式：**

```
╭─────────────────────────────── ╮
│ 🔑 Authentication Keys                                        │
├────── ┬────────────────────────┤
│ Publishable │ sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH │
│ Secret      │ sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz      │
╰────── ┴────────────────────────╯
```

## 📋 你需要哪個 Key？

### 前端應用（api.ts）
- 使用 **anon key** 或 **Publishable key**
- 這是公開的 key，可以安全地在前端使用

### 後端（Code.gs）
- 使用 **anon key** 或 **Publishable key**
- 不要使用 service_role key 或 Secret key（除非你確定需要完整權限）

## 🔍 如何複製 Key

### 方法 1：手動複製
1. 在終端機輸出中找到 `anon key:` 或 `Publishable` 這一行
2. 複製後面的完整字串（很長的一串字元）
3. 貼上到你的配置文件中

### 方法 2：使用 PowerShell 自動提取

```powershell
# 執行 supabase status 並提取 anon key
$status = supabase status
$anonKey = ($status | Select-String -Pattern "anon key:\s+(.+)").Matches.Groups[1].Value
Write-Host "Anon Key: $anonKey"
```

## 📝 更新配置文件

### 1. 更新 api.ts

找到這一行：
```typescript
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
```

替換為你從 `supabase status` 取得的 key：
```typescript
const SUPABASE_ANON_KEY = '你的_anon_key_或_Publishable_key';
```

### 2. 更新 Code.gs

找到這一行：
```javascript
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

替換為：
```javascript
const SUPABASE_ANON_KEY = "你的_anon_key_或_Publishable_key";
```

### 3. 更新 Google Apps Script 指令碼屬性

1. 開啟 Google Apps Script 編輯器
2. 點擊「專案設定」（齒輪圖示）
3. 點擊「指令碼屬性」標籤
4. 新增或更新：
   - **屬性名稱**：`SUPABASE_ANON_KEY`
   - **屬性值**：貼上你的 anon key

## ⚠️ 重要提醒

1. **anon key 和 Publishable key 是同一種東西**
   - 舊版本 Supabase CLI 顯示為 `anon key`
   - 新版本顯示為 `Publishable key`
   - 兩者功能相同，都是公開的 key

2. **不要使用 Secret key 或 service_role key**
   - 這些 key 有完整權限，不應該在前端使用
   - 只在後端伺服器端使用（如果需要的話）

3. **Key 可能會改變**
   - 如果重新啟動 Supabase（`supabase stop` 然後 `supabase start`），key 可能會改變
   - 每次重啟後，記得重新執行 `supabase status` 取得新的 key

## 🎯 快速檢查

執行以下命令確認 Supabase 正在運行並取得 key：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
supabase status
```

如果 Supabase 沒有運行，先啟動它：

```powershell
supabase start
```

然後再執行 `supabase status` 取得 key。
