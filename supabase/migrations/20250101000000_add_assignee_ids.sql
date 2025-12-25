-- ========================================
-- 添加 assignee_ids 欄位到 tasks 表
-- 用於支援多個承辦人
-- ========================================

-- 添加 assignee_ids 欄位（JSONB 類型，用於儲存多個承辦人 ID）
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assignee_ids JSONB DEFAULT '[]'::jsonb;

-- 為現有資料遷移：如果有 assignee_id，將其轉換為 assignee_ids 陣列
UPDATE tasks 
SET assignee_ids = CASE 
  WHEN assignee_id IS NOT NULL THEN jsonb_build_array(assignee_id)
  ELSE '[]'::jsonb
END
WHERE assignee_ids IS NULL OR assignee_ids = '[]'::jsonb;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_ids ON tasks USING GIN (assignee_ids);

