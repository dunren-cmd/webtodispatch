-- ========================================
-- 完成設定並測試
-- PersonnelData 的 id 已經生成，現在完成關聯設定
-- ========================================

-- ========================================
-- 步驟 1：確認 users 表有 employee_id 欄位
-- ========================================

-- 檢查 users 表結構
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 如果沒有 employee_id，添加它
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- ========================================
-- 步驟 2：建立視圖（方便查詢 users 和 PersonnelData 的關聯資料）
-- ========================================

CREATE OR REPLACE VIEW user_with_personnel AS
SELECT 
  u.id as user_id,
  u.name,
  u.role,
  u.avatar,
  u.employee_id,
  p.id as personnel_id,
  p.employee_id as personnel_employee_id,
  p.email,
  p.drive_link
FROM users u
LEFT JOIN "PersonnelData" p ON u.employee_id = p.employee_id;

-- ========================================
-- 步驟 3：驗證 PersonnelData 的 id
-- ========================================

-- 檢查所有記錄是否都有 id
SELECT 
  COUNT(*) as total_records,
  COUNT(id) as records_with_id,
  COUNT(*) - COUNT(id) as records_without_id,
  COUNT(DISTINCT id) as unique_ids
FROM "PersonnelData";

-- 顯示所有記錄（確認 id 已生成）
SELECT id, employee_id, name, email 
FROM "PersonnelData" 
ORDER BY id;

-- ========================================
-- 步驟 4：測試視圖
-- ========================================

SELECT * FROM user_with_personnel LIMIT 5;

-- ========================================
-- 步驟 5：手動設定 users 和 PersonnelData 的關聯（範例）
-- ========================================

-- 注意：請根據實際資料調整
-- 範例：將 users.id=1 關聯到 PersonnelData.employee_id='0022'
-- UPDATE users 
-- SET employee_id = '0022' 
-- WHERE id = 1;

-- 查看 users 表的資料，確認需要關聯哪些記錄
SELECT id, name, role, employee_id FROM users;

-- 查看 PersonnelData 表的 employee_id，確認可以關聯哪些記錄
SELECT employee_id, name, email FROM "PersonnelData";
