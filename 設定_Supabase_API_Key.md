# 設定 Supabase API Key 指南

## 📋 為什麼需要設定 API Key？

前端應用程式需要 Supabase API Key（Publishable key）才能訪問 Supabase API。有兩種方式設定：

**注意：** Supabase CLI 新版本使用 "Publishable key" 而不是 "anon key"

---

## 方法 1：使用瀏覽器 Console 設定（推薦，最簡單）

### 步驟 1：取得 Supabase Publishable key

在 PowerShell 中執行：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
supabase status
```

從輸出中找到 **Publishable** key（例如：`sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`）

**注意：** Supabase CLI 新版本使用 "Publishable key" 而不是 "anon key"

### 步驟 2：在瀏覽器中設定

1. **啟動前端應用程式**
   ```powershell
   npm run dev
   ```

2. **開啟瀏覽器**
   - 訪問 `http://localhost:5173`

3. **開啟開發者工具**
   - 按 `F12` 或右鍵點擊頁面 →「檢查」
   - 點擊「Console」標籤

4. **執行設定命令**
   在 Console 中輸入並執行：
   ```javascript
   localStorage.setItem('supabase_anon_key', '你的Publishable key')
   ```
   
   例如（使用你從 supabase status 取得的實際 key）：
   ```javascript
   localStorage.setItem('supabase_anon_key', 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')
   ```
   
   **重要：** 使用 `supabase status` 輸出中的 **Publishable** key，不是 Secret key

5. **重新載入頁面**
   - 按 `F5` 或 `Ctrl+R` 重新載入
   - API Key 會自動從 localStorage 讀取

---

## 方法 2：直接編輯 api.ts（永久設定）

### 步驟 1：取得 Supabase Publishable key

```powershell
supabase status
```

從輸出中找到 **Publishable** key（例如：`sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`）

**注意：** 使用 Publishable key，不是 Secret key

### 步驟 2：編輯 api.ts

開啟 `api.ts` 檔案，找到第 7 行：

```typescript
const SUPABASE_ANON_KEY = ''; // 從 supabase status 取得 Publishable key，需要手動填入
```

改為：

```typescript
const SUPABASE_ANON_KEY = '你的Publishable key'; // 從 supabase status 取得
```

例如（使用你從 supabase status 取得的實際 key）：

```typescript
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
```

**重要：** 使用 Publishable key，不是 Secret key

### 步驟 3：重新啟動開發伺服器

```powershell
# 按 Ctrl+C 停止當前伺服器
npm run dev
```

---

## ✅ 驗證設定是否成功

### 方法 1：檢查 Console

1. 開啟瀏覽器開發者工具（F12）
2. 點擊「Console」標籤
3. 如果看到警告訊息，表示 API Key 未設定
4. 如果沒有警告，表示已成功設定

### 方法 2：測試 API 連接

在瀏覽器 Console 中執行：

```javascript
fetch('http://localhost:54321/rest/v1/users', {
  headers: {
    'apikey': localStorage.getItem('supabase_anon_key'),
    'Authorization': `Bearer ${localStorage.getItem('supabase_anon_key')}`
  }
})
.then(r => r.json())
.then(console.log)
```

如果返回資料（可能是空陣列 `[]`），表示連接成功！

---

## 🔄 更新 API Key

如果 Supabase 重新啟動，anon key 可能會改變。需要重新設定：

### 如果使用方法 1（localStorage）：

1. 執行 `supabase status` 取得新的 Publishable key
2. 在瀏覽器 Console 中執行：
   ```javascript
   localStorage.setItem('supabase_anon_key', '新的Publishable key')
   ```
3. 重新載入頁面

### 如果使用方法 2（api.ts）：

1. 執行 `supabase status` 取得新的 Publishable key
2. 編輯 `api.ts` 更新 `SUPABASE_ANON_KEY`
3. 重新啟動開發伺服器

---

## 💡 建議

**開發環境：** 使用方法 1（localStorage），方便快速測試

**生產環境：** 使用方法 2 或環境變數，更安全

---

## 🐛 常見問題

### 問題 1：API Key 設定後仍然無法連接

**檢查清單：**
- ✅ 確認 Supabase 正在運行（`supabase status`）
- ✅ 確認使用 **Publishable** key（不是 Secret key）
- ✅ 確認 API Key 正確（從 `supabase status` 的 Publishable 欄位複製）
- ✅ 確認沒有多餘的空格或換行
- ✅ 確認瀏覽器已重新載入頁面

### 問題 2：localStorage 被清除

**原因：** 清除瀏覽器快取或使用無痕模式會清除 localStorage

**解決方案：** 重新執行設定命令

### 問題 3：CORS 錯誤

**原因：** Supabase 的 CORS 設定問題

**解決方案：** 
- 確認 Supabase 正在運行
- 確認 API URL 正確（`http://localhost:54321`）
- 檢查瀏覽器 Console 的詳細錯誤訊息

---

## 📝 快速設定腳本

你也可以建立一個簡單的 HTML 頁面來設定：

```html
<!DOCTYPE html>
<html>
<head>
  <title>設定 Supabase API Key</title>
</head>
<body>
  <h1>設定 Supabase API Key</h1>
  <input type="text" id="apiKey" placeholder="貼上你的 Publishable key" style="width: 500px;">
  <button onclick="setKey()">設定</button>
  <script>
    function setKey() {
      const key = document.getElementById('apiKey').value;
      localStorage.setItem('supabase_anon_key', key);
      alert('API Key 已設定！請重新載入應用程式頁面。');
    }
  </script>
</body>
</html>
```

儲存為 `set-api-key.html`，在瀏覽器中開啟即可設定。
