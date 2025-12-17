# Supabase users 表結構檢查

## 問題描述

users 表沒有成功推送到 Git，需要檢查欄位定義。

## users 表應有的欄位

根據代碼和遷移文件，users 表應該包含以下欄位：

### 基本欄位（初始遷移）
- `id` BIGINT PRIMARY KEY - 用戶 ID
- `timestamp` TIMESTAMPTZ DEFAULT NOW() - 時間戳記
- `name` TEXT NOT NULL - 姓名
- `role` TEXT - 角色

### 後續添加的欄位
- `level` INTEGER DEFAULT 4 CHECK (level >= 1 AND level <= 4) - 層級（1-4）
- `mail` TEXT - 電子郵件
- `employee_id` TEXT - 員工 ID
- `headshot` TEXT - 頭像/照片連結

### 已移除的欄位
- `avatar` TEXT - 已被 `level` 取代

## 遷移文件順序

1. `20251212134638_init.sql` - 創建 users 和 tasks 表（基本結構）
2. `20251212170000_merge_personnel_to_users.sql` - 添加 mail, employee_id, headshot
3. `20251213000000_change_avatar_to_level.sql` - 添加 level，移除 avatar
4. `20251213120000_update_level5_to_level4.sql` - 更新 level 5 為 4
5. `20251214000000_fix_users_table_structure.sql` - **新增：修復表結構**

## 檢查步驟

### 1. 檢查遷移文件是否在 Git 中

```bash
git ls-files supabase/migrations/
```

應該看到所有 .sql 文件。

### 2. 檢查 users 表定義

查看 `supabase/migrations/20251212134638_init.sql`：

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  role TEXT,
  avatar TEXT DEFAULT '👤'  -- 這個欄位後續會被移除
);
```

### 3. 檢查後續遷移文件

確保以下遷移文件存在並包含正確的 ALTER TABLE 語句：

- `20251212170000_merge_personnel_to_users.sql` - 添加 mail, employee_id, headshot
- `20251213000000_change_avatar_to_level.sql` - 添加 level，移除 avatar
- `20251214000000_fix_users_table_structure.sql` - 修復表結構

## 修復方案

### 方案 1：使用新的遷移文件（推薦）

已創建 `20251214000000_fix_users_table_structure.sql`，這個文件會：

1. 確保所有必要欄位都存在
2. 設定正確的預設值
3. 建立必要的索引
4. 驗證表結構

### 方案 2：檢查並手動修復

如果遷移文件有問題，可以：

1. 檢查每個遷移文件是否有語法錯誤
2. 確保欄位名稱正確（注意大小寫）
3. 確保 CHECK 約束正確

## 推送步驟

1. **檢查文件狀態**
   ```bash
   git status supabase/
   ```

2. **添加所有 Supabase 文件**
   ```bash
   git add supabase/
   ```

3. **檢查暫存區**
   ```bash
   git ls-files supabase/ | findstr /v ".branches .temp"
   ```

4. **提交變更**
   ```bash
   git commit -m "修復 users 表結構，添加所有必要欄位"
   ```

5. **推送到遠端**
   ```bash
   git push
   ```

## 驗證

推送後，在 GitHub 上檢查：

1. `supabase/migrations/` 目錄是否存在
2. 所有遷移文件是否都在
3. `20251214000000_fix_users_table_structure.sql` 是否存在
4. 文件內容是否正確

## 注意事項

- `.gitignore` 中已排除 `supabase/.branches` 和 `supabase/.temp`
- 確保 `supabase/config.toml` 也被包含
- 確保 `supabase/seed.sql` 也被包含（如果存在）
