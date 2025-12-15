# Supabase Key 說明

## 🔑 Supabase CLI 新版本的 Key 格式

Supabase CLI 新版本改變了 key 的命名方式：

### 舊版本格式：
- `anon key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `service_role key`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 新版本格式：
- **Publishable key**: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- **Secret key**: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`

---

## ✅ 使用哪個 Key？

### 前端應用程式（api.ts）
使用 **Publishable key**（對應舊版本的 anon key）

### 後端/伺服器端（Code.gs）
使用 **Publishable key**（對應舊版本的 anon key）

**注意：** Secret key 有完整權限，不應該在前端使用！

---

## 📋 從 supabase status 取得 Key

執行 `supabase status` 後，在輸出中找到：

```
╭─────────────────────────────── ╮
│ 🔑 Authentication Keys                                        │
├────── ┬────────────────────────┤
│ Publishable │ sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH │
│ Secret      │ sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz      │
╰────── ┴────────────────────────╯
```

複製 **Publishable** 這一行的值。

---

## 🔄 如果 Key 改變了

如果重新啟動 Supabase（`supabase stop` 然後 `supabase start`），key 可能會改變。

**解決方案：**
1. 執行 `supabase status` 取得新的 Publishable key
2. 更新 `api.ts` 中的 `SUPABASE_ANON_KEY`
3. 或更新瀏覽器 localStorage：
   ```javascript
   localStorage.setItem('supabase_anon_key', '新的Publishable key')
   ```

---

## 💡 快速設定

### 方法 1：直接編輯 api.ts（已自動設定）

你的 `api.ts` 已經設定為：
```typescript
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
```

### 方法 2：使用瀏覽器 Console

如果 key 改變了，在瀏覽器 Console 中執行：
```javascript
localStorage.setItem('supabase_anon_key', 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')
```

---

## ✅ 驗證設定

啟動前端後，檢查瀏覽器 Console：
- 如果沒有警告訊息，表示 API Key 已正確設定
- 如果有警告，請按照上述步驟設定
