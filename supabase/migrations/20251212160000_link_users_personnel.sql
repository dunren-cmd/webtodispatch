-- ========================================
-- 串聯 users 和 PersonnelData 表
-- ========================================

-- 步驟 1：為 PersonnelData 表的 ID 欄位生成亂數（如果 ID 為 NULL）
-- 注意：假設 PersonnelData 表已經存在，如果表名不同請調整
-- 如果 ID 欄位不存在，先添加它
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;

-- 為 PersonnelData 表中 ID 為 NULL 的記錄生成亂數 ID
-- 使用 PostgreSQL 的 random() 函數生成 10 位數的亂數
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- 如果有多筆記錄 ID 相同，重新生成（確保唯一性）
DO $$
DECLARE
  rec RECORD;
  new_id BIGINT;
BEGIN
  FOR rec IN 
    SELECT employee_id, id 
    FROM "PersonnelData" 
    WHERE id IN (
      SELECT id FROM "PersonnelData" 
      GROUP BY id 
      HAVING COUNT(*) > 1
    )
  LOOP
    LOOP
      new_id := FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "PersonnelData" WHERE id = new_id);
    END LOOP;
    UPDATE "PersonnelData" SET id = new_id WHERE employee_id = rec.employee_id;
  END LOOP;
END $$;

-- 確保 ID 欄位有唯一約束和主鍵
-- 先移除重複的 ID（如果有）
DELETE FROM "PersonnelData" a
USING "PersonnelData" b
WHERE a.ctid < b.ctid 
  AND a.id = b.id;

-- 設置 ID 為主鍵
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'PersonnelData_pkey'
  ) THEN
    ALTER TABLE "PersonnelData" ADD PRIMARY KEY (id);
  END IF;
END $$;

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
  p."role" as personnel_role
FROM users u
LEFT JOIN "PersonnelData" p ON u.employee_id = p.employee_id;

-- 步驟 4：建立函數來取得用戶的 email（從 PersonnelData）
CREATE OR REPLACE FUNCTION get_user_email(user_id_param BIGINT)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT p.email INTO user_email
  FROM users u
  LEFT JOIN "PersonnelData" p ON u.employee_id = p.employee_id
  WHERE u.id = user_id_param;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql;
