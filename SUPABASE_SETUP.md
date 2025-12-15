# Supabase 設定說明

## 步驟 1：建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 並登入
2. 建立新專案或選擇現有專案
3. 記下專案的 URL 和 Anon Key（可在專案設定 > API 中找到）

## 步驟 2：建立資料庫表格

1. 在 Supabase Dashboard 中，點擊左側選單的「SQL Editor」
2. 開啟 `supabase_schema.sql` 檔案
3. 將 SQL 內容複製並貼到 SQL Editor 中
4. 點擊「Run」執行 SQL 腳本

這會建立兩個表格：
- `users` - 用戶資料表
- `tasks` - 任務資料表

## 步驟 3：設定 Google Apps Script

有兩種方式設定 Supabase 連接資訊：

### 方式 1：直接在程式碼中設定（不建議用於生產環境）

編輯 `Code.gs` 檔案，將以下常數替換為你的 Supabase 資訊：

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```

### 方式 2：使用指令碼屬性（建議）

1. 在 Google Apps Script 編輯器中，點擊「專案設定」（齒輪圖示）
2. 點擊「指令碼屬性」標籤
3. 新增以下兩個屬性：
   - **名稱**：`SUPABASE_URL`，**值**：你的 Supabase URL（例如：`https://xxxxx.supabase.co`）
   - **名稱**：`SUPABASE_ANON_KEY`，**值**：你的 Supabase Anon Key

使用方式 2 的好處是敏感資訊不會直接寫在程式碼中，更安全。

## 步驟 4：測試連接

1. 在 Google Apps Script 編輯器中，執行 `testBasicSetup()` 函數
2. 查看執行記錄，確認 Supabase 連接成功

## 資料庫結構說明

### users 表格欄位

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | BIGINT | 用戶 ID（主鍵） |
| timestamp | TIMESTAMPTZ | 建立時間 |
| name | TEXT | 姓名 |
| role | TEXT | 角色 |
| avatar | TEXT | 頭像（emoji） |

### tasks 表格欄位

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | BIGINT | 任務 ID（主鍵） |
| timestamp | TIMESTAMPTZ | 建立時間 |
| title | TEXT | 任務標題 |
| description | TEXT | 任務描述 |
| assigner_id | BIGINT | 交辦人 ID |
| assigner_name | TEXT | 交辦人姓名 |
| assignee_id | BIGINT | 承辦人 ID |
| assignee_name | TEXT | 承辦人姓名 |
| collaborator_ids | JSONB | 協作者 ID 陣列 |
| role_category | TEXT | 職類歸屬 |
| plan_date | DATE | 計畫日期 |
| interim_date | DATE | 期中日期 |
| final_date | DATE | 最終日期 |
| status | TEXT | 狀態（pending/in_progress/completed） |
| assignee_response | TEXT | 承辦人回覆 |
| evidence | JSONB | 佐證資料陣列 |

## 安全性注意事項

目前的 RLS（Row Level Security）政策設定為允許所有人讀寫。在生產環境中，建議：

1. 根據實際需求調整 RLS 政策
2. 考慮使用 Service Role Key 而非 Anon Key（需要額外的安全措施）
3. 實作身份驗證機制

## 疑難排解

### 錯誤：Supabase 配置未設定
- 確認已設定 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- 檢查指令碼屬性中的設定是否正確

### 錯誤：Supabase API 錯誤：404
- 確認 Supabase URL 正確
- 確認表格名稱正確（`tasks` 和 `users`）

### 錯誤：Supabase API 錯誤：401
- 確認 Anon Key 正確
- 檢查 Supabase 專案是否已啟用

### 錯誤：Supabase API 錯誤：403
- 檢查 RLS 政策是否正確設定
- 確認表格已啟用 RLS 並設定了適當的政策
