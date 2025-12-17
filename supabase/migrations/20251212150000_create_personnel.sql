-- ========================================
-- 建立 personnel 資料表
-- 用於儲存員工詳細資料
-- ========================================

-- 建立 personnel 表格
CREATE TABLE IF NOT EXISTS personnel (
  id SERIAL PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,  -- 員工編號（如：0022）
  name TEXT NOT NULL,                 -- 姓名
  role TEXT,                          -- 職稱/角色
  email TEXT,                         -- 電子郵件
  drive_link TEXT,                    -- Google Drive 連結
  timestamp TIMESTAMPTZ DEFAULT NOW()  -- 建立時間
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_personnel_employee_id ON personnel(employee_id);
CREATE INDEX IF NOT EXISTS idx_personnel_email ON personnel(email);
CREATE INDEX IF NOT EXISTS idx_personnel_role ON personnel(role);

-- 啟用 Row Level Security (RLS)
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

-- 設定 RLS 政策（允許所有人讀寫）
CREATE POLICY "Allow all operations on personnel" ON personnel
  FOR ALL USING (true) WITH CHECK (true);

-- 插入範例資料（測試用）
-- INSERT INTO personnel (employee_id, name, role, email, drive_link) 
-- VALUES ('0022', '程于宣', '護理師', 'shan3636@gmail.com', 'https://drive.google.com/file/d/1VuIpVFllcgA3thkOWzl1v796gV08-gUL/view');
