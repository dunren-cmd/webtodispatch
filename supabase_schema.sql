-- ========================================
-- Supabase 資料庫結構
-- 任務交辦系統所需的表格
-- ========================================

-- 建立 users 表格（用戶表）
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  role TEXT,
  avatar TEXT DEFAULT '👤'
);

-- 建立 tasks 表格（任務表）
CREATE TABLE IF NOT EXISTS tasks (
  id BIGINT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  assigner_id BIGINT,
  assigner_name TEXT,
  assignee_id BIGINT,
  assignee_name TEXT,
  collaborator_ids JSONB DEFAULT '[]'::jsonb,
  role_category TEXT,
  plan_date DATE,
  interim_date DATE,
  final_date DATE,
  status TEXT DEFAULT 'pending',
  assignee_response TEXT,
  evidence JSONB DEFAULT '[]'::jsonb
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_tasks_role_category ON tasks(role_category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigner_id ON tasks(assigner_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 啟用 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 設定 RLS 政策（允許所有人讀寫，可根據需求調整）
-- 注意：這是一個寬鬆的政策，在生產環境中應該根據實際需求調整
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- 如果需要更嚴格的安全政策，可以使用以下替代方案：
-- CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON users FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON users FOR DELETE USING (true);
