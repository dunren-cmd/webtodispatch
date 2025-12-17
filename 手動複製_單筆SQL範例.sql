-- ========================================
-- 手動複製單筆資料的 SQL 範例
-- 請根據實際資料修改數值
-- ========================================

-- ========================================
-- 步驟 1：先查看 PersonnelData 的資料
-- ========================================

SELECT 
  id,
  name,
  "JobTitle",
  "Mail",
  drive_link
FROM "PersonnelData"
ORDER BY id;

-- ========================================
-- 步驟 2：查看 users 的資料（確認哪些需要更新）
-- ========================================

SELECT 
  id,
  name,
  role,
  mail,
  headshot
FROM users
ORDER BY id;

-- ========================================
-- 步驟 3：更新單筆資料（如果 id 已存在）
-- ========================================

-- 範例：更新 id = 1234567890 的記錄
-- 請將以下數值改為實際的 PersonnelData 資料

UPDATE users 
SET 
  name = '程于宣',                    -- 從 PersonnelData.name
  role = '護理師',                    -- 從 PersonnelData.JobTitle
  mail = 'shan3636@gmail.com',        -- 從 PersonnelData.Mail
  headshot = 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view'  -- 從 PersonnelData.drive_link
WHERE id = 1234567890;                -- 從 PersonnelData.id

-- ========================================
-- 步驟 4：插入新資料（如果 id 不存在）
-- ========================================

-- 範例：插入一筆新記錄
-- 請將以下數值改為實際的 PersonnelData 資料

INSERT INTO users (id, name, role, mail, headshot, timestamp)
VALUES (
  1234567890,                         -- 從 PersonnelData.id
  '程于宣',                           -- 從 PersonnelData.name
  '護理師',                           -- 從 PersonnelData.JobTitle
  'shan3636@gmail.com',               -- 從 PersonnelData.Mail
  'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view',  -- 從 PersonnelData.drive_link
  NOW()                               -- 時間戳記
);

-- ========================================
-- 步驟 5：批次更新（一次更新多筆，使用 CASE）
-- ========================================

-- 如果有多筆資料，可以使用 CASE 語句一次更新
-- 範例：更新 3 筆資料

UPDATE users 
SET 
  name = CASE id
    WHEN 1234567890 THEN '程于宣'
    WHEN 1234567891 THEN '姓名2'
    WHEN 1234567892 THEN '姓名3'
    ELSE name
  END,
  role = CASE id
    WHEN 1234567890 THEN '護理師'
    WHEN 1234567891 THEN '職稱2'
    WHEN 1234567892 THEN '職稱3'
    ELSE role
  END,
  mail = CASE id
    WHEN 1234567890 THEN 'shan3636@gmail.com'
    WHEN 1234567891 THEN 'email2@example.com'
    WHEN 1234567892 THEN 'email3@example.com'
    ELSE mail
  END,
  headshot = CASE id
    WHEN 1234567890 THEN 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view'
    WHEN 1234567891 THEN 'https://drive.google.com/...'
    WHEN 1234567892 THEN 'https://drive.google.com/...'
    ELSE headshot
  END
WHERE id IN (1234567890, 1234567891, 1234567892);

-- ========================================
-- 步驟 6：驗證更新結果
-- ========================================

SELECT 
  u.id,
  u.name,
  u.role,
  u.mail,
  u.headshot,
  p.name as personnel_name,
  p."JobTitle" as personnel_role,
  p."Mail" as personnel_mail
FROM users u
LEFT JOIN "PersonnelData" p ON u.id = p.id
WHERE u.id IN (1234567890, 1234567891, 1234567892)
ORDER BY u.id;
