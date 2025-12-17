# 修正 drive_link 欄位錯誤

## ❌ 錯誤訊息

```
ERROR:  42703: column p.drive_link does not exist
LINE 8:   p.drive_link as headshot,
```

## 🔍 解決方法

### 步驟 1：檢查實際的欄位名稱

在 Supabase SQL Editor 執行：

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'PersonnelData'
ORDER BY ordinal_position;
```

這會顯示 PersonnelData 表的所有欄位名稱。

### 步驟 2：根據實際欄位名稱選擇對應的 SQL

#### 情況 A：如果欄位名稱是 `DriveLink`（大小寫混合）

```sql
INSERT INTO users (id, name, role, mail, headshot, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p."Mail" as mail,
  p."DriveLink" as headshot,  -- 注意：使用引號
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot;
```

#### 情況 B：如果欄位名稱是 `Drive_Link`（大小寫+底線）

```sql
INSERT INTO users (id, name, role, mail, headshot, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p."Mail" as mail,
  p."Drive_Link" as headshot,  -- 注意：使用引號
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot;
```

#### 情況 C：如果欄位名稱是 `drive-link`（小寫+連字號）

```sql
INSERT INTO users (id, name, role, mail, headshot, timestamp)
SELECT 
  p.id,
  p.name,
  p."JobTitle" as role,
  p."Mail" as mail,
  p."drive-link" as headshot,  -- 注意：使用引號
  COALESCE(p.timestamp, NOW()) as timestamp
FROM "PersonnelData" p
ON CONFLICT (id) 
DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  mail = EXCLUDED.mail,
  headshot = EXCLUDED.headshot;
```

#### 情況 D：如果該欄位不存在或不需要 headshot

使用 `直接執行_複製資料_不含headshot.sql`，這個版本不包含 headshot 欄位。

---

## 🚀 快速解決方案

### 方案 1：先執行不含 headshot 的版本（推薦）

1. 打開 `直接執行_複製資料_不含headshot.sql`
2. 複製全部內容
3. 在 Supabase SQL Editor 中執行

這樣可以先完成基本資料的複製（id, name, role, mail），之後再處理 headshot。

### 方案 2：確認欄位名稱後再執行

1. 執行 `檢查欄位名稱.sql` 查看實際欄位名稱
2. 根據結果修改 SQL 中的欄位名稱
3. 執行修正後的 SQL

---

## 📝 注意事項

1. **大小寫敏感**：PostgreSQL 對大小寫敏感，如果欄位名稱包含大寫字母，必須用雙引號括起來
2. **如果欄位不存在**：可以跳過 headshot，只複製其他欄位
3. **如果欄位名稱不同**：請根據實際欄位名稱修改 SQL

---

## ✅ 執行順序

1. **先執行**：`檢查欄位名稱.sql` 確認實際欄位名稱
2. **然後執行**：根據結果選擇對應的 SQL 或使用不含 headshot 的版本
3. **最後驗證**：執行驗證查詢確認複製成功
