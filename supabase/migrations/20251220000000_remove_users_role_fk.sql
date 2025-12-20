-- ========================================
-- 移除 users.role 的外鍵約束
-- 原因：支援多角色複選（使用逗號分隔字串儲存）
-- 多角色的值（如 "role1,role2"）無法通過單一外鍵約束檢查
-- 將在應用層進行角色驗證
-- ========================================

-- 移除外鍵約束
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS fk_users_role;

-- 驗證約束已移除
SELECT
  '外鍵約束狀態' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users'
  AND kcu.column_name = 'role';

-- 如果查詢結果為空，表示外鍵約束已成功移除

