-- ========================================
-- 匯入 personnel 資料
-- 使用此 SQL 可以直接匯入資料
-- ========================================

-- 方法 1：直接插入（如果 employee_id 不存在）
INSERT INTO personnel (employee_id, name, role, email, drive_link) 
VALUES ('0022', '程于宣', '護理師', 'shan3636@gmail.com', 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view');

-- 方法 2：如果 employee_id 已存在，則更新（推薦）
INSERT INTO personnel (employee_id, name, role, email, drive_link) 
VALUES ('0022', '程于宣', '護理師', 'shan3636@gmail.com', 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view')
ON CONFLICT (employee_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  email = EXCLUDED.email,
  drive_link = EXCLUDED.drive_link;

-- 驗證匯入結果
SELECT * FROM personnel WHERE employee_id = '0022';
