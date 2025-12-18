# 串聯 users 和 PersonnelData 表說明

## 📋 執行步驟

### 步驟 1：執行 SQL Migration

在 Supabase Dashboard 的 **SQL Editor** 中執行：

```sql
-- 檔案：supabase/migrations/20251212160000_link_users_personnel.sql
```

這個 migration 會：
1. ✅ 為 PersonnelData 表的 ID 欄位生成亂數（如果為 NULL）
2. ✅ 確保 ID 的唯一性
3. ✅ 在 users 表添加 employee_id 欄位
4. ✅ 建立視圖 `user_with_personnel` 來合併兩個表的資料
5. ✅ 建立函數 `get_user_email()` 來取得用戶 email

### 步驟 2：檢查結果

執行以下 SQL 確認：

```sql
-- 查看 PersonnelData 表的 ID 是否都已填滿
SELECT id, employee_id, name, email FROM "PersonnelData" ORDER BY id;

-- 查看 users 表的結構
SELECT id, name, role, employee_id FROM users LIMIT 10;

-- 測試視圖
SELECT * FROM user_with_personnel LIMIT 10;

-- 測試函數（替換 user_id 為實際的用戶 ID）
SELECT get_user_email(1);
```

---

## 🔗 關聯邏輯

### 關聯方式
- `users.employee_id` ↔ `PersonnelData.employee_id`

### 資料流程
1. **users 表**：儲存系統用戶基本資料（id, name, role, avatar）
2. **PersonnelData 表**：儲存員工詳細資料（employee_id, email, drive_link）
3. **關聯**：通過 `employee_id` 欄位進行關聯

### 取得 email 的流程
```
用戶 ID (users.id) 
  → 查詢 users 表取得 employee_id
    → 使用 employee_id 查詢 PersonnelData 表
      → 取得 email
```

---

## 📧 Email 通知功能

### Code.gs 中的函數

#### 1. `getUserEmail(userId)`
- 功能：從 PersonnelData 表取得用戶 email
- 參數：`userId` (number) - 用戶 ID
- 返回：email (string) 或 null

#### 2. `sendTaskAssignmentEmail(...)`
- 功能：發送任務指派通知
- 參數：
  - `assigneeEmail` - 被指派人的 email
  - `assigneeName` - 被指派人的姓名
  - `taskTitle` - 任務標題
  - `taskDescription` - 任務描述
  - `assignerName` - 交辦人姓名
  - `taskUrl` - 任務連結

#### 3. `sendChatNotificationEmail(...)`
- 功能：發送聊天訊息通知
- 參數：
  - `recipientEmail` - 接收者的 email
  - `recipientName` - 接收者的姓名
  - `senderName` - 發送者的姓名
  - `message` - 訊息內容
  - `taskTitle` - 任務標題
  - `chatUrl` - 聊天連結

---

## 🧪 測試 Email 發送

### 測試函數

在 Google Apps Script 編輯器中執行：

```javascript
// 測試發送 email 到 chimi951@gmail.com
testSendEmailToChimi();

// 測試取得用戶 email
testGetUserEmail();
```

### 預期結果

1. **testSendEmailToChimi()**
   - 會發送一封測試任務指派 email 到 `chimi951@gmail.com`
   - 檢查 Gmail 收件匣確認收到郵件

2. **testGetUserEmail()**
   - 會在 Logger 中顯示各用戶的 email（如果有關聯到 PersonnelData）

---

## ⚠️ 注意事項

### 1. 首次使用 MailApp 需要授權
- 執行 `testSendEmailToChimi()` 時會要求授權
- 點擊「授權」→ 選擇 Google 帳號 → 點擊「允許」

### 2. 確保 users 表有 employee_id
如果 users 表中沒有 employee_id，需要手動設定：

```sql
-- 更新 users 表的 employee_id（根據實際情況調整）
UPDATE users 
SET employee_id = '0022' 
WHERE id = 1;
```

### 3. 確保 PersonnelData 有對應的 employee_id
PersonnelData 表中必須有對應的 employee_id 和 email：

```sql
-- 檢查 PersonnelData 資料
SELECT employee_id, name, email FROM "PersonnelData";
```

---

## 🔄 整合到現有功能

### 在 saveTask 函數中添加通知

```javascript
function saveTask(taskData) {
  // ... 原有的儲存邏輯 ...
  
  // 發送任務指派通知
  try {
    const assigneeEmail = getUserEmail(taskData.assigneeId);
    if (assigneeEmail) {
      const taskUrl = `http://192.168.62.101:3050?task=${taskId}`;
      sendTaskAssignmentEmail(
        assigneeEmail,
        assigneeName,
        taskData.title,
        taskData.description,
        assignerName,
        taskUrl
      );
    }
  } catch (error) {
    Logger.log('發送通知失敗，但不影響任務建立：' + error.toString());
  }
  
  // ... 返回結果 ...
}
```

---

## 📝 相關檔案

- `supabase/migrations/20251212160000_link_users_personnel.sql` - 資料庫遷移檔案
- `Code.gs` - 已添加 email 通知函數
- `Email_通知系統設計.md` - Email 通知系統詳細設計文件

---

**最後更新：2025-12-12**
