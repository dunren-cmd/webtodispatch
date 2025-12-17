# 合併 PersonnelData 到 users 表說明

## 📋 合併策略

將 PersonnelData 表的資料合併到 users 表，欄位對應如下：

| PersonnelData | users | 說明 |
|--------------|-------|------|
| `id` | `id` | 主鍵 ID |
| `name` | `name` | 姓名 |
| `JobTitle` | `role` | 職稱/角色 |
| `email` | `mail` | 電子郵件（新增欄位） |
| `drive_link` | `headshot` | 頭像/照片連結（新增欄位） |
| `employee_id` | `employee_id` | 員工編號（用於關聯） |

---

## 🔧 執行步驟

### 步驟 1：檢查 PersonnelData 的實際欄位名稱

在 SQL Editor 執行：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;
```

確認實際的欄位名稱（特別是 JobTitle 的大小寫）。

### 步驟 2：為 users 表添加新欄位

```sql
-- 添加 Mail 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- 添加 headshot 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);
```

### 步驟 3：合併資料

**如果 PersonnelData 的欄位名稱是 `JobTitle`（大小寫混合）：**

```sql
INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p.email as mail,
  p.drive_link as headshot,
  p.employee_id,
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot,
  employee_id = EXCLUDED.employee_id;
```

**如果 PersonnelData 的欄位名稱是 `job_title`（小寫+底線）：**

```sql
INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
SELECT 
  p.id,
  p.name,
  p.job_title as role,
  p.email as mail,
  p.drive_link as headshot,
  p.employee_id,
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot,
  employee_id = EXCLUDED.employee_id;
```

### 步驟 4：驗證結果

```sql
-- 查看合併後的資料
SELECT id, name, role, mail, headshot, employee_id 
FROM users 
ORDER BY id;

-- 統計
SELECT 
  COUNT(*) as total_users,
  COUNT(mail) as users_with_mail,
  COUNT(headshot) as users_with_headshot
FROM users;
```

---

## ⚠️ 注意事項

### 1. 資料衝突處理

- 如果 users 表中已經有相同 id 的記錄，會使用 `ON CONFLICT ... DO UPDATE` 更新
- 如果 users 表中沒有該 id，會插入新記錄

### 2. 欄位名稱大小寫

PostgreSQL 對大小寫敏感：
- 如果建立表時使用引號 `"JobTitle"`，查詢時也需要引號
- 如果沒有引號，PostgreSQL 會自動轉為小寫

**建議先執行檢查 SQL 確認實際欄位名稱。**

### 3. 資料備份

執行合併前，建議先備份：

```sql
-- 備份 users 表（建立備份表）
CREATE TABLE users_backup AS SELECT * FROM users;
```

---

## 🔍 如果合併失敗

### 問題 1：欄位名稱不匹配

**錯誤訊息：** `column "JobTitle" does not exist`

**解決方法：**
1. 先執行檢查 SQL 確認實際欄位名稱
2. 根據實際名稱調整 SQL 語句

### 問題 2：資料類型不匹配

**錯誤訊息：** `column "role" is of type text but expression is of type ...`

**解決方法：**
使用 `CAST` 轉換類型：

```sql
CAST(p."JobTitle" AS TEXT) as role
```

### 問題 3：主鍵衝突

**錯誤訊息：** `duplicate key value violates unique constraint`

**解決方法：**
- 使用 `ON CONFLICT` 處理（已在 SQL 中包含）
- 或先檢查是否有衝突：

```sql
SELECT u.id 
FROM users u
INNER JOIN "PersonnelData" p ON u.id = p.id;
```

---

## 📝 完整 SQL 檔案

請參考：`supabase/migrations/20251212170000_merge_personnel_to_users.sql`

---

## ✅ 合併後的 users 表結構

合併完成後，users 表應該包含：

- `id` (BIGINT) - 主鍵
- `name` (TEXT) - 姓名
- `role` (TEXT) - 職稱/角色（來自 PersonnelData.JobTitle）
- `mail` (TEXT) - 電子郵件（新增，來自 PersonnelData.email）
- `headshot` (TEXT) - 頭像連結（新增，來自 PersonnelData.drive_link）
- `employee_id` (TEXT) - 員工編號
- `avatar` (TEXT) - 頭像 emoji（原有）
- `timestamp` (TIMESTAMPTZ) - 時間戳記

---

**最後更新：2025-12-12**
