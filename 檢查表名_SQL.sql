-- ========================================
-- 先執行這個 SQL 檢查 PersonnelData 表是否存在
-- ========================================

-- 方法 1：檢查所有包含 personnel 的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%ersonnel%' OR table_name LIKE '%Personnel%')
ORDER BY table_name;

-- 方法 2：列出所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 方法 3：檢查 PersonnelData 表的欄位（如果表存在）
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;
