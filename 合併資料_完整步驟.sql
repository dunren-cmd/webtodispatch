-- ========================================
-- 完整步驟：合併 PersonnelData 到 users
-- 請按順序執行，不要一次性執行全部
-- ========================================

-- ========================================
-- 步驟 1：添加 employee_id 欄位（必須先執行）
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- 執行後確認：應該顯示 "ALTER TABLE" 成功

-- ========================================
-- 步驟 2：添加 mail 欄位
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- ========================================
-- 步驟 3：添加 headshot 欄位
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- ========================================
-- 步驟 4：驗證欄位已添加
-- ========================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('employee_id', 'mail', 'headshot')
ORDER BY column_name;

-- 應該看到 3 個欄位：employee_id, headshot, mail

-- ========================================
-- 步驟 5：執行合併（確認欄位都存在後再執行）
-- ========================================

-- 先檢查 PersonnelData 的欄位名稱（確認 JobTitle 是否存在）
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
  AND column_name LIKE '%Job%' OR column_name LIKE '%job%';

-- 然後執行合併
INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,  -- 如果欄位名不同，請調整
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

-- ========================================
-- 步驟 6：驗證合併結果
-- ========================================
SELECT 
  COUNT(*) as total_users,
  COUNT(mail) as users_with_mail,
  COUNT(headshot) as users_with_headshot,
  COUNT(employee_id) as users_with_employee_id
FROM users;

-- 查看合併後的資料
SELECT id, name, role, mail, headshot, employee_id 
FROM users 
ORDER BY id;
