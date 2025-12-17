# SQL 執行錯誤排除指南

## ❌ 錯誤訊息：API error happened while trying to communicate with the server

這個錯誤通常表示：
1. SQL 語句太複雜或執行時間過長
2. 某些 PostgreSQL 功能在 Supabase 中有限制
3. 連接問題

---

## ✅ 解決方案

### 方案一：分段執行（推薦）

使用 `執行_SQL_逐步版.sql` 檔案，按照步驟逐一執行：

1. **步驟 1-3**：為 PersonnelData 添加 ID 欄位並生成亂數
2. **步驟 4**：驗證結果
3. **步驟 5-6**：為 users 表添加 employee_id
4. **步驟 7**：建立視圖
5. **步驟 8**：檢查結果

### 方案二：手動逐步執行

#### 步驟 1：添加 ID 欄位
```sql
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;
```

#### 步驟 2：生成 ID
```sql
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;
```

#### 步驟 3：再次執行（確保沒有 NULL）
```sql
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;
```

#### 步驟 4：驗證
```sql
SELECT COUNT(*) as total, COUNT(id) as with_id 
FROM "PersonnelData";
```

#### 步驟 5：添加 employee_id 欄位
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
```

#### 步驟 6：建立視圖
```sql
CREATE OR REPLACE VIEW user_with_personnel AS
SELECT 
  u.id as user_id,
  u.name,
  u.role,
  u.employee_id,
  p.id as personnel_id,
  p.employee_id as personnel_employee_id,
  p.email
FROM users u
LEFT JOIN "PersonnelData" p ON u.employee_id = p.employee_id;
```

---

## 🔍 檢查與驗證

### 檢查 PersonnelData 的 ID

```sql
-- 查看所有記錄
SELECT id, employee_id, name, email 
FROM "PersonnelData" 
ORDER BY id;

-- 檢查是否有 NULL
SELECT COUNT(*) as null_count
FROM "PersonnelData"
WHERE id IS NULL;

-- 檢查是否有重複
SELECT id, COUNT(*) as count
FROM "PersonnelData"
GROUP BY id
HAVING COUNT(*) > 1;
```

### 檢查 users 表的結構

```sql
-- 查看 users 表結構
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- 查看 users 表的資料
SELECT id, name, role, employee_id 
FROM users 
LIMIT 10;
```

---

## ⚠️ 常見問題

### 問題 1：表名大小寫

如果錯誤訊息是 `relation "PersonnelData" does not exist`，可能是表名大小寫問題。

**解決方法：**
```sql
-- 先檢查實際的表名
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%ersonnel%';

-- 如果實際表名是 personnel_data，則使用：
-- ALTER TABLE personnel_data ADD COLUMN IF NOT EXISTS id BIGINT;
```

### 問題 2：權限不足

如果錯誤訊息包含 `permission denied`，表示權限不足。

**解決方法：**
- 確認使用的是 Supabase Dashboard 的 SQL Editor
- 確認使用的是正確的專案和資料庫

### 問題 3：主鍵衝突

如果要設置主鍵但已有重複 ID：

**解決方法：**
```sql
-- 先檢查重複
SELECT id, COUNT(*) as count
FROM "PersonnelData"
GROUP BY id
HAVING COUNT(*) > 1;

-- 如果有重複，刪除重複記錄（只保留第一個）
DELETE FROM "PersonnelData" a
WHERE EXISTS (
  SELECT 1 FROM "PersonnelData" b
  WHERE a.id = b.id AND a.ctid > b.ctid
);

-- 然後再設置主鍵
ALTER TABLE "PersonnelData" ADD PRIMARY KEY (id);
```

---

## 🚀 快速執行腳本（最小化版本）

如果以上方法都失敗，可以使用這個最小化版本：

```sql
-- 1. 添加 ID 欄位
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;

-- 2. 生成 ID
UPDATE "PersonnelData" SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT WHERE id IS NULL;

-- 3. 添加 employee_id 到 users
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 4. 完成！檢查結果
SELECT id, employee_id, name, email FROM "PersonnelData";
```

---

## 📞 需要協助？

如果以上方法都無法解決，請提供：
1. 完整的錯誤訊息
2. 執行到哪一步失敗
3. PersonnelData 表的結構（欄位名稱和類型）
