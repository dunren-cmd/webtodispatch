# 如何開啟 Supabase - 詳細步驟指南

## 📋 第一步：註冊/登入 Supabase

1. **前往 Supabase 官網**
   - 開啟瀏覽器，前往：https://supabase.com
   - 點擊右上角的 **「Start your project」** 或 **「Sign In」**

2. **註冊帳號（如果還沒有帳號）**
   - 可以使用 GitHub 帳號快速註冊
   - 或使用 Email 註冊

3. **登入後進入 Dashboard**
   - 登入後會自動進入專案管理頁面

---

## 🚀 第二步：建立新專案

1. **點擊「New Project」按鈕**
   - 在 Dashboard 頁面，點擊綠色的 **「New Project」** 按鈕

2. **填寫專案資訊**
   - **Name（專案名稱）**：輸入你的專案名稱，例如：`任務交辦系統`
   - **Database Password**：設定資料庫密碼（**請記住這個密碼！**）
   - **Region（地區）**：選擇離你最近的地區，例如：`Southeast Asia (Singapore)`
   - **Pricing Plan**：選擇免費方案（Free）即可

3. **建立專案**
   - 點擊 **「Create new project」**
   - 等待 1-2 分鐘讓 Supabase 建立專案（會顯示進度）

---

## 🔑 第三步：取得 API 金鑰

專案建立完成後，需要取得兩個重要資訊：

1. **進入專案設定**
   - 在左側選單中，點擊 **「Settings」**（設定圖示 ⚙️）
   - 然後點擊 **「API」**

2. **複製以下資訊**：
   
   **a) Project URL（專案網址）**
   - 在「Project URL」區塊中
   - 複製完整的 URL，例如：`https://abcdefghijklmnop.supabase.co`
   
   **b) anon public key（匿名公開金鑰）**
   - 在「Project API keys」區塊中
   - 找到 **「anon public」** 這一項
   - 點擊旁邊的「眼睛圖示」顯示完整金鑰
   - 點擊「複製」按鈕複製金鑰
   - 這個金鑰很長，類似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🗄️ 第四步：建立資料庫表格

1. **開啟 SQL Editor**
   - 在左側選單中，點擊 **「SQL Editor」**

2. **建立新查詢**
   - 點擊 **「New query」** 按鈕

3. **執行 SQL 腳本**
   - 開啟專案資料夾中的 `supabase_schema.sql` 檔案
   - 複製所有 SQL 內容
   - 貼到 SQL Editor 中
   - 點擊右下角的 **「Run」** 按鈕（或按 `Ctrl+Enter`）

4. **確認表格建立成功**
   - 執行成功後，在左側選單點擊 **「Table Editor」**
   - 應該會看到兩個表格：`tasks` 和 `users`

---

## ⚙️ 第五步：在 Google Apps Script 中設定

### 方法 A：使用指令碼屬性（推薦）

1. **開啟 Google Apps Script**
   - 前往 https://script.google.com
   - 開啟你的專案

2. **進入專案設定**
   - 點擊左側的 **「專案設定」**（齒輪圖示 ⚙️）
   - 在「指令碼屬性」標籤中

3. **新增屬性**
   
   點擊 **「新增指令碼屬性」**，新增兩個屬性：
   
   **第一個屬性：**
   - **屬性名稱**：`SUPABASE_URL`
   - **屬性值**：貼上剛才複製的 Project URL
   - 點擊 **「儲存指令碼屬性」**
   
   **第二個屬性：**
   - 再次點擊 **「新增指令碼屬性」**
   - **屬性名稱**：`SUPABASE_ANON_KEY`
   - **屬性值**：貼上剛才複製的 anon public key
   - 點擊 **「儲存指令碼屬性」**

### 方法 B：直接在程式碼中設定（較不推薦）

如果不想使用指令碼屬性，可以直接編輯 `Code.gs`：

1. 找到檔案開頭的這兩行：
```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

2. 替換為你的實際值：
```javascript
const SUPABASE_URL = "https://你的專案ID.supabase.co";
const SUPABASE_ANON_KEY = "你的完整anon key";
```

---

## ✅ 第六步：測試連接

1. **執行測試函數**
   - 在 Google Apps Script 編輯器中
   - 選擇函數：`testBasicSetup`
   - 點擊 **「執行」** 按鈕（▶️）

2. **查看執行記錄**
   - 點擊 **「執行記錄」**（時鐘圖示）
   - 應該會看到：
     - ✅ Supabase URL：你的 URL
     - ✅ Supabase Key：已設定
     - ✅ Supabase 連接成功

3. **如果出現錯誤**
   - 檢查 URL 和 Key 是否正確複製
   - 確認沒有多餘的空格
   - 確認 Supabase 專案狀態為「Active」

---

## 🎉 完成！

現在你的後端已經成功連接到 Supabase 了！

### 快速檢查清單：
- [ ] Supabase 帳號已註冊
- [ ] 專案已建立
- [ ] 已複製 Project URL
- [ ] 已複製 anon public key
- [ ] 已執行 SQL 腳本建立表格
- [ ] 已在 Google Apps Script 中設定 URL 和 Key
- [ ] 測試連接成功

---

## 📸 視覺化指引

### Supabase Dashboard 主要區域：

```
┌─────────────────────────────────────┐
│  Supabase Dashboard                │
├─────────────────────────────────────┤
│                                     │
│  [左側選單]                         │
│  📊 Table Editor  (表格編輯器)      │
│  🔍 SQL Editor    (SQL 編輯器)      │
│  ⚙️  Settings     (設定)            │
│  🔐 Authentication (身份驗證)       │
│                                     │
│  [主要內容區]                       │
│  顯示選單對應的內容                 │
│                                     │
└─────────────────────────────────────┘
```

### 取得 API Key 的位置：

```
Settings > API
├─ Project URL: https://xxx.supabase.co
└─ Project API keys
   ├─ anon public: eyJhbGci... (複製這個)
   └─ service_role: (不要使用這個)
```

---

## 💡 小提示

1. **免費方案限制**：
   - 免費方案有 500MB 資料庫空間
   - 2GB 頻寬限制
   - 足夠小型專案使用

2. **安全性**：
   - anon key 是公開的，但透過 RLS 政策保護資料
   - 不要分享 service_role key（有完整權限）

3. **備份**：
   - 建議將 Project URL 和 API Key 保存在安全的地方
   - 可以建立一個密碼管理工具記錄

4. **需要幫助**：
   - Supabase 官方文件：https://supabase.com/docs
   - 社群支援：Discord 或 GitHub Discussions
