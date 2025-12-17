-- ========================================
-- 一次更新一個欄位，更新所有資料（1-200 筆）
-- 每次只更新一個欄位，但更新所有記錄
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
  role,  -- 已改名為 role
  "Mail"
FROM "PersonnelData"
ORDER BY id;

-- ========================================
-- 步驟 3：只更新 name 欄位（更新所有記錄）
-- ========================================

-- 一次更新所有記錄的 name 欄位
UPDATE users u
SET name = p.name
FROM "PersonnelData" p
WHERE u.id = p.id;

-- 驗證 name 是否更新成功
SELECT 
  u.id,
  u.name as users_name,
  p.name as personnel_name,
  CASE 
    WHEN u.name = p.name THEN '✅ 成功'
    ELSE '❌ 失敗'
  END as status
FROM users u
JOIN "PersonnelData" p ON u.id = p.id
ORDER BY u.id
LIMIT 10;  -- 先看前 10 筆確認

-- ========================================
-- 步驟 4：只更新 role 欄位（更新所有記錄）
-- ========================================

-- 一次更新所有記錄的 role 欄位
UPDATE users u
SET role = p.role  -- PersonnelData 的欄位名稱已改為 role
FROM "PersonnelData" p
WHERE u.id = p.id;

-- 驗證 role 是否更新成功
SELECT 
  u.id,
  u.role as users_role,
  p.role as personnel_role,
  CASE 
    WHEN u.role = p.role THEN '✅ 成功'
    ELSE '❌ 失敗'
  END as status
FROM users u
JOIN "PersonnelData" p ON u.id = p.id
ORDER BY u.id
LIMIT 10;  -- 先看前 10 筆確認

-- ========================================
-- 步驟 5：只更新 mail 欄位（更新所有記錄）
-- ========================================

-- 一次更新所有記錄的 mail 欄位
UPDATE users u
SET mail = p."Mail"
FROM "PersonnelData" p
WHERE u.id = p.id;

-- 驗證 mail 是否更新成功
SELECT 
  u.id,
  u.mail as users_mail,
  p."Mail" as personnel_mail,
  CASE 
    WHEN u.mail = p."Mail" THEN '✅ 成功'
    ELSE '❌ 失敗'
  END as status
FROM users u
JOIN "PersonnelData" p ON u.id = p.id
ORDER BY u.id
LIMIT 10;  -- 先看前 10 筆確認

-- ========================================
-- 步驟 6：最終驗證（查看所有結果）
-- ========================================

SELECT 
  u.id,
  u.name,
  u.role,
  u.mail,
  p.name as personnel_name,
  p.role as personnel_role,
  p."Mail" as personnel_mail,
  CASE 
    WHEN u.name = p.name AND u.role = p.role AND u.mail = p."Mail" THEN '✅ 全部成功'
    WHEN u.name = p.name AND u.role = p.role THEN '⚠️ mail 未更新'
    WHEN u.name = p.name THEN '⚠️ role 和 mail 未更新'
    ELSE '❌ 未更新'
  END as status
FROM users u
JOIN "PersonnelData" p ON u.id = p.id
ORDER BY u.id;

-- 統計更新結果
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN u.name = p.name THEN 1 END) as name_updated,
  COUNT(CASE WHEN u.role = p.role THEN 1 END) as role_updated,
  COUNT(CASE WHEN u.mail = p."Mail" THEN 1 END) as mail_updated,
  COUNT(CASE WHEN u.name = p.name AND u.role = p.role AND u.mail = p."Mail" THEN 1 END) as all_updated
FROM users u
JOIN "PersonnelData" p ON u.id = p.id;

-- ========================================
-- 執行順序：
-- 1. 執行步驟 1（添加 mail 欄位，只需要一次）
-- 2. 執行步驟 2（查看資料，確認）
-- 3. 執行步驟 3（更新所有 name）
-- 4. 執行步驟 4（更新所有 role）
-- 5. 執行步驟 5（更新所有 mail）
-- 6. 執行步驟 6（最終驗證）
-- ========================================
