-- ========================================
-- 修復 users 表結構，確保所有必要欄位都存在
-- ========================================

-- 步驟 1：確保所有必要的欄位都存在
-- 如果欄位已存在，不會報錯（使用 IF NOT EXISTS）

-- 添加 mail 欄位（電子郵件）
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- 添加 level 欄位（層級：1-4，1為最高層級）
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 4 CHECK (level >= 1 AND level <= 4);

-- 添加 employee_id 欄位（員工ID）
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 添加 headshot 欄位（頭像/照片）
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 步驟 2：如果 level 欄位為 NULL，設定預設值為 4（員工）
UPDATE users SET level = 4 WHERE level IS NULL;

-- 步驟 3：確保 level 欄位不為 NULL（如果表中有資料）
-- 注意：只有在表為空或所有記錄都有 level 值時才執行
-- ALTER TABLE users ALTER COLUMN level SET NOT NULL;

-- 步驟 4：刪除舊的 avatar 欄位（如果存在且不再需要）
-- 注意：如果還有重要資料，請先備份
ALTER TABLE users DROP COLUMN IF EXISTS avatar;

-- 步驟 5：建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 步驟 6：驗證表結構
-- 查看 users 表的所有欄位
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 步驟 7：檢查資料完整性
-- 統計各欄位的資料完整性
SELECT 
  COUNT(*) as total_users,
  COUNT(name) as users_with_name,
  COUNT(role) as users_with_role,
  COUNT(mail) as users_with_mail,
  COUNT(level) as users_with_level,
  COUNT(employee_id) as users_with_employee_id,
  COUNT(headshot) as users_with_headshot
FROM users;
