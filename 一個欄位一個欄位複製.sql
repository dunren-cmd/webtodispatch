-- ========================================
-- 一個欄位一個欄位複製（最安全的方法）
-- 每次只更新一個欄位，一步一步來
-- ========================================

-- ========================================
-- 步驟 1：先確認 users 表有需要的欄位（只需要執行一次）
-- ========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- ========================================
-- 步驟 2：查看 PersonnelData 的資料（確認要複製的資料）
-- ========================================

SELECT 
  id,
  name,
  "JobTitle",
  "Mail"
FROM "PersonnelData"
ORDER BY id;

-- ========================================
-- 步驟 3：只複製 name 欄位
-- ========================================

-- 更新第一筆的 name（請根據實際 id 修改）
UPDATE users 
SET name = '程于宣'  -- 改成 PersonnelData 對應的 name
WHERE id = 1234567890;  -- 改成 PersonnelData 的 id

-- 更新第二筆的 name
-- UPDATE users 
-- SET name = '姓名2'
-- WHERE id = 1234567891;

-- 更新第三筆的 name
-- UPDATE users 
-- SET name = '姓名3'
-- WHERE id = 1234567892;

-- ========================================
-- 步驟 4：只複製 role 欄位
-- ========================================

-- 更新第一筆的 role（請根據實際 id 修改）
UPDATE users 
SET role = '護理師'  -- 改成 PersonnelData 對應的 JobTitle
WHERE id = 1234567890;  -- 改成 PersonnelData 的 id

-- 更新第二筆的 role
-- UPDATE users 
-- SET role = '職稱2'
-- WHERE id = 1234567891;

-- 更新第三筆的 role
-- UPDATE users 
-- SET role = '職稱3'
-- WHERE id = 1234567892;

-- ========================================
-- 步驟 5：只複製 mail 欄位
-- ========================================

-- 更新第一筆的 mail（請根據實際 id 修改）
UPDATE users 
SET mail = 'shan3636@gmail.com'  -- 改成 PersonnelData 對應的 Mail
WHERE id = 1234567890;  -- 改成 PersonnelData 的 id

-- 更新第二筆的 mail
-- UPDATE users 
-- SET mail = 'email2@example.com'
-- WHERE id = 1234567891;

-- 更新第三筆的 mail
-- UPDATE users 
-- SET mail = 'email3@example.com'
-- WHERE id = 1234567892;

-- ========================================
-- 步驟 6：驗證結果
-- ========================================

SELECT 
  id,
  name,
  role,
  mail
FROM users
WHERE id = 1234567890;  -- 改成剛才的 id

-- ========================================
-- 說明：
-- 1. 先執行步驟 2，查看 PersonnelData 的資料
-- 2. 執行步驟 3，更新 name 欄位（一次更新一筆或全部）
-- 3. 執行步驟 4，更新 role 欄位
-- 4. 執行步驟 5，更新 mail 欄位
-- 5. 執行步驟 6，驗證結果
-- ========================================
