-- ========================================
-- 一次複製一筆資料（最簡單的方法）
-- 每次只處理一筆，複製後修改 id 和資料，再執行下一筆
-- ========================================

-- ========================================
-- 步驟 1：先確認 users 表有 mail 欄位（只需要執行一次）
-- ========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- ========================================
-- 步驟 2：查看 PersonnelData 的第一筆資料
-- ========================================

SELECT 
  id,
  name,
  "JobTitle",
  "Mail"
FROM "PersonnelData"
ORDER BY id
LIMIT 1;

-- ========================================
-- 步驟 3：複製第一筆資料（請根據上面的查詢結果修改數值）
-- ========================================

-- 範例：假設查詢結果是：
-- id = 1234567890
-- name = '程于宣'
-- JobTitle = '護理師'
-- Mail = 'shan3636@gmail.com'

-- 如果 users 表中已經有這個 id，會更新；如果沒有，會插入
INSERT INTO users (id, name, role, mail, timestamp)
VALUES (
  1234567890,              -- 從 PersonnelData 的 id（請修改）
  '程于宣',                -- 從 PersonnelData 的 name（請修改）
  '護理師',                -- 從 PersonnelData 的 JobTitle（請修改）
  'shan3636@gmail.com',    -- 從 PersonnelData 的 Mail（請修改）
  NOW()                    -- 時間戳記（不需要修改）
)
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail;

-- ========================================
-- 步驟 4：驗證是否成功
-- ========================================

SELECT 
  id,
  name,
  role,
  mail
FROM users
WHERE id = 1234567890;  -- 請修改為剛才的 id

-- ========================================
-- 重複步驟 2-4 處理下一筆資料
-- ========================================

-- 查看下一筆資料
-- SELECT id, name, "JobTitle", "Mail"
-- FROM "PersonnelData"
-- ORDER BY id
-- LIMIT 1 OFFSET 1;  -- OFFSET 1 表示跳過第一筆，看第二筆

-- 然後修改上面的 INSERT 語句，填入新的 id、name、role、mail
-- 再執行一次
