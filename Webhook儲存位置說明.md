# Webhook 儲存位置說明

## 目前狀態

### 當前儲存位置：**瀏覽器 localStorage**

目前 Webhook URL 是存儲在瀏覽器的 **localStorage** 中，而不是 Supabase 資料庫。

**儲存方式：**
- 通過 `saveCustomRoles()` 函數將角色資料（包括 webhook）保存到 `localStorage.getItem('custom_roles')`
- 資料格式：JSON 字串
- 位置：瀏覽器本地儲存

**優點：**
- 快速存取
- 不需要資料庫查詢
- 簡單易用

**缺點：**
- 只存在單一瀏覽器中
- 清除瀏覽器資料會丟失
- 無法跨裝置同步
- 無法在後端使用

## 如果要存儲在 Supabase

### 方案 1：創建 roles 表（推薦）

在 Supabase 中創建一個 `roles` 表來存儲角色資訊和 Webhook：

```sql
-- 創建 roles 表
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Briefcase',
  color TEXT DEFAULT 'bg-blue-100 text-blue-700',
  level INTEGER DEFAULT 4 CHECK (level >= 1 AND level <= 4),
  webhook TEXT,  -- Webhook URL
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);
CREATE INDEX IF NOT EXISTS idx_roles_is_default ON roles(is_default);

-- 啟用 RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS 政策（允許所有人讀寫）
CREATE POLICY "Allow all operations on roles" ON roles
  FOR ALL USING (true) WITH CHECK (true);
```

**優點：**
- 集中管理角色資料
- 可以跨裝置同步
- 可以在後端使用
- 資料持久化

### 方案 2：在 users 表中添加 webhook 欄位（不推薦）

雖然可以在 users 表中添加 webhook 欄位，但這不太合理，因為：
- Webhook 應該是角色層級的設定，不是用戶層級
- 同一個角色的所有用戶應該共享同一個 Webhook

### 方案 3：混合方案

- 角色基本資訊存在 Supabase
- Webhook 存在 localStorage（如果只是前端使用）

## 建議

**如果需要在後端使用 Webhook（例如發送通知），建議使用方案 1：創建 roles 表**

這樣可以：
1. 在 Google Apps Script (Code.gs) 中查詢角色的 Webhook
2. 當任務指派時，根據角色發送 Webhook 通知
3. 統一管理所有角色的 Webhook

## 遷移步驟

如果要遷移到 Supabase：

1. **創建遷移文件**
   ```sql
   -- supabase/migrations/20251215000000_create_roles_table.sql
   CREATE TABLE IF NOT EXISTS roles (...);
   ```

2. **更新前端代碼**
   - 創建 API 函數來讀寫 roles 表
   - 更新 `loadCustomRoles()` 從 Supabase 讀取
   - 更新 `saveCustomRoles()` 寫入 Supabase

3. **遷移現有資料**
   - 將 localStorage 中的角色資料匯出
   - 批量插入到 Supabase roles 表

## 當前代碼位置

**儲存函數：**
- `src/App.tsx` 第 128 行：`saveCustomRoles()`
- 儲存到：`localStorage.setItem('custom_roles', JSON.stringify(customRoles))`

**載入函數：**
- `src/App.tsx` 第 105 行：`loadCustomRoles()`
- 從：`localStorage.getItem('custom_roles')` 讀取
