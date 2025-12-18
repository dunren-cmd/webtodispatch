-- ========================================
-- 串聯 users 和 personnel 表
-- ========================================

-- 步驟 1：personnel 表已經有 SERIAL PRIMARY KEY id，不需要額外操作
-- personnel 表在 20251212150000_create_personnel.sql 中已經創建，包含 id SERIAL PRIMARY KEY

-- 步驟 2：為 users 表添加 employee_id 欄位來關聯 PersonnelData
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- 步驟 3：建立視圖來合併兩個表的資料（包含 email）
CREATE OR REPLACE VIEW user_with_personnel AS
SELECT 
  u.id as user_id,
  u.timestamp,
  u.name,
  u.role,
  u.avatar,
  u.employee_id,
  p.id as personnel_id,
  p.employee_id as personnel_employee_id,
  p.email,
  p.drive_link,
  p.role as personnel_role
FROM users u
LEFT JOIN personnel p ON u.employee_id = p.employee_id;

-- 步驟 4：建立函數來取得用戶的 email（從 personnel）
CREATE OR REPLACE FUNCTION get_user_email(user_id_param BIGINT)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT p.email INTO user_email
  FROM users u
  LEFT JOIN personnel p ON u.employee_id = p.employee_id
  WHERE u.id = user_id_param;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql;
