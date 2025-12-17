-- ========================================
-- 直接執行：複製 PersonnelData 到 users（不含 headshot）
-- 如果 headshot 欄位不存在或不需要，使用這個版本
-- ========================================

-- ========================================
-- 步驟 1：確認 users 表有需要的欄位
-- ========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- ========================================
-- 步驟 2：先檢查 PersonnelData 的實際欄位名稱
-- ========================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;

-- ========================================
-- 步驟 3：查看 PersonnelData 的資料
-- ========================================

SELECT 
  id,
  name,
  "JobTitle",
  "Mail"
FROM "PersonnelData"
ORDER BY id;

-- ========================================
-- 步驟 4：複製資料（不含 headshot）
-- ========================================

INSERT INTO users (id, name, role, mail, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p."Mail" as mail,
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail;

-- ========================================
-- 步驟 5：驗證結果
-- ========================================

SELECT 
  id,
  name,
  role,
  mail
FROM users
ORDER BY id;

-- 對比兩個表的資料
SELECT 
  p.id,
  p.name as personnel_name,
  p."JobTitle" as personnel_role,
  p."Mail" as personnel_mail,
  u.name as user_name,
  u.role as user_role,
  u.mail as user_mail,
  CASE 
    WHEN u.name IS NULL THEN '❌ 未複製'
    WHEN u.name = p.name AND u.role = p."JobTitle" AND u.mail = p."Mail" THEN '✅ 成功'
    ELSE '⚠️ 部分成功'
  END as status
FROM "PersonnelData" p
LEFT JOIN users u ON p.id = u.id
ORDER BY p.id;
