# 串接 Google Sheets 後端準備清單

## 📋 需要準備的項目

### 1. **Google Sheets 試算表設定**

#### 建立試算表
1. 建立新的 Google Sheets 試算表
2. 記錄試算表 ID（從網址中取得，例如：`https://docs.google.com/spreadsheets/d/1Y_DdF0sGFjSqCi9SPelZlkF6Mz32q5O0XNjdPOaq-c8/edit`）
   - ID 就是 `1Y_DdF0sGFjSqCi9SPelZlkF6Mz32q5O0XNjdPOaq-c8` 這部分

#### 建立工作表（Sheets）
根據前端資料結構，需要建立以下工作表：

**工作表 1：交辦紀錄**
- 欄位：時間戳記、任務ID、任務標題、任務描述、交辦人ID、交辦人姓名、承辦人ID、承辦人姓名、協作者IDs、職類歸屬、計畫日期、期中日期、最終日期、狀態、承辦人回覆、佐證資料（JSON格式）

**工作表 2：人員管理_交辦**（可選）
- 欄位：時間戳記、人員ID、姓名、角色、頭像

**工作表 3：佐證資料**（可選，或合併到交辦紀錄）
- 欄位：任務ID、佐證ID、類型（stat/image/link）、標籤、數值、連結、檔案名稱

---

### 2. **Google Apps Script 後端程式碼**

需要建立 `Code.gs` 檔案，包含以下功能：

#### 核心功能
- ✅ `doPost()` - 處理前端 POST 請求（建立/更新任務）
- ✅ `doGet()` - 處理前端 GET 請求（查詢任務、人員）
- ✅ `saveTask()` - 儲存任務到 Sheets
- ✅ `updateTask()` - 更新任務狀態/內容
- ✅ `getTasks()` - 查詢任務列表（支援篩選）
- ✅ `getUsers()` - 取得人員列表
- ✅ `saveEvidence()` - 儲存佐證資料

#### 需要設定的常數
```javascript
const SPREADSHEET_ID = "你的試算表ID";
const TASKS_SHEET_NAME = "交辦紀錄";
const USERS_SHEET_NAME = "人員管理_交辦";
const EVIDENCE_SHEET_NAME = "佐證資料";
```

---

### 3. **前端 API 呼叫檔案**

需要建立 `api.ts` 檔案，包含：

#### API 函數
- ✅ `submitTask()` - 提交新任務
- ✅ `updateTaskStatus()` - 更新任務狀態
- ✅ `updateTaskResponse()` - 更新承辦人回覆
- ✅ `addEvidence()` - 新增佐證資料
- ✅ `deleteEvidence()` - 刪除佐證資料
- ✅ `getTasks()` - 取得任務列表
- ✅ `getUsers()` - 取得人員列表

#### 需要設定的常數
```typescript
const API_URL = '你的 Google Apps Script Web App URL';
```

---

### 4. **資料結構對應**

#### 前端 Task 物件 → Sheets 欄位對應

| 前端欄位 | Sheets 欄位 | 說明 |
|---------|------------|------|
| `id` | 任務ID | 唯一識別碼 |
| `title` | 任務標題 | 任務名稱 |
| `description` | 任務描述 | AI 生成的任務說明 |
| `assignerId` | 交辦人ID | 交辦人的 ID |
| `assigneeId` | 承辦人ID | 承辦人的 ID |
| `collaboratorIds` | 協作者IDs | JSON 陣列格式 |
| `roleCategory` | 職類歸屬 | medical_admin, nurse, etc. |
| `dates.plan` | 計畫日期 | 日期格式 |
| `dates.interim` | 期中日期 | 日期格式 |
| `dates.final` | 最終日期 | 日期格式 |
| `status` | 狀態 | pending, in_progress, done, overdue |
| `assigneeResponse` | 承辦人回覆 | 文字內容 |
| `evidence` | 佐證資料 | JSON 陣列格式 |

---

### 5. **部署步驟**

#### Step 1: 建立 Google Apps Script 專案
1. 前往 [Google Apps Script](https://script.google.com/)
2. 建立新專案
3. 貼上 `Code.gs` 程式碼
4. 修改 `SPREADSHEET_ID` 為你的試算表 ID

#### Step 2: 部署為 Web App
1. 點擊「部署」→「新增部署作業」
2. 選擇類型：「網頁應用程式」
3. 設定：
   - **執行身分**：我
   - **具有存取權的使用者**：**任何人**（重要！）
4. 點擊「部署」
5. **複製 Web App URL**（例如：`https://script.google.com/macros/s/AKfycbyyfLr8CnSroku2PCXJfO_e8sUoy8Dh6CjCQ88L-_b71Phi69p9v4naV1Xi30qISQw8/exec`）

#### Step 3: 設定前端 API URL
1. 在 `api.ts` 中設定 `API_URL` 為你的 Web App URL

#### Step 4: 修改前端代碼
1. 將前端的 `useState` 改為從 API 載入資料
2. 將所有資料操作（新增、更新、刪除）改為呼叫 API

---

### 6. **權限設定**

#### Google Sheets 權限
- 試算表需要設定為「知道連結的使用者可以檢視」
- 或設定為「知道連結的使用者可以編輯」（如果允許前端直接編輯）

#### Google Apps Script 權限
- 部署時選擇「具有存取權的使用者：任何人」
- 首次執行時需要授權 Google Apps Script 存取你的 Google Sheets

---

### 7. **測試檢查清單**

- [ ] Google Sheets 試算表已建立
- [ ] 工作表欄位已設定
- [ ] Google Apps Script 程式碼已部署
- [ ] Web App URL 已取得
- [ ] 前端 `api.ts` 中的 `API_URL` 已設定
- [ ] 前端代碼已修改為使用 API
- [ ] 測試建立任務功能
- [ ] 測試更新任務狀態
- [ ] 測試新增佐證資料
- [ ] 測試查詢任務列表
- [ ] 檢查瀏覽器 Console 是否有錯誤

---

## 🚀 快速開始

1. **先建立試算表並記錄 ID**
2. **建立 Google Apps Script 專案並部署**
3. **取得 Web App URL**
4. **建立前端 API 檔案並設定 URL**
5. **修改前端代碼整合 API**

---

## 📝 注意事項

1. **CORS 問題**：確保 Google Apps Script 部署時選擇「任何人」可以存取
2. **資料格式**：日期、JSON 陣列需要正確轉換格式
3. **錯誤處理**：前端需要處理 API 錯誤並顯示給用戶
4. **載入狀態**：顯示載入中的狀態提升用戶體驗
5. **資料同步**：考慮是否需要即時更新或定時重新載入

---

## 🔗 相關檔案

- `Code.gs` - Google Apps Script 後端程式碼（需要建立）
- `api.ts` - 前端 API 呼叫檔案（需要建立）
- `html` - 前端 React 應用程式（需要修改以整合 API）

