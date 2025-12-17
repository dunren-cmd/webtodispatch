-- ========================================
-- 合併 PersonnelData 到 users（最終版）
-- 使用 id 作為合併鍵，欄位名稱是 Mail（大寫 M）
-- ========================================

-- ========================================
-- 步驟 1：添加新欄位
-- ========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- ========================================
-- 步驟 2：合併資料（使用 id 作為合併鍵）
-- ========================================

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

-- ========================================
-- 步驟 3：驗證結果
-- ========================================

SELECT id, name, role, mail, headshot 
FROM users 
ORDER BY id;
