# 使用 Table Editor 手動添加欄位（如果 SQL 執行失敗）

如果 SQL Editor 出現 API 錯誤，可以使用 Table Editor 手動操作：

## 📋 步驟說明

### 方法一：使用 Table Editor 添加 ID 欄位

1. **開啟 Supabase Dashboard**
   - 前往：`http://192.168.62.101:54323`
   - 進入 **Table Editor**

2. **選擇 PersonnelData 表**
   - 在左側列表中找到 `PersonnelData` 表
   - 點擊進入

3. **添加 ID 欄位**
   - 點擊表上方的 **欄位** 或 **Columns** 按鈕
   - 點擊 **+ Add column** 或 **新增欄位**
   - 設定：
     - **Name**: `id`
     - **Type**: `int8` 或 `bigint`
     - **Default value**: 留空
     - **Is nullable**: 可以勾選（暫時允許 NULL）
   - 點擊 **Save** 或 **儲存**

4. **生成 ID 值**
   - 在 Table Editor 中，為每筆記錄手動填入 ID
   - 或者稍後使用 SQL UPDATE 語句（如果 SQL 可以執行的話）

---

### 方法二：使用不同的表名嘗試

如果表名不是 `PersonnelData`，可能是：
- `personnel_data`（小寫 + 底線）
- `personnel`（小寫）
- 其他變體

**先執行檢查 SQL：**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%ersonnel%';
```

根據結果調整 SQL 中的表名。

---

### 方法三：使用 psql 命令列（如果有存取權限）

如果 Supabase 本地環境支援，可以使用命令列：

```bash
# 連接到 Supabase 資料庫
psql postgresql://postgres:postgres@192.168.68.75:54322/postgres

# 執行 SQL
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;
```

---

## 🔍 診斷步驟

### 1. 檢查表是否存在

在 SQL Editor 執行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

查看結果中是否有 PersonnelData 相關的表。

### 2. 檢查表結構

如果表存在，檢查欄位：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData';
```

### 3. 嘗試簡單的 SELECT

```sql
SELECT * FROM "PersonnelData" LIMIT 1;
```

如果這個可以執行，表示表存在且可存取。

---

## ⚠️ 可能的問題

### 問題 1：表名大小寫

PostgreSQL 對大小寫敏感。如果建立表時沒有用引號，表名可能是小寫的。

**解決方法：**
```sql
-- 嘗試小寫
ALTER TABLE personneldata ADD COLUMN IF NOT EXISTS id BIGINT;

-- 或混合大小寫（實際的表名）
ALTER TABLE "PersonnelData" ADD COLUMN IF NOT EXISTS id BIGINT;
```

### 問題 2：連接問題

API 錯誤可能是暫時的連接問題。

**解決方法：**
1. 重新整理頁面
2. 等待幾秒後重試
3. 檢查 Supabase 服務是否正常運行

### 問題 3：權限問題

**解決方法：**
- 確認使用的是 Supabase Dashboard（不是其他工具）
- 確認連接的是正確的專案

---

## ✅ 推薦方案

如果 SQL Editor 一直失敗，建議：

1. **先使用 Table Editor 手動添加欄位**
2. **然後使用簡單的 SQL UPDATE 生成 ID**

```sql
-- 這個應該比較簡單，不會觸發 API 錯誤
UPDATE "PersonnelData" 
SET id = FLOOR(RANDOM() * 9000000000 + 1000000000)::BIGINT 
WHERE id IS NULL;
```

---

**最後更新：2025-12-12**
