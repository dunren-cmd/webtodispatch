-- ========================================
-- 快速執行：合併 PersonnelData 到 users
-- ========================================

-- 步驟 1：添加新欄位（使用 id 作為合併鍵，不需要 employee_id）
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- 步驟 2：檢查 PersonnelData 的欄位名稱（先執行這個確認）
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'PersonnelData';

-- 步驟 3：合併資料（使用 id 作為合併鍵）

-- 選項 A：如果欄位名稱是 "JobTitle" 和 "Mail"（大小寫混合，有引號）
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

-- 選項 B：如果欄位名稱是 "job_title"（小寫+底線）
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

-- 步驟 4：驗證結果
SELECT id, name, role, mail, headshot FROM users ORDER BY id;
