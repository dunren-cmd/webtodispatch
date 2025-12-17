-- ========================================
-- 將 users 表的 avatar 欄位改為 level（層級）
-- 層級：1-5，第1層為最高，依序到第5層
-- ========================================

-- 步驟 1：檢查當前欄位結構
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY column_name;

-- 步驟 2：新增 level 欄位（如果不存在）
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 5 CHECK (level >= 1 AND level <= 5);

-- 步驟 3：如果有現有資料，設定預設層級為 5
UPDATE users SET level = 5 WHERE level IS NULL;

-- 步驟 4：將 level 設為 NOT NULL（確保所有記錄都有層級）
ALTER TABLE users ALTER COLUMN level SET NOT NULL;

-- 步驟 5：刪除舊的 avatar 欄位（如果存在且不需要保留）
-- 注意：如果資料庫中還有重要資料，請先備份
ALTER TABLE users DROP COLUMN IF EXISTS avatar;

-- 步驟 6：為 level 欄位建立索引（如果需要根據層級查詢）
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);

-- 步驟 7：驗證修改後的結構
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('level', 'avatar')
ORDER BY column_name;

-- 步驟 8：查看現有資料
SELECT id, name, role, level FROM users LIMIT 10;
