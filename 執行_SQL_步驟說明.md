# 執行 SQL 步驟說明

## 📋 快速執行步驟

### 步驟 1：開啟 Supabase Dashboard

1. 開啟瀏覽器，前往：`http://192.168.62.101:54323`
2. 進入 **SQL Editor** 頁面

### 步驟 2：執行 SQL

1. 開啟檔案：`執行_SQL_完整版.sql`
2. 複製整個檔案內容
3. 貼上到 Supabase Dashboard 的 SQL Editor
4. 點擊 **Run** 或按 `Ctrl+Enter` 執行

### 步驟 3：檢查結果

執行後會顯示：
- PersonnelData 表的記錄統計
- 所有記錄的 ID、employee_id、name、email
- 視圖測試結果

---

## ✅ 預期結果

### 成功執行後應該看到：

1. **PersonnelData 表**
   - ✅ 所有記錄都有 ID（10 位數亂數）
   - ✅ ID 欄位設為主鍵
   - ✅ 每個 ID 都是唯一的

2. **users 表**
   - ✅ 新增 `employee_id` 欄位

3. **視圖和函數**
   - ✅ `user_with_personnel` 視圖已建立
   - ✅ `get_user_email()` 函數已建立

---

## 🔍 驗證步驟

### 1. 檢查 PersonnelData 的 ID

```sql
SELECT id, employee_id, name, email 
FROM "PersonnelData" 
ORDER BY id;
```

應該看到所有記錄都有 ID。

### 2. 測試視圖

```sql
SELECT * FROM user_with_personnel LIMIT 5;
```

應該看到 users 和 PersonnelData 合併的資料。

### 3. 測試函數

```sql
-- 測試取得用戶 email（替換 1 為實際的用戶 ID）
SELECT get_user_email(1);
```

---

## 🧪 測試 Email 通知

### 在 Google Apps Script 中執行

1. 開啟 Google Apps Script 編輯器
2. 執行函數：`testSendEmailToChimi()`
3. 首次執行會要求授權，點擊「授權」→「允許」
4. 檢查 `chimi951@gmail.com` 的收件匣

### 預期結果

應該收到一封 Chat 通知 email，內容包含：
- 標題：💬 來自 系統管理員 的新訊息
- 內容：測試聊天訊息
- 連結：可點擊查看完整對話

---

## ⚠️ 常見問題

### 問題 1：SQL 執行失敗 - 表不存在

**錯誤訊息**：`relation "PersonnelData" does not exist`

**解決方法**：
- 確認表名是否正確（注意大小寫）
- 如果是 `personnel_data`，請修改 SQL 中的表名

### 問題 2：主鍵已存在

**錯誤訊息**：`relation "PersonnelData_pkey" already exists`

**解決方法**：
- 這是正常的，表示主鍵已經設定
- 可以忽略這個錯誤，繼續執行

### 問題 3：Email 發送失敗 - 權限錯誤

**錯誤訊息**：`Exception: You do not have permission to call MailApp.sendEmail`

**解決方法**：
1. 執行 `requestAuthorization()` 函數
2. 點擊「授權」→ 選擇 Google 帳號 → 「允許」
3. 再次執行 `testSendEmailToChimi()`

---

## 📝 後續步驟

### 1. 關聯 users 和 PersonnelData

需要在 users 表中設定 `employee_id` 來關聯 PersonnelData：

```sql
-- 範例：將 users.id=1 關聯到 PersonnelData.employee_id='0022'
UPDATE users 
SET employee_id = '0022' 
WHERE id = 1;
```

### 2. 整合到現有功能

在 `saveTask` 或 `updateTaskStatus` 函數中，可以添加 email 通知：

```javascript
// 發送任務指派通知
const assigneeEmail = getUserEmail(taskData.assigneeId);
if (assigneeEmail) {
  sendTaskAssignmentEmail(...);
}
```

---

## 📞 需要協助？

如果執行過程中遇到問題，請檢查：
1. Supabase 是否正常運行
2. 表名是否正確
3. 是否有足夠的權限

查看 Logs：
- Supabase Dashboard → Logs
- Google Apps Script → Executions
