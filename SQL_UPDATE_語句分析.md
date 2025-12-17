# SQL UPDATE 語句分析

## 📝 語句

```sql
UPDATE users u
SET name = p.name
FROM "PersonnelData" p
WHERE u.id = p.id;
```

---

## 🔍 逐行分析

### 第 1 行：`UPDATE users u`

- **`UPDATE`**：SQL 更新指令
- **`users`**：要更新的目標表
- **`u`**：`users` 表的別名（alias），簡化後續引用

**等同於**：
```sql
UPDATE users
```

---

### 第 2 行：`SET name = p.name`

- **`SET`**：指定要更新的欄位
- **`name`**：`users` 表中要更新的欄位
- **`= p.name`**：將 `users.name` 設為 `PersonnelData.name`（`p` 是 `PersonnelData` 的別名）

**意思**：把 `users` 表的 `name` 欄位更新為 `PersonnelData` 表的 `name` 欄位值

---

### 第 3 行：`FROM "PersonnelData" p`

- **`FROM`**：指定資料來源表（PostgreSQL 語法）
- **`"PersonnelData"`**：來源表名稱（雙引號表示大小寫敏感）
- **`p`**：`PersonnelData` 表的別名

**注意**：這是 PostgreSQL 特有的語法，其他資料庫（如 MySQL）可能使用不同的寫法。

---

### 第 4 行：`WHERE u.id = p.id`

- **`WHERE`**：條件子句
- **`u.id = p.id`**：只更新 `users.id` 與 `PersonnelData.id` 相同的記錄

**意思**：只更新兩個表中 `id` 相同的記錄

---

## 🎯 整體功能

這個 SQL 語句的作用是：

**將 `users` 表中所有與 `PersonnelData` 表有相同 `id` 的記錄，其 `name` 欄位更新為 `PersonnelData` 表中對應的 `name` 值。**

---

## 📊 執行流程

1. **從 `PersonnelData` 表讀取資料**
2. **找到 `users` 表中 `id` 相同的記錄**
3. **將這些記錄的 `name` 欄位更新為 `PersonnelData` 的 `name`**

---

## 💡 範例說明

### 更新前

**users 表**：
| id | name | role |
|----|------|------|
| 1 | 張三 | 醫生 |
| 2 | 李四 | 護士 |

**PersonnelData 表**：
| id | name | JobTitle |
|----|------|----------|
| 1 | 張三豐 | 醫師 |
| 2 | 李四郎 | 護理師 |

### 執行 SQL 後

**users 表**：
| id | name | role |
|----|------|------|
| 1 | 張三豐 | 醫生 | ← name 已更新
| 2 | 李四郎 | 護士 | ← name 已更新

---

## ⚠️ 注意事項

### 1. 只更新匹配的記錄

如果 `users` 表中有 `id = 3` 的記錄，但 `PersonnelData` 表中沒有 `id = 3`，則該記錄**不會被更新**。

### 2. 只更新指定的欄位

這個 SQL **只更新 `name` 欄位**，其他欄位（如 `role`、`mail`）**不會改變**。

### 3. 如果 PersonnelData 中有多筆相同 id

如果 `PersonnelData` 表中有多筆相同的 `id`，PostgreSQL 可能會報錯或只更新其中一筆（取決於資料庫設定）。

### 4. 如果 users 中沒有對應的 id

如果 `PersonnelData` 表中有 `id = 5`，但 `users` 表中沒有 `id = 5`，則**不會插入新記錄**，只會更新現有記錄。

---

## 🔄 其他資料庫的寫法

### MySQL（使用 JOIN）

```sql
UPDATE users u
INNER JOIN PersonnelData p ON u.id = p.id
SET u.name = p.name;
```

### SQL Server

```sql
UPDATE u
SET u.name = p.name
FROM users u
INNER JOIN PersonnelData p ON u.id = p.id;
```

---

## ✅ 優點

1. **一次更新多筆**：可以一次更新所有匹配的記錄
2. **效率高**：比逐筆更新快
3. **語法簡潔**：PostgreSQL 的語法相對簡潔

---

## 🔍 驗證更新結果

執行更新後，可以用以下 SQL 驗證：

```sql
SELECT 
  u.id,
  u.name as users_name,
  p.name as personnel_name,
  CASE 
    WHEN u.name = p.name THEN '✅ 更新成功'
    ELSE '❌ 更新失敗'
  END as status
FROM users u
JOIN "PersonnelData" p ON u.id = p.id
ORDER BY u.id;
```

---

## 📚 相關語法

### 更新多個欄位

```sql
UPDATE users u
SET 
  name = p.name,
  role = p."JobTitle",
  mail = p."Mail"
FROM "PersonnelData" p
WHERE u.id = p.id;
```

### 只更新特定條件的記錄

```sql
UPDATE users u
SET name = p.name
FROM "PersonnelData" p
WHERE u.id = p.id
  AND u.name IS NULL;  -- 只更新 name 為空的記錄
```

### 使用子查詢（不推薦，效率較低）

```sql
UPDATE users
SET name = (
  SELECT name 
  FROM "PersonnelData" 
  WHERE "PersonnelData".id = users.id
)
WHERE EXISTS (
  SELECT 1 
  FROM "PersonnelData" 
  WHERE "PersonnelData".id = users.id
);
```
