-- ========================================
-- 為 personnel 表的 ID 欄位生成亂數
-- ========================================

-- 步驟 1：如果 ID 欄位不存在，先添加它（personnel 表已有 id，此步驟可跳過）
-- personnel 表已經有 SERIAL PRIMARY KEY id，所以不需要添加

-- 步驟 2：為 ID 為 NULL 的記錄生成 10 位數亂數 ID（personnel 表使用 SERIAL，不會有 NULL）
-- 此遷移對 personnel 表不適用，因為它已經有 SERIAL id
-- 如果表不存在，跳過此遷移
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'personnel') THEN
    -- personnel 表已經有 SERIAL id，不需要此操作
    RAISE NOTICE 'personnel 表已存在且已有 SERIAL id，跳過此遷移';
  ELSE
    RAISE NOTICE 'personnel 表不存在，跳過此遷移';
  END IF;
END $$;

-- 步驟 3-6：personnel 表已經有 SERIAL PRIMARY KEY，不需要這些操作
-- 此遷移文件已過時，因為 personnel 表使用 SERIAL id，不會有 NULL 或重複問題
