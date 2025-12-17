# Email 通知系統設計

## 📧 系統概述

使用 Google Apps Script 的 MailApp/GmailApp 服務，在任務指派、狀態變更、聊天訊息等事件發生時，自動發送 email 通知給相關人員。

---

## 🎯 適用場景

### 1. 任務相關通知
- ✅ 任務指派通知（通知被指派人）
- ✅ 任務狀態變更通知（通知相關人員）
- ✅ 任務回覆通知（通知交辦人）
- ✅ 任務協作者新增/移除通知

### 2. Chat 相關通知
- ✅ 新訊息通知（通知接收者）
- ✅ 提及通知（@某人）
- ✅ 檔案分享通知

### 3. 系統通知
- ✅ 帳號建立通知
- ✅ 權限變更通知
- ✅ 系統維護通知

---

## 🛠️ 技術實作方案

### 方案一：使用 MailApp（推薦，最簡單）

**優點：**
- ✅ 無需額外設定
- ✅ 簡單易用
- ✅ 免費使用
- ✅ 支援 HTML 格式

**限制：**
- ⚠️ 每日發送限制：100 封（個人帳號）或 1500 封（Google Workspace）
- ⚠️ 發送者為執行腳本的帳號

### 方案二：使用 GmailApp（進階）

**優點：**
- ✅ 更高的發送限制
- ✅ 可使用不同的寄件者
- ✅ 更多自訂選項

**限制：**
- ⚠️ 需要更複雜的設定
- ⚠️ 可能需要額外權限

---

## 📋 實作步驟

### 步驟 1：在 Code.gs 中添加 Email 通知函數

```javascript
// ========================================
// Email 通知功能
// ========================================

/**
 * 發送任務指派通知
 * @param {string} assigneeEmail - 被指派人的 email
 * @param {string} assigneeName - 被指派人的姓名
 * @param {string} taskTitle - 任務標題
 * @param {string} taskDescription - 任務描述
 * @param {string} assignerName - 交辦人姓名
 * @param {string} taskUrl - 任務連結
 */
function sendTaskAssignmentEmail(assigneeEmail, assigneeName, taskTitle, taskDescription, assignerName, taskUrl) {
  try {
    const subject = `📋 新任務指派：${taskTitle}`;
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">📋 您有新的任務指派</h2>
            <p>親愛的 <strong>${assigneeName}</strong>，</p>
            <p><strong>${assignerName}</strong> 指派了一個新任務給您：</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">${taskTitle}</h3>
              <p style="margin-bottom: 0;">${taskDescription || '無詳細說明'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${taskUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                查看任務詳情
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              這是系統自動發送的通知郵件，請勿直接回覆。<br>
              如有問題，請登入系統查看任務詳情。
            </p>
          </div>
        </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: assigneeEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log(`✅ 任務指派通知已發送到：${assigneeEmail}`);
    return { success: true };
  } catch (error) {
    Logger.log(`❌ 發送 email 失敗：${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 發送任務狀態變更通知
 */
function sendTaskStatusChangeEmail(userEmail, userName, taskTitle, oldStatus, newStatus, taskUrl) {
  try {
    const statusText = {
      'pending': '待處理',
      'in_progress': '進行中',
      'done': '已完成',
      'overdue': '逾期'
    };
    
    const subject = `🔄 任務狀態更新：${taskTitle}`;
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">🔄 任務狀態已更新</h2>
            <p>親愛的 <strong>${userName}</strong>，</p>
            <p>任務 <strong>${taskTitle}</strong> 的狀態已更新：</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>舊狀態：</strong>${statusText[oldStatus] || oldStatus}</p>
              <p style="margin: 5px 0;"><strong>新狀態：</strong>${statusText[newStatus] || newStatus}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${taskUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                查看任務詳情
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              這是系統自動發送的通知郵件，請勿直接回覆。
            </p>
          </div>
        </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log(`✅ 狀態變更通知已發送到：${userEmail}`);
    return { success: true };
  } catch (error) {
    Logger.log(`❌ 發送 email 失敗：${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 發送聊天訊息通知
 */
function sendChatNotificationEmail(recipientEmail, recipientName, senderName, message, taskTitle, chatUrl) {
  try {
    const subject = `💬 來自 ${senderName} 的新訊息`;
    const htmlBody = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4f46e5;">💬 您有新的訊息</h2>
            <p>親愛的 <strong>${recipientName}</strong>，</p>
            <p><strong>${senderName}</strong> 在任務 <strong>${taskTitle}</strong> 中發送了一則訊息：</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5;">
              <p style="margin: 0;">${message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${chatUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                查看完整對話
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              這是系統自動發送的通知郵件，請勿直接回覆。
            </p>
          </div>
        </body>
      </html>
    `;
    
    MailApp.sendEmail({
      to: recipientEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log(`✅ 聊天通知已發送到：${recipientEmail}`);
    return { success: true };
  } catch (error) {
    Logger.log(`❌ 發送 email 失敗：${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

/**
 * 從 users 表取得用戶 email
 */
function getUserEmail(userId) {
  try {
    const filter = `id=eq.${userId}`;
    const result = supabaseRequest('GET', SUPABASE_TABLE_USERS, null, filter);
    
    if (result && result.length > 0) {
      // 如果 users 表有 email 欄位
      return result[0].email || null;
    }
    
    return null;
  } catch (error) {
    Logger.log(`❌ 取得用戶 email 失敗：${error.toString()}`);
    return null;
  }
}
```

### 步驟 2：整合到現有函數中

在 `saveTask` 函數中添加通知：

```javascript
function saveTask(taskData) {
  // ... 原有的儲存邏輯 ...
  
  // 發送任務指派通知
  try {
    const assigneeEmail = getUserEmail(taskData.assigneeId);
    if (assigneeEmail) {
      const taskUrl = `http://192.168.68.75:3050?task=${taskId}`;
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

在 `updateTaskStatus` 函數中添加通知：

```javascript
function updateTaskStatus(taskId, status) {
  // ... 原有的更新邏輯 ...
  
  // 發送狀態變更通知
  try {
    const task = getTask(taskId);
    if (task.success && task.data) {
      // 通知交辦人
      const assignerEmail = getUserEmail(task.data.assignerId);
      if (assignerEmail) {
        const taskUrl = `http://192.168.68.75:3050?task=${taskId}`;
        sendTaskStatusChangeEmail(
          assignerEmail,
          task.data.assigner_name,
          task.data.title,
          task.data.status,
          status,
          taskUrl
        );
      }
    }
  } catch (error) {
    Logger.log('發送通知失敗：' + error.toString());
  }
  
  // ... 返回結果 ...
}
```

---

## 📊 資料庫擴充

### 擴充 users 表，添加 email 欄位

```sql
-- 為 users 表添加 email 欄位
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- 為 users 表添加 email 索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 或者使用 personnel 表的 email

如果已經有 `personnel` 表且包含 email，可以建立關聯：

```sql
-- 在 users 表添加 employee_id 欄位來關聯 personnel 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- 建立關聯查詢的視圖
CREATE OR REPLACE VIEW user_with_email AS
SELECT 
  u.id,
  u.name,
  u.role,
  u.avatar,
  p.email,
  p.drive_link
FROM users u
LEFT JOIN personnel p ON u.employee_id = p.employee_id;
```

---

## 🔔 通知偏好設定

### 建立通知設定表

```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id BIGINT PRIMARY KEY,
  email_notifications_enabled BOOLEAN DEFAULT true,
  task_assignment_email BOOLEAN DEFAULT true,
  task_status_change_email BOOLEAN DEFAULT true,
  chat_message_email BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 檢查通知偏好

```javascript
function shouldSendEmail(userId, notificationType) {
  try {
    const filter = `user_id=eq.${userId}`;
    const result = supabaseRequest('GET', 'notification_preferences', null, filter);
    
    if (result && result.length > 0) {
      const prefs = result[0];
      
      if (!prefs.email_notifications_enabled) return false;
      
      switch (notificationType) {
        case 'task_assignment':
          return prefs.task_assignment_email;
        case 'task_status_change':
          return prefs.task_status_change_email;
        case 'chat_message':
          return prefs.chat_message_email;
        default:
          return true;
      }
    }
    
    // 預設允許發送
    return true;
  } catch (error) {
    Logger.log(`檢查通知偏好失敗：${error.toString()}`);
    return true; // 錯誤時預設發送
  }
}
```

---

## 🚀 快速測試

### 測試發送 Email

在 Google Apps Script 編輯器中執行以下測試函數：

```javascript
function testSendEmail() {
  sendTaskAssignmentEmail(
    'test@example.com',  // 替換為您的 email
    '測試用戶',
    '測試任務標題',
    '這是一個測試任務描述',
    '交辦人姓名',
    'http://192.168.68.75:3050'
  );
}
```

---

## ⚠️ 注意事項

### 1. 發送限制
- **個人 Google 帳號**：每日最多 100 封
- **Google Workspace**：每日最多 1500 封
- 超過限制會拋出錯誤

### 2. 權限設定
首次使用 MailApp 時，需要授權：
- 在 Google Apps Script 編輯器中執行測試函數
- 點擊「授權」並選擇 Google 帳號
- 允許存取 Gmail

### 3. Email 格式
- 建議使用 HTML 格式讓郵件更美觀
- 包含任務連結，方便用戶直接點擊
- 加入「請勿直接回覆」提示

### 4. 錯誤處理
- 發送失敗不應影響主要功能
- 記錄錯誤日誌以便除錯
- 可以實作重試機制

---

## 📝 使用範例

### 範例 1：任務指派時發送通知

```javascript
// 在 saveTask 函數中
const assigneeEmail = getUserEmail(taskData.assigneeId);
if (assigneeEmail && shouldSendEmail(taskData.assigneeId, 'task_assignment')) {
  sendTaskAssignmentEmail(
    assigneeEmail,
    assigneeName,
    taskData.title,
    taskData.description,
    assignerName,
    `http://192.168.68.75:3050?task=${taskId}`
  );
}
```

### 範例 2：聊天訊息時發送通知

```javascript
// 在發送訊息時
const recipientEmail = getUserEmail(recipientId);
if (recipientEmail && shouldSendEmail(recipientId, 'chat_message')) {
  sendChatNotificationEmail(
    recipientEmail,
    recipientName,
    senderName,
    messageContent,
    taskTitle,
    `http://192.168.68.75:3050?task=${taskId}&chat=true`
  );
}
```

---

## 🔗 相關檔案

- `Code.gs` - 添加 email 通知函數
- `supabase_schema.sql` - 擴充 users 表或建立 notification_preferences 表
- 前端組件 - 顯示通知設定選項

---

**最後更新：2025-12-12**
