# Roles 與 Users 一對多關聯說明

## 資料庫結構

### 關聯關係

```
roles (一)  ──────<  users (多)
  id              role (外鍵)
```

- **roles 表**：一個角色（一）
- **users 表**：多個用戶（多）
- **關聯欄位**：`users.role` → `roles.id`

### 表結構

#### roles 表（角色表）

```sql
CREATE TABLE roles (
  id TEXT PRIMARY KEY,              -- 角色 ID（主鍵）
  name TEXT NOT NULL,               -- 角色名稱
  icon_name TEXT,                   -- 圖示名稱
  color TEXT,                       -- 顏色主題
  level INTEGER,                    -- 層級（1-4）
  webhook TEXT,                     -- Webhook URL
  is_default BOOLEAN,               -- 是否為預設角色
  created_at TIMESTAMPTZ,           -- 創建時間
  updated_at TIMESTAMPTZ            -- 更新時間
);
```

#### users 表（用戶表）

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,                        -- 外鍵：對應到 roles.id
  level INTEGER,
  mail TEXT,
  employee_id TEXT,
  headshot TEXT,
  ...
);
```

### 外鍵約束

```sql
ALTER TABLE users 
  ADD CONSTRAINT fk_users_role 
  FOREIGN KEY (role) 
  REFERENCES roles(id) 
  ON DELETE SET NULL    -- 當角色被刪除時，用戶的角色設為 NULL
  ON UPDATE CASCADE;    -- 當角色 ID 更新時，自動更新用戶的角色
```

## 資料完整性

### 自動處理

1. **自動創建角色**：遷移文件會自動從 users 表中提取不重複的角色值，創建對應的 roles 記錄
2. **外鍵驗證**：當插入或更新 users.role 時，系統會自動驗證該角色是否存在於 roles 表
3. **級聯更新**：當 roles.id 更新時，所有相關的 users.role 會自動更新
4. **級聯刪除**：當角色被刪除時，相關用戶的 role 欄位會設為 NULL（不會刪除用戶）

## 查詢範例

### 1. 查詢角色及其用戶列表（一對多）

```sql
-- 查詢所有角色及其用戶數量
SELECT 
  r.id,
  r.name,
  r.webhook,
  COUNT(u.id) as user_count
FROM roles r
LEFT JOIN users u ON u.role = r.id
GROUP BY r.id, r.name, r.webhook
ORDER BY user_count DESC;
```

### 2. 查詢特定角色的所有用戶

```sql
-- 查詢「醫師」角色的所有用戶
SELECT u.id, u.name, u.mail, u.level
FROM users u
JOIN roles r ON u.role = r.id
WHERE r.id = '醫師';
```

### 3. 查詢用戶及其角色資訊

```sql
-- 查詢用戶及其角色詳細資訊
SELECT 
  u.id,
  u.name,
  u.level as user_level,
  r.id as role_id,
  r.name as role_name,
  r.webhook,
  r.level as role_level
FROM users u
LEFT JOIN roles r ON u.role = r.id;
```

### 4. 查詢有 Webhook 的角色

```sql
-- 查詢所有設定了 Webhook 的角色
SELECT r.id, r.name, r.webhook
FROM roles r
WHERE r.webhook IS NOT NULL AND r.webhook != '';
```

## 前端使用

### 從 Supabase 讀取角色

```typescript
// 查詢所有角色
const response = await fetch(`${SUPABASE_URL}/rest/v1/roles`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
});
const roles = await response.json();
```

### 查詢角色及其用戶

```typescript
// 查詢角色及其用戶數量
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/roles?select=*,users(count)`,
  {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  }
);
```

## 後端使用（Code.gs）

### 查詢角色的 Webhook

```javascript
function getRoleWebhook(roleId) {
  const config = getSupabaseConfig();
  const url = `${config.url}/rest/v1/roles?id=eq.${roleId}&select=webhook`;
  
  const response = UrlFetchApp.fetch(url, {
    headers: {
      'apikey': config.key,
      'Authorization': `Bearer ${config.key}`
    }
  });
  
  const result = JSON.parse(response.getContentText());
  return result.length > 0 ? result[0].webhook : null;
}
```

### 發送 Webhook 通知

```javascript
function sendWebhookNotification(roleId, message) {
  const webhook = getRoleWebhook(roleId);
  if (!webhook) {
    Logger.log(`角色 ${roleId} 沒有設定 Webhook`);
    return;
  }
  
  UrlFetchApp.fetch(webhook, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ message: message })
  });
}
```

## 遷移步驟

1. **執行遷移文件**
   ```bash
   supabase migration up
   ```
   或直接在 Supabase Studio 中執行 SQL

2. **驗證關聯**
   ```sql
   -- 檢查外鍵約束
   SELECT * FROM information_schema.table_constraints 
   WHERE constraint_name = 'fk_users_role';
   ```

3. **更新前端代碼**
   - 將 `loadCustomRoles()` 改為從 Supabase 讀取
   - 將 `saveCustomRoles()` 改為寫入 Supabase

## 注意事項

1. **資料遷移**：遷移文件會自動從 users 表提取現有角色並創建 roles 記錄
2. **外鍵約束**：確保 users.role 的值必須存在於 roles.id 中
3. **刪除角色**：刪除角色時，相關用戶的 role 會設為 NULL，不會刪除用戶
4. **更新角色 ID**：更新 roles.id 時，所有相關的 users.role 會自動更新

## 優點

✅ **資料完整性**：外鍵約束確保資料一致性  
✅ **查詢效率**：可以使用 JOIN 查詢相關資料  
✅ **集中管理**：角色資訊集中在 roles 表  
✅ **Webhook 管理**：每個角色可以設定獨立的 Webhook  
✅ **級聯操作**：自動處理更新和刪除操作
