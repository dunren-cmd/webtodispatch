-- ========================================
-- 資料導出 SQL 查詢
-- 在 Supabase Studio SQL Editor 中執行這些查詢來生成 INSERT 語句
-- ========================================
-- 使用說明：
-- 1. 在 Supabase Studio 中打開 SQL Editor
-- 2. 執行下面的查詢
-- 3. 複製查詢結果（INSERT 語句）
-- 4. 貼到 supabase/seed.sql 文件中對應的位置
-- ========================================

-- ========================================
-- 1. 導出 roles 表資料（使用 ON CONFLICT）
-- ========================================
-- 執行此查詢後，複製結果並貼到 seed.sql 中

SELECT 
  'INSERT INTO roles (id, name, icon_name, color, level, webhook, is_default, created_at, updated_at) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(icon_name), 'NULL') || ', ' ||
  COALESCE(quote_literal(color), 'NULL') || ', ' ||
  COALESCE(level::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(webhook), 'NULL') || ', ' ||
  COALESCE(is_default::text, 'false') || ', ' ||
  COALESCE(quote_literal(created_at::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(updated_at::text), 'NULL') || ') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon_name = EXCLUDED.icon_name, color = EXCLUDED.color, level = EXCLUDED.level, webhook = EXCLUDED.webhook, is_default = EXCLUDED.is_default, updated_at = EXCLUDED.updated_at;' AS insert_statement
FROM roles 
ORDER BY id;

-- ========================================
-- 2. 導出 users 表資料（使用 ON CONFLICT）
-- ========================================
-- 執行此查詢後，複製結果並貼到 seed.sql 中

SELECT 
  'INSERT INTO users (id, name, role, level, mail, employee_id, headshot) VALUES (' ||
  id::text || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(role), 'NULL') || ', ' ||
  COALESCE(level::text, '4') || ', ' ||
  COALESCE(quote_literal(mail), 'NULL') || ', ' ||
  COALESCE(quote_literal(employee_id), 'NULL') || ', ' ||
  COALESCE(quote_literal(headshot), 'NULL') || ') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, level = EXCLUDED.level, mail = EXCLUDED.mail, employee_id = EXCLUDED.employee_id, headshot = EXCLUDED.headshot;' AS insert_statement
FROM users 
ORDER BY id;

-- ========================================
-- 3. 導出 tasks 表資料（使用 ON CONFLICT）
-- ========================================
-- 執行此查詢後，複製結果並貼到 seed.sql 中

SELECT 
  'INSERT INTO tasks (id, title, description, assigner_id, assignee_id, role_category, status, evidence, created_at, updated_at) VALUES (' ||
  id::text || ', ' ||
  quote_literal(title) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  COALESCE(assigner_id::text, 'NULL') || ', ' ||
  COALESCE(assignee_id::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(role_category), 'NULL') || ', ' ||
  COALESCE(quote_literal(status), 'NULL') || ', ' ||
  COALESCE(quote_literal(evidence::text), '''{}''') || ', ' ||
  COALESCE(quote_literal(created_at::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(updated_at::text), 'NULL') || ') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, assigner_id = EXCLUDED.assigner_id, assignee_id = EXCLUDED.assignee_id, role_category = EXCLUDED.role_category, status = EXCLUDED.status, evidence = EXCLUDED.evidence, updated_at = EXCLUDED.updated_at;' AS insert_statement
FROM tasks 
ORDER BY id;

-- ========================================
-- 4. 一次性導出所有表的資料（使用 COPY 格式）
-- ========================================
-- 注意：COPY 格式需要特殊處理，建議使用上面的 INSERT 格式

-- COPY roles TO STDOUT WITH CSV HEADER;
-- COPY users TO STDOUT WITH CSV HEADER;
-- COPY tasks TO STDOUT WITH CSV HEADER;

-- ========================================
-- 5. 使用 ON CONFLICT 避免重複插入
-- ========================================
-- 如果資料可能已存在，使用以下格式：

-- INSERT INTO roles (id, name, icon_name, color, level, webhook, is_default, created_at, updated_at)
-- VALUES (...)
-- ON CONFLICT (id) DO UPDATE SET
--   name = EXCLUDED.name,
--   icon_name = EXCLUDED.icon_name,
--   color = EXCLUDED.color,
--   level = EXCLUDED.level,
--   webhook = EXCLUDED.webhook,
--   is_default = EXCLUDED.is_default,
--   updated_at = EXCLUDED.updated_at;
