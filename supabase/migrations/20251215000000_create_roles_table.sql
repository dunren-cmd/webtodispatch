-- ========================================
-- 創建 roles 表並建立與 users 表的一對多關聯
-- roles (一) -> users (多)
-- users.role 欄位對應到 roles.id
-- ========================================

-- 步驟 1：建立 roles 表格（角色表）
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Briefcase',
  color TEXT DEFAULT 'bg-blue-100 text-blue-700',
  level INTEGER DEFAULT 4 CHECK (level >= 1 AND level <= 4),
  webhook TEXT,  -- Webhook URL（可選）
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 步驟 2：從 users 表中提取不重複的角色，插入到 roles 表
-- 使用 INSERT ... ON CONFLICT 避免重複插入
INSERT INTO roles (id, name, icon_name, color, level, is_default)
SELECT DISTINCT
  role as id,
  role as name,  -- 暫時使用 role 值作為名稱，之後可以手動更新
  'Briefcase' as icon_name,
  'bg-blue-100 text-blue-700' as color,
  4 as level,  -- 預設為員工層級
  false as is_default
FROM users
WHERE role IS NOT NULL 
  AND role != ''
  AND role NOT IN (SELECT id FROM roles)
ON CONFLICT (id) DO NOTHING;

-- 步驟 3：建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_roles_is_default ON roles(is_default);
CREATE INDEX IF NOT EXISTS idx_roles_webhook ON roles(webhook) WHERE webhook IS NOT NULL;

-- 步驟 4：在 users 表上建立外鍵約束（一對多關聯）
-- 注意：如果 users.role 中有不存在的角色值，需要先處理
-- 這裡使用可選的外鍵（允許 NULL），因為可能有些用戶沒有角色

-- 先檢查是否有無效的角色值
DO $$
DECLARE
  invalid_roles TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT u.role)
  INTO invalid_roles
  FROM users u
  WHERE u.role IS NOT NULL 
    AND u.role != ''
    AND NOT EXISTS (SELECT 1 FROM roles r WHERE r.id = u.role);
  
  IF invalid_roles IS NOT NULL AND array_length(invalid_roles, 1) > 0 THEN
    RAISE NOTICE '發現無效的角色值，將自動創建這些角色: %', invalid_roles;
    -- 自動創建缺失的角色
    INSERT INTO roles (id, name, icon_name, color, level, is_default)
    SELECT DISTINCT
      role as id,
      role as name,
      'Briefcase' as icon_name,
      'bg-gray-100 text-gray-700' as color,
      4 as level,
      false as is_default
    FROM users
    WHERE role IS NOT NULL 
      AND role != ''
      AND role = ANY(invalid_roles)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 建立外鍵約束（一對多關聯）
-- users.role -> roles.id
-- 使用 ON DELETE SET NULL，當角色被刪除時，將用戶的角色設為 NULL
ALTER TABLE users 
  ADD CONSTRAINT fk_users_role 
  FOREIGN KEY (role) 
  REFERENCES roles(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

-- 步驟 5：啟用 Row Level Security (RLS)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- 步驟 6：設定 RLS 政策（允許所有人讀寫，可根據需求調整）
CREATE POLICY "Allow all operations on roles" ON roles
  FOR ALL USING (true) WITH CHECK (true);

-- 如果需要更嚴格的安全政策，可以使用以下替代方案：
-- CREATE POLICY "Allow public read" ON roles FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON roles FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON roles FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON roles FOR DELETE USING (true);

-- 步驟 7：創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 如果觸發器已存在，先刪除
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;

CREATE TRIGGER update_roles_updated_at 
  BEFORE UPDATE ON roles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 步驟 8：驗證表結構和關聯
-- 查看 roles 表結構
SELECT 
  'roles 表結構' as info,
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'roles'
ORDER BY ordinal_position;

-- 查看外鍵約束
SELECT
  '外鍵關聯' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users'
  AND kcu.column_name = 'role';

-- 步驟 9：統計資料
-- 統計每個角色的用戶數量（驗證一對多關聯）
SELECT 
  '角色統計' as info,
  r.id as role_id,
  r.name as role_name,
  COUNT(u.id) as user_count
FROM roles r
LEFT JOIN users u ON u.role = r.id
GROUP BY r.id, r.name
ORDER BY user_count DESC;
