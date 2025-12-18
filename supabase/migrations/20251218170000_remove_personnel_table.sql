-- ========================================
-- 移除 personnel 表及其相關依賴
-- personnel 表已廢棄，資料已合併到 users 表
-- ========================================

-- ========================================
-- 步驟 1：刪除依賴 personnel 表的視圖
-- ========================================

-- 刪除 user_with_personnel 視圖（依賴 personnel 表）
DROP VIEW IF EXISTS user_with_personnel;

-- ========================================
-- 步驟 2：刪除依賴 personnel 表的函數
-- ========================================

-- 刪除 get_user_email 函數（依賴 personnel 表）
DROP FUNCTION IF EXISTS get_user_email(BIGINT);

-- ========================================
-- 步驟 3：刪除 personnel 表
-- ========================================

-- 刪除 personnel 表
-- 注意：此操作會永久刪除表中的所有資料
-- 如果資料已合併到 users 表，可以安全刪除
DROP TABLE IF EXISTS personnel CASCADE;

-- ========================================
-- 步驟 4：驗證移除結果
-- ========================================

-- 檢查表是否已刪除
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'personnel'
  ) THEN
    RAISE NOTICE '警告：personnel 表仍然存在';
  ELSE
    RAISE NOTICE '✅ personnel 表已成功移除';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'user_with_personnel'
  ) THEN
    RAISE NOTICE '警告：user_with_personnel 視圖仍然存在';
  ELSE
    RAISE NOTICE '✅ user_with_personnel 視圖已成功移除';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'get_user_email'
  ) THEN
    RAISE NOTICE '警告：get_user_email 函數仍然存在';
  ELSE
    RAISE NOTICE '✅ get_user_email 函數已成功移除';
  END IF;
END $$;
