-- ========================================
-- 合併 PersonnelData 到 users（使用 id 欄位合併）
-- ========================================

-- ========================================
-- 步驟 1：添加新欄位
-- ========================================

-- 添加 mail 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- 添加 headshot 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- ========================================
-- 步驟 2：檢查兩個表的結構（確認欄位名稱）
-- ========================================

-- 檢查 PersonnelData 的欄位
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;

-- 檢查 users 的欄位
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ========================================
-- 步驟 3：合併資料（使用 id 作為合併鍵）
-- ========================================

-- 選項 A：如果 PersonnelData 的欄位名稱是 "JobTitle" 和 "Mail"（大小寫混合，有引號）
INSERT INTO users (id, name, role, mail, headshot, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p."Mail" as mail,  -- 注意：欄位名稱是 Mail（大寫 M），需要用引號
  p.drive_link as headshot,
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot;

-- 選項 B：如果 PersonnelData 的欄位名稱是 "job_title"（小寫+底線）
-- INSERT INTO users (id, name, role, mail, headshot, timestamp)
-- SELECT 
--   p.id,
--   p.name,
--   p.job_title as role,
--   p."Mail" as mail,  -- 注意：欄位名稱是 Mail（大寫 M），需要用引號
--   p.drive_link as headshot,
--   COALESCE(p.timestamp, NOW()) as timestamp
-- FROM "PersonnelData" p
-- ON CONFLICT (id) 
-- DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   mail = EXCLUDED.mail,
--   headshot = EXCLUDED.headshot;

-- ========================================
-- 步驟 4：驗證合併結果
-- ========================================

-- 查看合併後的資料
SELECT id, name, role, mail, headshot 
FROM users 
ORDER BY id;

-- 統計
SELECT 
  COUNT(*) as total_users,
  COUNT(mail) as users_with_mail,
  COUNT(headshot) as users_with_headshot
FROM users;

-- 對比 PersonnelData 的資料
SELECT 
  u.id,
  u.name as users_name,
  u.role as users_role,
  u.mail,
  u.headshot,
  p.name as personnel_name,
  p."JobTitle" as personnel_job_title,
  p."Mail" as personnel_email
FROM users u
LEFT JOIN "PersonnelData" p ON u.id = p.id
ORDER BY u.id;
