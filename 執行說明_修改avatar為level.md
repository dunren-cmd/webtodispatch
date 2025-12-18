# 執行說明：將 avatar 欄位改為 level

## 🎯 問題說明

更新員工資料時出現錯誤：
```
Could not find the 'level' column of 'users' in the schema cache
```

這表示資料庫中還沒有 `level` 欄位，需要先執行 SQL migration。

---

## 📋 執行步驟

### 方法一：使用 Supabase SQL Editor（推薦）

1. **打開 Supabase Dashboard**
   - 訪問 `http://192.168.62.101:54321`（本地 Supabase）
   - 或使用 Supabase 雲端服務

2. **進入 SQL Editor**
   - 點擊左側選單的「SQL Editor」
   - 點擊「New query」

3. **執行 SQL**
   - 打開檔案：`執行_修改avatar為level.sql`
   - 複製所有 SQL 語句
   - 貼上到 SQL Editor
   - 點擊「Run」執行

4. **驗證結果**
   - 查看最後的驗證查詢結果
   - 確認 `level` 欄位已存在
   - 確認 `avatar` 欄位已刪除（如果不需要）

---

### 方法二：逐步執行（如果一次執行失敗）

如果一次執行所有 SQL 失敗，可以逐步執行：

#### 步驟 1：檢查當前結構
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY column_name;
```

#### 步驟 2：新增 level 欄位
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 5 CHECK (level >= 1 AND level <= 5);
```

#### 步驟 3：設定現有資料的層級
```sql
UPDATE users SET level = 5 WHERE level IS NULL;
```

#### 步驟 4：設為必填
```sql
ALTER TABLE users ALTER COLUMN level SET NOT NULL;
```

#### 步驟 5：刪除舊欄位（可選）
```sql
ALTER TABLE users DROP COLUMN IF EXISTS avatar;
```

#### 步驟 6：建立索引（可選）
```sql
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
```

---

## ⚠️ 注意事項

1. **備份資料**：執行前建議先備份 `users` 表
   ```sql
   -- 備份資料（可選）
   CREATE TABLE users_backup AS SELECT * FROM users;
   ```

2. **現有資料處理**：
   - 所有現有員工的層級會設為 `5`（最低層級）
   - 之後可以在角色管理中調整層級設定
   - 或在編輯員工時手動調整層級

3. **如果 avatar 欄位有重要資料**：
   - 可以先將 avatar 資料匯出
   - 或暫時保留 avatar 欄位，只新增 level 欄位

---

## ✅ 驗證

執行完成後，執行以下查詢驗證：

```sql
-- 檢查欄位是否存在
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'level';

-- 檢查資料
SELECT id, name, role, level FROM users LIMIT 10;
```

應該會看到：
- `level` 欄位存在，類型為 `integer`
- 所有員工的 `level` 值為 `5`

---

## 🔄 執行後

執行完成後：
1. 重新載入前端頁面
2. 嘗試編輯員工資料
3. 應該可以正常更新層級了

---

## 🆘 如果遇到錯誤

### 錯誤 1：欄位已存在
```
column "level" of relation "users" already exists
```
**解決**：跳過步驟 2，直接執行後續步驟

### 錯誤 2：有資料為 NULL
```
column "level" contains null values
```
**解決**：先執行步驟 3（UPDATE），再執行步驟 4

### 錯誤 3：avatar 欄位不存在
```
column "avatar" of relation "users" does not exist
```
**解決**：跳過步驟 5（刪除 avatar），這表示欄位已經不存在了
