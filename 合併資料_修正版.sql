-- ========================================
-- 合併 PersonnelData 到 users（修正版）
-- 先添加所有需要的欄位，再執行合併
-- ========================================

-- ========================================
-- 步驟 1：添加所有需要的欄位
-- ========================================

-- 添加 employee_id 欄位（如果還沒有）
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 添加 mail 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- 添加 headshot 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- ========================================
-- 步驟 2：驗證欄位是否添加成功
-- ========================================

-- 檢查 users 表的結構
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- 步驟 3：合併資料
-- ========================================

INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,  -- 注意：如果實際是 job_title，改成 p.job_title
  p."Mail" as mail,  -- 注意：欄位名稱是 Mail（大寫 M），需要用引號
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

-- ========================================
-- 步驟 4：驗證合併結果
-- ========================================

-- 查看合併後的資料
SELECT id, name, role, mail, headshot, employee_id 
FROM users 
ORDER BY id;

-- 統計
SELECT 
  COUNT(*) as total_users,
  COUNT(mail) as users_with_mail,
  COUNT(headshot) as users_with_headshot,
  COUNT(employee_id) as users_with_employee_id
FROM users;
