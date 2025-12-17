# Supabase API 錯誤排除指南

## ❌ 錯誤訊息：API error happened while trying to communicate with the server

**這個錯誤與 API Key 設定無關！**

這個錯誤表示 Supabase Dashboard 的 SQL Editor 無法與資料庫伺服器通訊。

---

## 🔍 原因分析

### 不是這些問題：
- ❌ API Key（SUPABASE_ANON_KEY）未設定
- ❌ SQL 語法錯誤
- ❌ 權限問題

### 可能是這些問題：
- ✅ Supabase 本地服務未正常運行
- ✅ 連接埠問題（54321 API、54322 DB、54323 Dashboard）
- ✅ 網路連線問題
- ✅ 瀏覽器快取或 Cookie 問題
- ✅ Supabase Dashboard 本身的暫時性問題

---

## ✅ 解決方案

### 方案一：檢查 Supabase 服務狀態（最重要）

**在命令列執行：**

```powershell
# 檢查 Supabase 狀態
supabase status
```

應該看到類似以下的輸出：

```
         API URL: http://192.168.68.75:54321
     GraphQL URL: http://192.168.68.75:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@192.168.68.75:54322/postgres
      Studio URL: http://192.168.68.75:54323
    Inbucket URL: http://192.168.68.75:54324
      JWT secret: ...
        anon key: ...
service_role key: ...
```

**如果 Supabase 沒有運行：**

```powershell
# 啟動 Supabase
supabase start
```

等待啟動完成後，再嘗試執行 SQL。

---

### 方案二：使用 Table Editor（推薦替代方案）

如果 SQL Editor 一直失敗，使用 Table Editor 手動操作：

#### 步驟 1：添加 ID 欄位

1. 開啟 Supabase Dashboard：`http://192.168.68.75:54323`
2. 進入 **Table Editor**
3. 選擇 **PersonnelData** 表
4. 點擊 **Add column** 或欄位圖示
5. 設定：
   - **Name**: `id`
   - **Type**: `int8` 或 `bigint`
   - **Nullable**: 勾選（暫時允許 NULL）
6. 點擊 **Save**

#### 步驟 2：生成 ID 值

**方法 A：在 Table Editor 中手動填入**

為每筆記錄手動填入 10 位數的 ID（例如：1234567890）

**方法 B：稍後用簡單 SQL 生成**

等 SQL Editor 恢復正常後，執行：

```sql
UPDATE "PersonnelData" 
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT 
WHERE id IS NULL;
```

---

### 方案三：重新啟動 Supabase

如果 Supabase 服務有問題，重新啟動：

```powershell
# 停止 Supabase
supabase stop

# 重新啟動
supabase start
```

等待啟動完成後（通常需要 30-60 秒），再嘗試執行 SQL。

---

### 方案四：清除瀏覽器快取

1. 按 `Ctrl + Shift + Delete` 開啟清除資料對話框
2. 選擇清除「快取」和「Cookie」
3. 重新整理 Supabase Dashboard 頁面
4. 重新登入（如果需要）

---

### 方案五：使用不同的瀏覽器或無痕模式

- 嘗試使用 Chrome、Edge 或其他瀏覽器
- 或使用無痕/隱私模式開啟 Supabase Dashboard

---

## 🔍 診斷步驟

### 步驟 1：檢查 Supabase 服務

```powershell
supabase status
```

確認所有服務都在運行（API URL、DB URL、Studio URL 都有顯示）。

### 步驟 2：測試簡單的 SELECT 查詢

在 SQL Editor 嘗試執行：

```sql
SELECT 1;
```

如果這個都無法執行，表示是連接問題，不是 SQL 語句問題。

### 步驟 3：檢查表是否存在

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

如果能執行，表示連接正常，可能是 UPDATE 語句的特定問題。

---

## 💡 快速檢查清單

- [ ] Supabase 服務是否運行？（執行 `supabase status`）
- [ ] 是否可以執行簡單的 `SELECT 1;`？
- [ ] 是否可以使用 Table Editor 查看資料？
- [ ] 瀏覽器是否有錯誤訊息（按 F12 查看 Console）？
- [ ] 網路連線是否正常？

---

## 🚀 推薦做法

如果 SQL Editor 一直無法使用：

1. **使用 Table Editor 手動添加欄位**（最可靠）
2. **使用 Table Editor 手動填入 ID**（如果記錄不多）
3. **或等待 Supabase 服務恢復後再執行 SQL**

Table Editor 通常比 SQL Editor 更穩定，因為它使用不同的 API 端點。

---

## 📝 關於 API Key

**重要說明：**

- SQL Editor 不需要設定 API Key
- SQL Editor 使用 Supabase Dashboard 的內部認證
- API Key（SUPABASE_ANON_KEY）是用於：
  - 前端應用程式（api.ts）
  - Google Apps Script（Code.gs）
  - REST API 請求

---

## 🔗 相關檔案

- `使用TableEditor手動添加欄位.md` - 詳細的 Table Editor 操作說明
- `替代方案_手動操作步驟.md` - 快速參考

---

**最後更新：2025-12-12**
