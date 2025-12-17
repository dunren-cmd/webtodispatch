# 匯入 personnel 資料說明

## 📋 資料格式

您的資料格式：
```
0022	程于宣	護理師	shan3636@gmail.com	https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view
```

對應欄位：
- `employee_id`: 0022
- `name`: 程于宣
- `role`: 護理師
- `email`: shan3636@gmail.com
- `drive_link`: https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view

---

## 🔧 方法一：使用 Supabase Dashboard（推薦）

### 步驟 1：建立資料表

1. 開啟 Supabase Dashboard (`http://192.168.68.75:54323`)
2. 進入 **SQL Editor**
3. 執行以下 SQL：

```sql
-- 建立 personnel 表格
CREATE TABLE IF NOT EXISTS personnel (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  drive_link TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_personnel_employee_id ON personnel(employee_id);
CREATE INDEX IF NOT EXISTS idx_personnel_email ON personnel(email);
CREATE INDEX IF NOT EXISTS idx_personnel_role ON personnel(role);

-- 啟用 RLS
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

-- 設定 RLS 政策
CREATE POLICY "Allow all operations on personnel" ON personnel
  FOR ALL USING (true) WITH CHECK (true);
```

### 步驟 2：手動插入資料

在 **Table Editor** 中：

1. 選擇 `personnel` 表
2. 點擊 **Insert** 按鈕
3. 填入資料：
   - `employee_id`: `0022`
   - `name`: `程于宣`
   - `role`: `護理師`
   - `email`: `shan3636@gmail.com`
   - `drive_link`: `https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view`
4. 點擊 **Save**

---

## 📊 方法二：使用 SQL INSERT（批量匯入）

### 步驟 1：準備 CSV 檔案

建立 `personnel.csv`：

```csv
employee_id,name,role,email,drive_link
0022,程于宣,護理師,shan3636@gmail.com,https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view
```

### 步驟 2：使用 SQL INSERT

在 **SQL Editor** 中執行：

```sql
INSERT INTO personnel (employee_id, name, role, email, drive_link) 
VALUES 
  ('0022', '程于宣', '護理師', 'shan3636@gmail.com', 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view');
```

### 步驟 3：批量匯入多筆資料

如果有多筆資料，使用：

```sql
INSERT INTO personnel (employee_id, name, role, email, drive_link) 
VALUES 
  ('0022', '程于宣', '護理師', 'shan3636@gmail.com', 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view'),
  ('0023', '姓名2', '職稱2', 'email2@example.com', 'https://drive.google.com/...'),
  ('0024', '姓名3', '職稱3', 'email3@example.com', 'https://drive.google.com/...');
```

---

## 🚨 常見錯誤與解決方法

### 錯誤 1：`duplicate key value violates unique constraint`

**原因**：`employee_id` 已存在

**解決方法**：
```sql
-- 檢查是否已存在
SELECT * FROM personnel WHERE employee_id = '0022';

-- 如果存在，先刪除或更新
DELETE FROM personnel WHERE employee_id = '0022';

-- 或使用 INSERT ... ON CONFLICT
INSERT INTO personnel (employee_id, name, role, email, drive_link) 
VALUES ('0022', '程于宣', '護理師', 'shan3636@gmail.com', 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view')
ON CONFLICT (employee_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  drive_link = EXCLUDED.drive_link;
```

### 錯誤 2：`null value in column "name" violates not-null constraint`

**原因**：必填欄位 `name` 為空

**解決方法**：確保所有必填欄位都有值

### 錯誤 3：`permission denied for table personnel`

**原因**：RLS 政策未正確設定

**解決方法**：執行 RLS 政策設定 SQL（見上方）

### 錯誤 4：CSV 匯入格式錯誤

**原因**：CSV 格式不正確或編碼問題

**解決方法**：
1. 確保 CSV 使用 UTF-8 編碼
2. 檢查欄位名稱是否正確
3. 使用 SQL INSERT 代替 CSV 匯入

---

## ✅ 驗證匯入結果

執行以下 SQL 檢查資料：

```sql
-- 查看所有資料
SELECT * FROM personnel;

-- 查看特定員工
SELECT * FROM personnel WHERE employee_id = '0022';

-- 統計各角色人數
SELECT role, COUNT(*) as count 
FROM personnel 
GROUP BY role;
```

---

## 📝 注意事項

1. **員工編號唯一性**：`employee_id` 必須唯一，重複會導致錯誤
2. **資料格式**：確保 email 格式正確
3. **RLS 政策**：如果無法寫入，檢查 RLS 政策設定
4. **備份資料**：匯入前建議先備份現有資料

---

## 🔄 更新現有資料

如果需要更新已存在的資料：

```sql
UPDATE personnel 
SET 
  name = '程于宣',
  role = '護理師',
  email = 'shan3636@gmail.com',
  drive_link = 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view'
WHERE employee_id = '0022';
```
