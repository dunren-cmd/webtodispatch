-- ========================================
-- 檢查 PersonnelData 表的實際欄位名稱
-- ========================================

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;
