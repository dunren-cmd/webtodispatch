-- ========================================
-- 為 PersonnelData 表的 ID 欄位生成亂數
-- ========================================

-- 步驟 1：如果 ID 欄位不存在，先添加它
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'PersonnelData' AND column_name = 'id'
  ) THEN
    ALTER TABLE "PersonnelData" ADD COLUMN id BIGINT;
  END IF;
END $$;

-- 步驟 2：為 ID 為 NULL 的記錄生成 10 位數亂數 ID
UPDATE "PersonnelData"
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
WHERE id IS NULL;

-- 步驟 3：處理重複的 ID（如果有的話）
DO $$
DECLARE
  rec RECORD;
  new_id BIGINT;
  counter INTEGER;
BEGIN
  -- 找出所有重複的 ID
  FOR rec IN 
    SELECT employee_id, id, COUNT(*) OVER (PARTITION BY id) as cnt
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
    
    -- 更新第一個重複的記錄
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

-- 步驟 4：確保所有記錄都有 ID
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count 
  FROM "PersonnelData" 
  WHERE id IS NULL;
  
  IF null_count > 0 THEN
    RAISE NOTICE '仍有 % 筆記錄的 ID 為 NULL，將再次生成', null_count;
    
    UPDATE "PersonnelData"
    SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT
    WHERE id IS NULL;
  END IF;
END $$;

-- 步驟 5：設置 ID 為主鍵（如果還沒有）
DO $$
BEGIN
  -- 先檢查是否已有主鍵
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'PersonnelData_pkey'
  ) THEN
    -- 移除可能的重複記錄（只保留第一個）
    DELETE FROM "PersonnelData" a
    USING "PersonnelData" b
    WHERE a.ctid < b.ctid 
      AND a.id = b.id;
    
    -- 設置主鍵
    ALTER TABLE "PersonnelData" ADD PRIMARY KEY (id);
  END IF;
END $$;

-- 步驟 6：驗證結果
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
