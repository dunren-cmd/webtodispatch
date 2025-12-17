-- ========================================
-- 逐步執行 SQL（分為多個步驟）
-- 如果完整版執行失敗，請按順序執行以下步驟
-- ========================================

-- ========================================
-- 步驟 1：為 PersonnelData 添加 ID 欄位
-- ========================================
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;

-- ========================================
-- 步驟 2：為所有記錄生成 ID
-- ========================================
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- ========================================
-- 步驟 3：再次生成（確保沒有 NULL）
-- ========================================
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- ========================================
-- 步驟 4：驗證 ID 是否都已生成
-- ========================================
SELECT COUNT(*) as total, COUNT(id) as with_id 
FROM "PersonnelData";

-- ========================================
-- 步驟 5：為 users 表添加 employee_id 欄位
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- ========================================
-- 步驟 6：建立索引
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- ========================================
-- 步驟 7：建立視圖
-- ========================================
CREATE OR REPLACE VIEW user_with_personnel AS
SELECT 
  u.id as user_id,
  u.name,
  u.role,
  u.employee_id,
  p.id as personnel_id,
  p.employee_id as personnel_employee_id,
  p.email
FROM users u
LEFT JOIN "PersonnelData" p ON u.employee_id = p.employee_id;

-- ========================================
-- 步驟 8：檢查結果
-- ========================================
SELECT id, employee_id, name, email FROM "PersonnelData" ORDER BY id;
