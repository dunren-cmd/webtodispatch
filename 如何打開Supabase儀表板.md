# 如何打開 Supabase 儀表板

## 📌 重要說明

您的 Supabase 服務已經在運行中！**不需要安裝 Supabase CLI**。

## 🌐 打開 Supabase Studio（儀表板）

### 方法 1：本地訪問（同一台電腦）

在瀏覽器中打開：
```
http://localhost:54323
```

### 方法 2：遠端訪問（從其他電腦）

在瀏覽器中打開：
```
http://192.168.62.101:54323
```

## 🔧 執行 SQL 移除外鍵約束

### 步驟 1：打開 SQL Editor

1. 在 Supabase Studio 中，點擊左側選單的 **SQL Editor**
2. 點擊 **New query** 按鈕

### 步驟 2：執行 SQL

複製並貼上以下 SQL：

```sql
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS fk_users_role;
```

### 步驟 3：執行查詢

- 點擊 **Run** 按鈕，或
- 按快捷鍵：`Ctrl+Enter`（Windows）或 `Cmd+Enter`（Mac）

### 步驟 4：驗證（可選）

執行以下查詢來確認外鍵約束已移除（應該沒有任何結果）：

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users'
  AND kcu.column_name = 'role';
```

如果查詢結果為空，表示外鍵約束已成功移除！

## ❓ 關於 Supabase CLI

**您不需要安裝 Supabase CLI**，因為：
- ✅ Supabase 服務已經在運行
- ✅ 可以直接通過瀏覽器訪問儀表板
- ✅ 所有操作都可以在 Web 界面完成

CLI 只是用來管理 Supabase 服務的工具，不是必需的。

