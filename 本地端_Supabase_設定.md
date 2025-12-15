# 本地端 Supabase 設定指南

## 📋 什麼是本地端 Supabase？

本地端 Supabase 讓你在自己的電腦上運行 Supabase，不需要連接到雲端。適合：
- 本地開發和測試
- 不需要網路連線
- 免費且無限制
- 快速開發迭代

---

## 🛠️ 第一步：安裝必要工具

### 1. 安裝 Docker Desktop（必須）

Supabase 本地端需要 Docker 來運行容器。

**Windows 安裝步驟：**

1. **下載 Docker Desktop**
   - 前往：https://www.docker.com/products/docker-desktop
   - 點擊「Download for Windows」
   - 下載 `Docker Desktop Installer.exe`

2. **安裝 Docker Desktop**
   - 執行下載的安裝檔
   - 按照安裝精靈完成安裝
   - **重要**：安裝過程中選擇「Use WSL 2 instead of Hyper-V」（如果出現選項）

3. **啟動 Docker Desktop**
   - 安裝完成後，啟動 Docker Desktop
   - 等待 Docker 啟動完成（系統匣會顯示 Docker 圖示）
   - 確認 Docker 狀態為「Running」

4. **驗證安裝**
   - 開啟 PowerShell 或命令提示字元
   - 執行：`docker --version`
   - 應該會顯示 Docker 版本號

### 2. 安裝 Supabase CLI

⚠️ **重要**：Supabase CLI **不支援**使用 `npm install -g` 安裝！請使用以下方法之一：

**方法 A：使用 Scoop（Windows 套件管理器，推薦）**

1. **安裝 Scoop**（如果還沒有）
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```
   - 如果出現權限錯誤，以系統管理員身分執行 PowerShell

2. **安裝 Supabase CLI**
   ```powershell
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase
   ```

3. **驗證安裝**
   ```powershell
   supabase --version
   ```

**方法 B：直接下載執行檔（最簡單）**

1. **下載 Supabase CLI**
   - 前往：https://github.com/supabase/cli/releases
   - 找到最新版本（例如：v1.xxx.x）
   - 下載 `supabase_windows_amd64.zip`

2. **解壓縮**
   - 解壓縮下載的 ZIP 檔案
   - 會得到 `supabase.exe` 檔案

3. **設定 PATH（選擇其一）**
   
   **選項 1：放到現有 PATH 資料夾**
   - 將 `supabase.exe` 複製到 `C:\Windows\System32` 或
   - 複製到 `C:\Users\dunre\AppData\Local\Programs\Microsoft VS Code\bin`（如果使用 VS Code）
   
   **選項 2：建立新資料夾並加入 PATH**
   - 建立資料夾：`C:\Tools\supabase`
   - 將 `supabase.exe` 放到這個資料夾
   - 將 `C:\Tools\supabase` 加入系統 PATH：
     - 開啟「系統環境變數」設定
     - 編輯「Path」變數
     - 新增 `C:\Tools\supabase`

4. **驗證安裝**
   - 重新開啟 PowerShell
   - 執行：`supabase --version`
   - 應該會顯示版本號

**方法 C：使用 Chocolatey（如果已安裝）**

```powershell
choco install supabase
```

**方法 D：使用 winget（Windows 10/11 內建）**

```powershell
winget install --id=Supabase.CLI
```

---

## 🚀 第二步：初始化本地 Supabase 專案

1. **開啟 PowerShell 或命令提示字元**
   - 導航到你的專案資料夾：
   ```powershell
   cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
   ```

2. **登入 Supabase（可選，用於連結雲端專案）**
   ```powershell
   supabase login
   ```
   - 這會開啟瀏覽器讓你登入
   - 如果只是本地開發，可以跳過這一步

3. **初始化 Supabase 專案**
   ```powershell
   supabase init
   ```
   - 這會建立 `supabase` 資料夾和配置檔案

---

## 🗄️ 第三步：建立資料庫結構

1. **建立遷移檔案**
   ```powershell
   supabase migration new init
   ```
   - 這會在 `supabase/migrations` 資料夾中建立新的遷移檔案

2. **編輯遷移檔案**
   - 開啟剛建立的遷移檔案（例如：`supabase/migrations/20240101000000_init.sql`）
   - 複製 `supabase_schema.sql` 的內容到這個檔案
   - 或直接將 `supabase_schema.sql` 的內容貼上

3. **啟動本地 Supabase**
   ```powershell
   supabase start
   ```
   - 第一次執行會下載 Docker 映像檔（需要一些時間）
   - 等待所有服務啟動完成

4. **查看服務狀態**
   ```powershell
   supabase status
   ```
   - 會顯示所有服務的 URL 和連接資訊

---

## 🔑 第四步：取得本地端連接資訊

執行 `supabase status` 後，你會看到類似以下的輸出：

```
         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要資訊：**
- **API URL**：`http://localhost:54321` - 這是你的 Supabase API 網址
- **anon key**：很長的字串 - 這是匿名公開金鑰
- **service_role key**：很長的字串 - 這是服務角色金鑰（有完整權限）

---

## ⚙️ 第五步：在 Google Apps Script 中設定本地端 Supabase

### 方法 A：使用指令碼屬性（推薦）

1. **開啟 Google Apps Script**
   - 前往 https://script.google.com
   - 開啟你的專案

2. **進入專案設定**
   - 點擊左側的「專案設定」（齒輪圖示 ⚙️）
   - 在「指令碼屬性」標籤中

3. **新增屬性**
   
   **第一個屬性：**
   - **屬性名稱**：`SUPABASE_URL`
   - **屬性值**：`http://localhost:54321`（或你從 `supabase status` 看到的 API URL）
   - 點擊「儲存指令碼屬性」
   
   **第二個屬性：**
   - **屬性名稱**：`SUPABASE_ANON_KEY`
   - **屬性值**：貼上從 `supabase status` 看到的 anon key
   - 點擊「儲存指令碼屬性」

### ⚠️ 重要注意事項

**Google Apps Script 無法直接連接到 localhost！**

因為 Google Apps Script 運行在 Google 的伺服器上，無法訪問你電腦上的 `localhost`。

**解決方案：**

#### 方案 1：使用 ngrok 建立隧道（推薦）

1. **下載 ngrok**
   - 前往：https://ngrok.com/download
   - 下載 Windows 版本
   - 解壓縮 `ngrok.exe`

2. **註冊 ngrok 帳號**（免費）
   - 前往：https://dashboard.ngrok.com/signup
   - 註冊後取得 authtoken

3. **設定 ngrok**
   ```powershell
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```

4. **啟動隧道**
   ```powershell
   ngrok http 54321
   ```
   - 這會顯示一個公開的 URL，例如：`https://abc123.ngrok.io`

5. **在 Google Apps Script 中使用 ngrok URL**
   - 將 `SUPABASE_URL` 設定為 ngrok 提供的 URL
   - 例如：`https://abc123.ngrok.io`

#### 方案 2：使用其他隧道服務

- **Cloudflare Tunnel**：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **localtunnel**：`npx localtunnel --port 54321`
- **serveo**：`ssh -R 80:localhost:54321 serveo.net`

#### 方案 3：使用雲端 Supabase（最簡單）

如果只是測試，建議直接使用雲端 Supabase，不需要設定隧道。

---

## 🎯 第六步：使用 Supabase Studio（可選）

Supabase Studio 是網頁版的資料庫管理介面：

1. **開啟 Studio**
   - 執行 `supabase status` 查看 Studio URL
   - 通常是：`http://localhost:54323`
   - 在瀏覽器中開啟這個網址

2. **使用 Studio**
   - 可以查看和編輯資料
   - 執行 SQL 查詢
   - 管理表格結構

---

## 📝 常用命令

### 啟動和停止

```powershell
# 啟動本地 Supabase
supabase start

# 停止本地 Supabase
supabase stop

# 查看狀態
supabase status

# 重啟服務
supabase restart
```

### 資料庫操作

```powershell
# 重置資料庫（清除所有資料）
supabase db reset

# 建立新的遷移檔案
supabase migration new migration_name

# 應用遷移
supabase db reset
```

### 其他

```powershell
# 查看日誌
supabase logs

# 查看特定服務的日誌
supabase logs db
supabase logs api
```

---

## 🔧 疑難排解

### Docker 無法啟動

**問題**：Docker Desktop 無法啟動

**解決方案**：
1. 確認已啟用虛擬化（在 BIOS 中）
2. 確認已安裝 WSL 2
3. 重新啟動電腦
4. 以系統管理員身分執行 Docker Desktop

### Supabase CLI 命令找不到

**問題**：執行 `supabase` 時顯示「找不到命令」

**解決方案**：
1. 確認已正確安裝 Supabase CLI（**不要使用 npm install -g**）
2. 確認 PATH 環境變數包含 Supabase 安裝路徑
3. 重新開啟 PowerShell（讓 PATH 變更生效）
4. 如果使用下載執行檔方式，確認 `supabase.exe` 在 PATH 中

**快速測試 PATH**：
```powershell
# 查看 PATH 中是否有 supabase
where.exe supabase

# 如果找不到，手動指定完整路徑測試
C:\Tools\supabase\supabase.exe --version
```

### npm 安裝失敗

**問題**：使用 `npm install -g supabase` 時出現錯誤

**原因**：Supabase CLI 不支援 npm 全域安裝

**解決方案**：
- 使用 Scoop、直接下載執行檔、Chocolatey 或 winget 安裝
- 不要使用 `npm install -g supabase`

### 連接埠被佔用

**問題**：`supabase start` 失敗，顯示連接埠被佔用

**解決方案**：
1. 檢查哪些程式在使用連接埠：
   ```powershell
   netstat -ano | findstr :54321
   ```
2. 停止佔用連接埠的程式
3. 或修改 Supabase 配置使用其他連接埠

### Google Apps Script 無法連接

**問題**：Google Apps Script 無法連接到本地 Supabase

**解決方案**：
1. 確認已使用 ngrok 或其他隧道服務
2. 確認 ngrok 正在運行
3. 確認 Google Apps Script 中的 URL 是 ngrok URL，不是 localhost
4. 測試 ngrok URL 是否可以在瀏覽器中訪問

---

## 💡 本地端 vs 雲端 Supabase

| 特性 | 本地端 | 雲端 |
|------|--------|------|
| 網路需求 | 不需要 | 需要 |
| 費用 | 免費 | 免費方案有限制 |
| 設定複雜度 | 較複雜 | 較簡單 |
| 資料持久性 | 需手動備份 | 自動備份 |
| 適合場景 | 開發測試 | 生產環境 |

---

## 🎉 完成！

現在你已經知道如何在本地端運行 Supabase 了！

### 快速檢查清單：
- [ ] Docker Desktop 已安裝並運行
- [ ] Supabase CLI 已安裝
- [ ] 專案已初始化（`supabase init`）
- [ ] 資料庫結構已建立（遷移檔案）
- [ ] 本地 Supabase 已啟動（`supabase start`）
- [ ] 已取得連接資訊（`supabase status`）
- [ ] 已設定隧道服務（ngrok 等）
- [ ] Google Apps Script 已設定連接

---

## 📚 參考資源

- Supabase CLI 文件：https://supabase.com/docs/guides/cli
- Docker Desktop 文件：https://docs.docker.com/desktop/
- ngrok 文件：https://ngrok.com/docs
