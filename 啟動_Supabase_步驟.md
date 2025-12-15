# 啟動 Supabase 步驟指南

## 🔴 當前問題

錯誤訊息：
```
failed to inspect container health: Error response from daemon: No such container: supabase_db_WebToDispatch_2
```

這表示：
- ✅ Docker Desktop 已經運行（否則不會有這個錯誤）
- ❌ Supabase 容器還沒有啟動

---

## ✅ 解決步驟

### 步驟 1：確認 Docker Desktop 正在運行

1. **檢查系統匣**
   - 查看右下角系統匣是否有 Docker 圖示（鯨魚圖示）
   - 圖示應該是穩定的，不是動畫狀態

2. **驗證 Docker**
   在 PowerShell 中執行：
   ```powershell
   docker ps
   ```
   應該會顯示容器列表（可能是空的，這是正常的）

### 步驟 2：啟動 Supabase

在專案資料夾中執行：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
supabase start
```

**第一次執行時會：**
1. 下載 Docker 映像檔（需要一些時間，約 5-10 分鐘）
2. 啟動所有 Supabase 服務容器
3. 執行資料庫遷移（建立表格）

**成功啟動的標誌：**
- 看到類似以下的訊息：
  ```
  Started supabase local development setup.
  
           API URL: http://localhost:54321
       GraphQL URL: http://localhost:54321/graphql/v1
            DB URL: postgresql://postgres:postgres@localhost:54322/postgres
        Studio URL: http://localhost:54323
      Inbucket URL: http://localhost:54324
        JWT secret: ...
          anon key: ...
  service_role key: ...
  ```

### 步驟 3：查看狀態

啟動完成後，執行：

```powershell
supabase status
```

應該會顯示所有服務的狀態和連接資訊。

---

## 🔧 如果 `supabase start` 失敗

### 問題 1：下載映像檔失敗

**錯誤訊息：** `failed to pull image` 或 `network error`

**解決方案：**
1. 檢查網路連線
2. 如果使用代理，在 Docker Desktop 設定中設定代理
3. 重試：
   ```powershell
   supabase start
   ```

### 問題 2：連接埠被佔用

**錯誤訊息：** `port already in use` 或 `bind: address already in use`

**解決方案：**
1. 檢查哪些程式在使用連接埠：
   ```powershell
   netstat -ano | findstr :54321
   netstat -ano | findstr :54322
   netstat -ano | findstr :54323
   ```
2. 停止佔用連接埠的程式
3. 或修改 Supabase 配置使用其他連接埠

### 問題 3：權限不足

**錯誤訊息：** `permission denied` 或 `access denied`

**解決方案：**
1. 以系統管理員身分執行 PowerShell
2. 確認 Docker Desktop 有足夠權限

### 問題 4：磁碟空間不足

**錯誤訊息：** `no space left on device`

**解決方案：**
1. 清理 Docker 映像檔和容器：
   ```powershell
   docker system prune -a
   ```
2. 確保有至少 10GB 可用空間

---

## 🐛 除錯模式

如果遇到問題，使用除錯模式查看詳細資訊：

```powershell
supabase start --debug
```

或

```powershell
supabase status --debug
```

這會顯示更詳細的錯誤訊息，幫助診斷問題。

---

## 📝 常用命令

### 啟動和停止

```powershell
# 啟動 Supabase
supabase start

# 停止 Supabase
supabase stop

# 重啟 Supabase
supabase restart

# 查看狀態
supabase status
```

### 查看日誌

```powershell
# 查看所有服務日誌
supabase logs

# 查看特定服務日誌
supabase logs db
supabase logs api
supabase logs studio
```

### 重置資料庫

```powershell
# 重置資料庫（清除所有資料並重新執行遷移）
supabase db reset
```

---

## ✅ 成功啟動後的下一步

1. **複製連接資訊**
   - 從 `supabase status` 輸出中複製：
     - API URL（例如：`http://localhost:54321`）
     - anon key（很長的字串）

2. **設定 Google Apps Script**
   - 在 Google Apps Script 的指令碼屬性中設定：
     - `SUPABASE_URL` = API URL
     - `SUPABASE_ANON_KEY` = anon key

3. **開啟 Supabase Studio（可選）**
   - 在瀏覽器中開啟 Studio URL（通常是 `http://localhost:54323`）
   - 可以查看和管理資料庫

---

## 🎯 快速檢查清單

- [ ] Docker Desktop 正在運行
- [ ] `docker ps` 命令成功
- [ ] 已執行 `supabase start`
- [ ] 看到成功啟動的訊息
- [ ] `supabase status` 顯示所有服務運行中
- [ ] 已複製 API URL 和 anon key
- [ ] 已在 Google Apps Script 中設定連接資訊

---

## 💡 小提示

1. **第一次啟動較慢**
   - 第一次執行 `supabase start` 需要下載映像檔，可能需要 5-10 分鐘
   - 之後啟動會快很多（約 30 秒）

2. **保持 Docker Desktop 運行**
   - Supabase 需要 Docker Desktop 持續運行
   - 關閉 Docker Desktop 會停止所有 Supabase 服務

3. **資料持久性**
   - 本地 Supabase 的資料儲存在 Docker 容器中
   - 執行 `supabase stop` 不會刪除資料
   - 執行 `supabase db reset` 會清除所有資料
