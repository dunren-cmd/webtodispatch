# Docker Desktop 安裝與啟動指南

## 🔴 問題診斷

你遇到的錯誤訊息：
```
failed to inspect service: error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/..."
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

這表示 **Docker Desktop 沒有運行或沒有安裝**。

---

## ✅ 解決方案

### 步驟 1：檢查 Docker Desktop 是否已安裝

1. **檢查開始功能表**
   - 按 `Win` 鍵
   - 搜尋「Docker Desktop」
   - 如果找不到，表示未安裝

2. **檢查系統匣（通知區域）**
   - 查看右下角系統匣是否有 Docker 圖示（鯨魚圖示）
   - 如果有圖示但顯示錯誤，表示已安裝但未運行

### 步驟 2：如果未安裝 Docker Desktop

#### 下載與安裝

1. **下載 Docker Desktop**
   - 前往：https://www.docker.com/products/docker-desktop
   - 點擊「Download for Windows」
   - 下載 `Docker Desktop Installer.exe`（約 500MB）

2. **安裝 Docker Desktop**
   - 執行下載的安裝檔
   - 按照安裝精靈完成安裝
   - **重要選項**：
     - ✅ 勾選「Use WSL 2 instead of Hyper-V」（如果出現）
     - ✅ 勾選「Add shortcut to desktop」

3. **安裝後設定**
   - 安裝完成後會要求重新啟動電腦
   - 重新啟動後，Docker Desktop 會自動啟動

#### 系統需求檢查

在安裝前，確認你的系統符合需求：

- ✅ **Windows 10 64-bit: Pro, Enterprise, or Education**（Build 19041 或更高版本）
- ✅ **Windows 11 64-bit**
- ✅ **啟用虛擬化**（在 BIOS 中）
- ✅ **WSL 2**（Windows Subsystem for Linux 2）

**檢查虛擬化是否啟用：**
1. 按 `Ctrl + Shift + Esc` 開啟工作管理員
2. 點擊「效能」標籤
3. 點擊「CPU」
4. 查看「虛擬化」是否顯示「已啟用」

**如果虛擬化未啟用：**
- 需要進入 BIOS 啟用虛擬化功能
- 不同主機板的設定方式不同，請參考你的主機板說明書

### 步驟 3：啟動 Docker Desktop

1. **從開始功能表啟動**
   - 按 `Win` 鍵
   - 搜尋「Docker Desktop」
   - 點擊啟動

2. **等待啟動完成**
   - Docker Desktop 啟動需要一些時間（30秒到2分鐘）
   - 系統匣會顯示 Docker 圖示
   - 圖示從「啟動中」變為「運行中」表示啟動成功

3. **確認狀態**
   - 右鍵點擊系統匣的 Docker 圖示
   - 選擇「Settings」或「設定」
   - 確認狀態顯示為「Running」或「運行中」

### 步驟 4：驗證 Docker 安裝

開啟 PowerShell 或命令提示字元，執行：

```powershell
docker --version
```

應該會顯示類似：
```
Docker version 24.0.0, build xxxxx
```

然後執行：

```powershell
docker ps
```

應該會顯示容器列表（可能是空的，這是正常的）。

### 步驟 5：重新啟動 Supabase

Docker Desktop 運行後，回到你的專案資料夾，執行：

```powershell
cd "c:\Users\dunre\OneDrive\文件\請購單\WebToDispatch_2"
supabase start
```

這次應該可以成功啟動了！

---

## 🔧 常見問題

### 問題 1：Docker Desktop 無法啟動

**可能原因：**
- WSL 2 未安裝或未更新
- 虛擬化未啟用
- Hyper-V 衝突

**解決方案：**

1. **安裝/更新 WSL 2**
   ```powershell
   wsl --install
   ```
   然後重新啟動電腦

2. **檢查 WSL 2 版本**
   ```powershell
   wsl --list --verbose
   ```
   確認版本是 2

3. **如果使用 Hyper-V**
   - 在 Docker Desktop 設定中選擇「Use WSL 2 instead of Hyper-V」

### 問題 2：虛擬化未啟用

**解決方案：**
1. 重新啟動電腦
2. 進入 BIOS（通常是按 `F2`、`F10`、`Del` 或 `Esc` 鍵）
3. 找到「Virtualization」或「VT-x」或「AMD-V」選項
4. 啟用該選項
5. 儲存並退出 BIOS
6. 重新啟動電腦

### 問題 3：Docker Desktop 啟動很慢

**解決方案：**
- 確保有足夠的磁碟空間（至少 10GB）
- 關閉其他佔用資源的程式
- 檢查防毒軟體是否阻擋 Docker

### 問題 4：權限錯誤

**解決方案：**
- 以系統管理員身分執行 Docker Desktop
- 或在 Docker Desktop 設定中啟用「Allow Docker Desktop to run without administrator privileges」

---

## 📝 快速檢查清單

- [ ] Docker Desktop 已下載
- [ ] Docker Desktop 已安裝
- [ ] 電腦已重新啟動（如果需要）
- [ ] Docker Desktop 已啟動
- [ ] 系統匣顯示 Docker 圖示（運行中）
- [ ] `docker --version` 命令成功
- [ ] `docker ps` 命令成功
- [ ] `supabase start` 命令成功

---

## 🎯 下一步

Docker Desktop 成功運行後，繼續執行：

```powershell
supabase start
```

這會：
1. 下載必要的 Docker 映像檔（第一次需要一些時間）
2. 啟動所有 Supabase 服務
3. 執行資料庫遷移（建立表格）

完成後執行 `supabase status` 查看連接資訊！

---

## 📚 參考資源

- Docker Desktop 官方文件：https://docs.docker.com/desktop/
- WSL 2 安裝指南：https://docs.microsoft.com/zh-tw/windows/wsl/install
- Supabase CLI 文件：https://supabase.com/docs/guides/cli
