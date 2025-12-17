-- ========================================
-- 將 users 表中 level = 5 的資料改為 level = 4（員工）
-- 因為層級 4 和 5 都顯示為「員工」
-- ========================================

-- 步驟 1：查看目前 level = 5 的資料數量
SELECT COUNT(*) as level5_count
FROM users
WHERE level = 5;

-- 步驟 2：查看目前 level = 4 的資料數量
SELECT COUNT(*) as level4_count
FROM users
WHERE level = 4;

-- 步驟 3：將所有 level = 5 的資料改為 level = 4
UPDATE users
SET level = 4
WHERE level = 5;

-- 步驟 4：驗證更新結果
SELECT 
  level,
  COUNT(*) as count
FROM users
GROUP BY level
ORDER BY level;

-- 步驟 5：查看更新後的資料範例
SELECT id, name, role, level
FROM users
ORDER BY level, name
LIMIT 20;
