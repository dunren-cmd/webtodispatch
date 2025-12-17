-- ========================================
-- 分段執行版本（如果一次性執行失敗）
-- ========================================

-- ========================================
-- 第一部分：添加欄位（先執行這個）
-- ========================================

-- 步驟 1：添加 employee_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 步驟 2：添加 mail
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- 步驟 3：添加 headshot
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 步驟 4：建立索引
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- 驗證欄位是否添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- 第二部分：合併資料（欄位添加成功後再執行）
-- ========================================

-- 先檢查 PersonnelData 的欄位名稱
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'PersonnelData';

-- 合併資料（根據實際欄位名稱選擇一個）

-- 選項 A：如果欄位名稱是 "JobTitle"（大小寫混合，有引號）
INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
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

-- 選項 B：如果欄位名稱是 "job_title"（小寫+底線）
-- INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
-- SELECT 
--   p.id,
--   p.name,
--   p.job_title as role,
--   p."Mail" as mail,  -- 注意：欄位名稱是 Mail（大寫 M），需要用引號
--   p.drive_link as headshot,
--   p.employee_id,
--   COALESCE(p.timestamp, NOW()) as timestamp
-- FROM "PersonnelData" p
-- ON CONFLICT (id) 
-- DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   mail = EXCLUDED.mail,
--   headshot = EXCLUDED.headshot,
--   employee_id = EXCLUDED.employee_id;

-- ========================================
-- 第三部分：驗證結果
-- ========================================

SELECT id, name, role, mail, headshot, employee_id FROM users ORDER BY id;
