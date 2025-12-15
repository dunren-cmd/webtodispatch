# 測試 Supabase API 連接

## ✅ 好消息

你看到的錯誤訊息：
```json
{"message":"no Route matched with those values"}
```

**這表示 Supabase API 已經成功啟動了！** 🎉

這個錯誤是正常的，因為 Supabase API 的根路徑（`http://localhost:54321`）沒有定義路由。

---

## 🔍 驗證 Supabase 狀態

### 步驟 1：查看 Supabase 狀態

在 PowerShell 中執行：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
supabase status
```

應該會顯示類似：

```
         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步驟 2：測試正確的 API 端點

Supabase REST API 使用以下格式：
```
http://localhost:54321/rest/v1/<table_name>
```

**測試查詢 users 表格：**

在瀏覽器中訪問：
```
http://localhost:54321/rest/v1/users
```

**注意：** 需要添加認證標頭才能訪問。正確的測試方式見下方。

---

## 🧪 正確的 API 測試方法

### 方法 1：使用 Supabase Studio（最簡單）

1. **開啟 Supabase Studio**
   - 從 `supabase status` 輸出中找到 Studio URL（通常是 `http://localhost:54323`）
   - 在瀏覽器中開啟這個網址

2. **查看表格**
   - 在左側選單點擊「Table Editor」
   - 應該會看到 `users` 和 `tasks` 表格
   - 可以查看、編輯、新增資料

### 方法 2：使用 PowerShell 測試 API

在 PowerShell 中執行：

```powershell
# 先取得 anon key（從 supabase status 輸出中複製）
$anonKey = "你的anon key"

# 測試查詢 users 表格
Invoke-RestMethod -Uri "http://localhost:54321/rest/v1/users" `
  -Headers @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
  }
```

應該會返回 `users` 表格的資料（可能是空陣列 `[]`，如果還沒有資料）。

### 方法 3：使用瀏覽器擴充功能

安裝瀏覽器擴充功能來測試 API：
- **REST Client**（VS Code 擴充功能）
- **Postman**（獨立應用程式）
- **Thunder Client**（VS Code 擴充功能）

**使用範例（在 Postman 或 REST Client 中）：**

```
GET http://localhost:54321/rest/v1/users
Headers:
  apikey: <你的anon key>
  Authorization: Bearer <你的anon key>
```

---

## 📋 常用 API 端點

### 查詢資料

```
GET http://localhost:54321/rest/v1/users
GET http://localhost:54321/rest/v1/tasks
```

### 新增資料

```
POST http://localhost:54321/rest/v1/users
Content-Type: application/json
Headers:
  apikey: <你的anon key>
  Authorization: Bearer <你的anon key>
  Prefer: return=representation

Body:
{
  "id": 1,
  "name": "測試用戶",
  "role": "admin",
  "avatar": "👤"
}
```

### 更新資料

```
PATCH http://localhost:54321/rest/v1/users?id=eq.1
Content-Type: application/json
Headers:
  apikey: <你的anon key>
  Authorization: Bearer <你的anon key>
  Prefer: return=representation

Body:
{
  "name": "更新後的姓名"
}
```

### 刪除資料

```
DELETE http://localhost:54321/rest/v1/users?id=eq.1
Headers:
  apikey: <你的anon key>
  Authorization: Bearer <你的anon key>
```

---

## ✅ 確認 Supabase 正常運作

### 檢查清單：

- [ ] `supabase status` 顯示所有服務運行中
- [ ] Studio URL（`http://localhost:54323`）可以在瀏覽器中開啟
- [ ] 在 Studio 中可以看到 `users` 和 `tasks` 表格
- [ ] API 端點可以正常回應（需要認證標頭）

---

## 🔧 如果 API 測試失敗

### 問題 1：401 Unauthorized

**原因：** 缺少或錯誤的 API Key

**解決方案：**
- 確認使用正確的 `anon key`（從 `supabase status` 取得）
- 確認標頭格式正確：
  ```
  apikey: <你的anon key>
  Authorization: Bearer <你的anon key>
  ```

### 問題 2：404 Not Found

**原因：** 表格不存在或路徑錯誤

**解決方案：**
- 確認表格名稱正確（`users` 或 `tasks`）
- 確認已執行遷移檔案建立表格
- 在 Studio 中檢查表格是否存在

### 問題 3：403 Forbidden

**原因：** RLS（Row Level Security）政策限制

**解決方案：**
- 檢查 `supabase_schema.sql` 中的 RLS 政策
- 確認政策允許你執行的操作

---

## 🎯 下一步：設定 Google Apps Script

現在 Supabase 已經正常運行，下一步是設定 Google Apps Script：

1. **複製連接資訊**
   - 從 `supabase status` 輸出中複製：
     - API URL：`http://localhost:54321`
     - anon key：很長的字串

2. **設定 Google Apps Script**
   - 開啟 Google Apps Script 專案
   - 進入「專案設定」→「指令碼屬性」
   - 新增：
     - `SUPABASE_URL` = `http://localhost:54321`
     - `SUPABASE_ANON_KEY` = `<你的anon key>`

3. **測試連接**
   - 執行 `testBasicSetup()` 函數
   - 查看執行記錄確認連接成功

---

## 💡 重要提醒

**Google Apps Script 無法直接連接 localhost！**

因為 Google Apps Script 運行在 Google 的伺服器上，無法訪問你電腦上的 `localhost:54321`。

**解決方案：**

需要使用隧道服務（如 ngrok）將本地 Supabase 暴露到網際網路：

1. **安裝並啟動 ngrok**
   ```powershell
   ngrok http 54321
   ```

2. **使用 ngrok 提供的 URL**
   - ngrok 會顯示一個公開 URL，例如：`https://abc123.ngrok.io`
   - 在 Google Apps Script 中使用這個 URL 而不是 `localhost:54321`

詳細步驟請參考：`本地端_Supabase_設定.md` 中的「方案 1：使用 ngrok 建立隧道」章節。

---

## 📚 參考資源

- Supabase REST API 文件：https://supabase.com/docs/reference/javascript/introduction
- PostgREST API 文件：https://postgrest.org/en/stable/api.html
- Supabase Studio 使用指南：https://supabase.com/docs/guides/database/tables
