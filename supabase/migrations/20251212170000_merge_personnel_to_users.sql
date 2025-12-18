-- ========================================
-- 合併 personnel 到 users 表
-- ========================================

-- ========================================
-- 步驟 1：為 users 表添加新欄位（必須按順序執行）
-- ========================================

-- 添加 employee_id 欄位（如果還沒有）
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 添加 Mail 欄位（email）
ALTER TABLE users ADD COLUMN IF NOT EXISTS mail TEXT;

-- 添加 headshot 欄位（頭像/照片）
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot TEXT;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail);

-- ========================================
-- 步驟 2：檢查 personnel 表的結構
-- ========================================

-- 先查看 personnel 的欄位名稱（確認實際欄位名稱）
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'personnel'
ORDER BY ordinal_position;

-- ========================================
-- 步驟 3：合併資料策略
-- ========================================

-- 方法 A：如果 users 表是空的或可以清空
-- 先清空 users 表（謹慎使用！）
-- TRUNCATE TABLE users;

-- 方法 B：使用 INSERT ... ON CONFLICT（推薦）
-- 如果 users.id 已存在，則更新；不存在則插入

-- 注意：根據實際的 personnel 欄位名稱調整
-- personnel 表有：id, employee_id, name, role, email, drive_link, timestamp 等欄位

INSERT INTO users (id, name, role, mail, headshot, employee_id, timestamp)
SELECT 
  p.id,
  p.name,
  p.role,
  p.email as mail,
  p.drive_link as headshot,  -- 如果 headshot 是 Google Drive 連結
  p.employee_id,
  COALESCE(p.timestamp, NOW()) as timestamp
FROM personnel p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot,
  employee_id = EXCLUDED.employee_id;

-- ========================================
-- 步驟 4：如果欄位名稱不同，使用以下替代方案
-- ========================================

-- 備註：personnel 表使用 role 欄位（不是 job_title）

-- ========================================
-- 步驟 5：驗證合併結果
-- ========================================

-- 檢查合併後的資料
SELECT 
  u.id,
  u.name,
  u.role,
  u.mail,
  u.headshot,
  u.employee_id,
  p.employee_id as personnel_employee_id
FROM users u
LEFT JOIN personnel p ON u.employee_id = p.employee_id
ORDER BY u.id;

-- 統計
SELECT 
  COUNT(*) as total_users,
  COUNT(mail) as users_with_mail,
  COUNT(headshot) as users_with_headshot,
  COUNT(employee_id) as users_with_employee_id
FROM users;
