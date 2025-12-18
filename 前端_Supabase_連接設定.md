# 前端 Supabase 連接設定

## 📋 當前連接設定

### 前端設定檔：`api.ts`

**Supabase URL：**
```typescript
const SUPABASE_URL = 'http://192.168.62.101:54321';
```

**Supabase API Key（Publishable Key）：**
```typescript
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
```

**API 基礎 URL：**
```typescript
const API_BASE_URL = `${SUPABASE_URL}/rest/v1`;
// 實際值：http://192.168.62.101:54321/rest/v1
```

---

### Google Apps Script 設定檔：`Code.gs`

**Supabase URL：**
```javascript
const SUPABASE_URL = "http://192.168.62.101:54321";
```

**Supabase API Key：**
```javascript
const SUPABASE_ANON_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
```

---

## 🔍 連接資訊分析

### 連接類型
- **類型**：本地 Supabase 服務（Local Development）
- **IP 地址**：`192.168.68.75`
- **端口**：`54321`（Supabase API 端口）

### 完整連接資訊
- **API URL**：`http://192.168.62.101:54321`
- **REST API 端點**：`http://192.168.62.101:54321/rest/v1`
- **GraphQL 端點**：`http://192.168.62.101:54321/graphql/v1`
- **Studio URL**：`http://192.168.62.101:54323`（通常）

---

## ⚠️ 重要注意事項

### 1. IP 地址
- 當前使用的是固定 IP：`192.168.68.75`
- 如果您的電腦 IP 地址改變，需要更新 `api.ts` 和 `Code.gs` 中的 URL
- 可以執行 `ipconfig` 查看當前 IP 地址

### 2. 服務運行狀態
- 必須先啟動 Supabase 服務才能連接
- 執行 `supabase start` 啟動服務
- 執行 `supabase status` 查看服務狀態

### 3. 網路連接
- 前端必須能夠訪問 `192.168.62.101:54321`
- 如果前端運行在不同的設備上，確保網路連接正常
- 本地開發可以使用 `localhost` 或 `127.0.0.1`

---

## 🔄 如何更新連接設定

### 方法 1：更新 IP 地址

如果您的 IP 地址改變了：

1. **查看當前 IP 地址**
   ```powershell
   ipconfig
   ```
   找到 IPv4 地址（例如：192.168.68.100）

2. **更新 `api.ts`**
   ```typescript
   const SUPABASE_URL = 'http://192.168.68.100:54321'; // 更新為新 IP
   ```

3. **更新 `Code.gs`**
   ```javascript
   const SUPABASE_URL = "http://192.168.68.100:54321"; // 更新為新 IP
   ```

### 方法 2：使用 localhost（僅本地開發）

如果前端和 Supabase 運行在同一台電腦：

1. **更新 `api.ts`**
   ```typescript
   const SUPABASE_URL = 'http://localhost:54321';
   ```

2. **更新 `Code.gs`**
   ```javascript
   const SUPABASE_URL = "http://localhost:54321";
   ```

### 方法 3：使用 127.0.0.1

與 localhost 相同，但更明確：

1. **更新 `api.ts`**
   ```typescript
   const SUPABASE_URL = 'http://127.0.0.1:54321';
   ```

2. **更新 `Code.gs`**
   ```javascript
   const SUPABASE_URL = "http://127.0.0.1:54321";
   ```

---

## 🔑 API Key 管理

### 當前使用的 Key
- **類型**：Publishable Key（公開金鑰）
- **前綴**：`sb_publishable_`（Supabase CLI 新版本格式）
- **用途**：用於前端 API 請求

### 如何取得新的 Key

1. **執行 Supabase 狀態命令**
   ```powershell
   supabase status
   ```

2. **查找 Publishable Key**
   輸出中會顯示：
   ```
   API URL: http://localhost:54321
   Publishable key: sb_publishable_xxxxxxxxxxxxx
   ```

3. **更新設定檔**
   - 更新 `api.ts` 中的 `SUPABASE_ANON_KEY`
   - 更新 `Code.gs` 中的 `SUPABASE_ANON_KEY`

### 在瀏覽器中動態設定（可選）

前端也可以從 localStorage 讀取 key：

```typescript
// 在瀏覽器 Console 中執行
localStorage.setItem('supabase_anon_key', 'sb_publishable_xxxxxxxxxxxxx');
```

---

## 🧪 測試連接

### 測試 Supabase 服務

1. **檢查服務狀態**
   ```powershell
   supabase status
   ```

2. **測試 API 連接**
   在瀏覽器中訪問：
   ```
   http://192.168.62.101:54321/rest/v1/
   ```
   應該會看到 PostgREST API 資訊

3. **測試前端連接**
   - 開啟瀏覽器開發者工具（F12）
   - 查看 Network 標籤
   - 檢查 API 請求是否成功

---

## 📝 檢查清單

- [ ] Supabase 服務正在運行（`supabase status`）
- [ ] IP 地址正確（`192.168.68.75` 或當前 IP）
- [ ] API Key 是最新的（從 `supabase status` 取得）
- [ ] 前端可以訪問 Supabase URL
- [ ] `api.ts` 和 `Code.gs` 設定一致

---

## 💡 建議

1. **使用環境變數**：考慮將敏感資訊移到環境變數或配置檔案
2. **定期檢查 IP**：如果 IP 經常變動，考慮使用 localhost
3. **備份設定**：記錄當前的連接設定，方便恢復
4. **測試連接**：定期測試連接是否正常

---

## 🔗 相關文件

- `檢查_Supabase_連接.md` - 連接檢查指南
- `設定_Supabase_API_Key.md` - API Key 設定說明
- `啟動_Supabase_步驟.md` - 啟動 Supabase 服務
- `本地端_Supabase_設定.md` - 本地 Supabase 完整設定
