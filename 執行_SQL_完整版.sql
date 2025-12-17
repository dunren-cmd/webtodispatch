-- ========================================
-- 完整 SQL 執行檔：為 PersonnelData 生成 ID 並串聯 users 表
-- 請在 Supabase Dashboard 的 SQL Editor 中執行
-- ========================================

-- ========================================
-- 第一部分：為 PersonnelData 表的 ID 欄位生成亂數
-- ========================================

-- 步驟 1：如果 ID 欄位不存在，先添加它
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;

-- 步驟 2：為 ID 為 NULL 的記錄生成 10 位數亂數 ID
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- 步驟 3：處理重複的 ID（確保唯一性）
DO $$
DECLARE
  rec RECORD;
  new_id BIGINT;
  counter INTEGER;
BEGIN
  -- 找出所有重複的 ID
  FOR rec IN 
    SELECT DISTINCT employee_id, id
    FROM "PersonnelData" 
    WHERE id IN (
      SELECT id FROM "PersonnelData" 
      GROUP BY id 
      HAVING COUNT(*) > 1
    )
    ORDER BY employee_id
  LOOP
    -- 為每個重複的 ID 生成新的唯一 ID
    counter := 0;
    LOOP
      new_id := FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT;
      
      -- 檢查新 ID 是否已存在
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "PersonnelData" WHERE id = new_id
      );
      
      counter := counter + 1;
      -- 避免無限迴圈
      IF counter > 100 THEN
        RAISE EXCEPTION '無法生成唯一 ID，請重試';
      END IF;
    END LOOP;
    
    -- 更新第一個重複的記錄（使用 employee_id）
    UPDATE "PersonnelData" 
    SET id = new_id 
    WHERE employee_id = rec.employee_id 
      AND id = rec.id
      AND ctid = (
        SELECT ctid FROM "PersonnelData" 
        WHERE employee_id = rec.employee_id 
          AND id = rec.id 
        LIMIT 1
      );
  END LOOP;
END $$;

-- 步驟 4：再次確保所有記錄都有 ID
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- 步驟 5：設置 ID 為主鍵（如果還沒有）
DO $$
BEGIN
  -- 先移除可能的重複記錄（只保留第一個）
  DELETE FROM "PersonnelData" a
  WHERE EXISTS (
    SELECT 1 FROM "PersonnelData" b
    WHERE a.id = b.id AND a.ctid > b.ctid
  );
  
  -- 設置主鍵
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'PersonnelData_pkey'
  ) THEN
    ALTER TABLE "PersonnelData" ADD PRIMARY KEY (id);
  END IF;
END $$;

-- ========================================
-- 第二部分：串聯 users 和 PersonnelData 表
-- ========================================

-- 步驟 6：為 users 表添加 employee_id 欄位來關聯 PersonnelData
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

-- 步驟 7：建立視圖來合併兩個表的資料（包含 email）
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

-- 步驟 8：建立函數來取得用戶的 email（從 PersonnelData）
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

-- ========================================
-- 第三部分：驗證結果
-- ========================================

-- 驗證 PersonnelData 的 ID 是否都已生成
SELECT 
  COUNT(*) as total_records,
  COUNT(id) as records_with_id,
  COUNT(*) - COUNT(id) as records_without_id,
  COUNT(DISTINCT id) as unique_ids
FROM "PersonnelData";

-- 顯示所有記錄的 ID（用於確認）
SELECT id, employee_id, name, email 
FROM "PersonnelData" 
ORDER BY id;

-- 測試視圖
SELECT * FROM user_with_personnel LIMIT 5;

-- 測試函數（請將 1 替換為實際的用戶 ID）
-- SELECT get_user_email(1);
