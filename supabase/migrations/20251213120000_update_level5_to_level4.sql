-- ========================================
-- 將 users 表中 level = 5 的資料改為 level = 4（員工）
-- 因為層級 4 和 5 都顯示為「員工」
-- ========================================

-- 將所有 level = 5 的資料改為 level = 4
UPDATE users
SET level = 4
WHERE level = 5;

-- 注意：此 migration 只執行資料更新，不包含查詢語句
-- 如果需要驗證結果，請在 Supabase Studio 中執行查詢
