-- ========================================
-- 直接執行：複製 PersonnelData 到 users
-- 這個腳本會自動處理：如果 id 存在則更新，不存在則插入
-- ========================================

-- ========================================
-- 步驟 1：確認 users 表有需要的欄位（如果沒有會自動添加）
-- ========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- ========================================
-- 步驟 2：先查看 PersonnelData 的資料（確認資料）
-- ========================================

-- 先檢查實際的欄位名稱
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;

-- 查看 PersonnelData 的資料（請根據實際欄位名稱調整）
SELECT 
  id,
  name,
  "JobTitle",
  "Mail"
  -- 注意：請根據上面的查詢結果，確認 Google Drive 連結欄位的實際名稱
  -- 可能是：DriveLink, Drive_Link, drive-link, 或其他名稱
FROM "PersonnelData"
ORDER BY id;

-- ========================================
-- 步驟 3：複製資料（自動處理更新和插入）
-- ========================================

-- 使用 INSERT ... ON CONFLICT 語句
-- 如果 users.id 已存在，則更新；不存在則插入

-- 請先執行上面的欄位檢查查詢，確認實際的欄位名稱
-- 然後根據實際欄位名稱修改下面的 SQL

-- 選項 A：如果欄位名稱是 "DriveLink"（大小寫混合）
INSERT INTO users (id, name, role, mail, headshot, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p."Mail" as mail,
  p."DriveLink" as headshot,  -- 注意：請根據實際欄位名稱修改
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot;

-- 選項 B：如果欄位名稱是 "Drive_Link"（大小寫+底線）
-- INSERT INTO users (id, name, role, mail, headshot, timestamp)
-- SELECT 
--   p.id,
--   p.name,
--   p."JobTitle" as role,
--   p."Mail" as mail,
--   p."Drive_Link" as headshot,
--   COALESCE(p.timestamp, NOW()) as timestamp
-- FROM "PersonnelData" p
-- ON CONFLICT (id) 
-- DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   mail = EXCLUDED.mail,
--   headshot = EXCLUDED.headshot;

-- 選項 C：如果欄位名稱是 "drive-link"（小寫+連字號，需要用引號）
-- INSERT INTO users (id, name, role, mail, headshot, timestamp)
-- SELECT 
--   p.id,
--   p.name,
--   p."JobTitle" as role,
--   p."Mail" as mail,
--   p."drive-link" as headshot,
--   COALESCE(p.timestamp, NOW()) as timestamp
-- FROM "PersonnelData" p
-- ON CONFLICT (id) 
-- DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   mail = EXCLUDED.mail,
--   headshot = EXCLUDED.headshot;

-- 選項 D：如果該欄位不存在或不需要複製 headshot
-- INSERT INTO users (id, name, role, mail, timestamp)
-- SELECT 
--   p.id,
--   p.name,
--   p."JobTitle" as role,
--   p."Mail" as mail,
--   COALESCE(p.timestamp, NOW()) as timestamp
-- FROM "PersonnelData" p
-- ON CONFLICT (id) 
-- DO UPDATE SET
--   name = EXCLUDED.name,
--   role = EXCLUDED.role,
--   mail = EXCLUDED.mail;

-- ========================================
-- 步驟 4：驗證結果
-- ========================================

-- 查看複製後的資料
SELECT 
  id,
  name,
  role,
  mail,
  headshot
FROM users
ORDER BY id;

-- 對比兩個表的資料，確認複製是否成功
SELECT 
  p.id,
  p.name as personnel_name,
  p."JobTitle" as personnel_role,
  p."Mail" as personnel_mail,
  -- p."DriveLink" as personnel_headshot,  -- 請根據實際欄位名稱修改
  u.name as user_name,
  u.role as user_role,
  u.mail as user_mail,
  u.headshot as user_headshot,
  CASE 
    WHEN u.name IS NULL THEN '❌ 未複製'
    WHEN u.name = p.name AND u.role = p."JobTitle" AND u.mail = p."Mail" THEN '✅ 成功'
    ELSE '⚠️ 部分成功'
  END as status
FROM "PersonnelData" p
LEFT JOIN users u ON p.id = u.id
ORDER BY p.id;

-- 統計
SELECT 
  COUNT(*) as total_personnel,
  COUNT(u.id) as copied_to_users,
  COUNT(*) - COUNT(u.id) as not_copied
FROM "PersonnelData" p
LEFT JOIN users u ON p.id = u.id;
