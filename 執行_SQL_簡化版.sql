-- ========================================
-- 簡化版 SQL：分段執行，避免一次性執行過多操作
-- 請在 Supabase Dashboard 的 SQL Editor 中分段執行
-- ========================================

-- ========================================
-- 第一部分：為 PersonnelData 添加 ID 欄位並生成亂數
-- ========================================

-- 步驟 1：添加 ID 欄位（如果不存在）
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;

-- 步驟 2：為 NULL 的 ID 生成亂數
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- 步驟 3：再次確保所有記錄都有 ID
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- ========================================
-- 第二部分：處理重複 ID（如果需要）
-- ========================================

-- 先檢查是否有重複的 ID
-- SELECT id, COUNT(*) as count 
-- FROM "PersonnelData" 
-- GROUP BY id 
-- HAVING COUNT(*) > 1;

-- 如果有重複，手動處理或使用以下簡化方法
-- 為每筆記錄重新生成 ID（確保唯一）
-- 注意：這會改變所有 ID，請謹慎使用
-- UPDATE "PersonnelData" SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT;

-- ========================================
-- 第三部分：設置主鍵（需要先移除重複）
-- ========================================

-- 先檢查是否有主鍵
-- SELECT conname FROM pg_constraint WHERE conrelid = 'PersonnelData'::regclass AND contype = 'p';

-- 如果沒有主鍵，先移除重複記錄（只保留第一個），然後添加主鍵
-- 注意：以下操作會刪除重複記錄，請先備份資料

-- 方法 A：使用 SERIAL（如果表是空的或可以重建）
-- ALTER TABLE "PersonnelData" DROP COLUMN IF EXISTS id;
-- ALTER TABLE "PersonnelData" ADD COLUMN id SERIAL PRIMARY KEY;

-- 方法 B：手動處理重複後添加主鍵（推薦）
-- 先刪除重複記錄（保留 ctid 最小的）
DELETE FROM "PersonnelData" a
WHERE EXISTS (
  SELECT 1 FROM "PersonnelData" b
  WHERE a.id = b.id AND a.ctid > b.ctid
);

-- 然後添加主鍵（如果還沒有）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'PersonnelData_pkey'
  ) THEN
    ALTER TABLE "PersonnelData" ADD PRIMARY KEY (id);
  END IF;
END $$;

-- ========================================
-- 第四部分：為 users 表添加 employee_id 欄位
-- ========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- ========================================
-- 第五部分：建立視圖
-- ========================================

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
  p.drive_link
FROM users u
LEFT JOIN "PersonnelData" p ON u.employee_id = p.employee_id;

-- ========================================
-- 第六部分：驗證結果
-- ========================================

-- 檢查 PersonnelData 的 ID
SELECT 
  COUNT(*) as total_records,
  COUNT(id) as records_with_id,
  COUNT(DISTINCT id) as unique_ids
FROM "PersonnelData";

-- 顯示所有記錄
SELECT id, employee_id, name, email 
FROM "PersonnelData" 
ORDER BY id;
