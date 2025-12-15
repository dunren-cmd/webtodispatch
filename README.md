# 任務交辦系統 - 前端應用程式

## 🚀 快速啟動

### 1. 安裝依賴套件

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

### 3. 開啟瀏覽器

啟動成功後，瀏覽器會自動開啟 `http://localhost:3000`

如果沒有自動開啟，請手動在瀏覽器中輸入：
```
http://localhost:3000
```

## 📋 專案結構

```
WebToDispatch_2/
├── src/
│   ├── App.tsx          # 主要應用程式元件
│   ├── main.tsx          # 應用程式入口
│   └── index.css         # 全域樣式
├── api.ts                # API 呼叫函數
├── Code.gs               # Google Apps Script 後端（需部署）
├── index.html            # HTML 模板
├── package.json          # 專案設定檔
├── vite.config.ts        # Vite 設定檔
├── tsconfig.json         # TypeScript 設定檔
└── tailwind.config.js    # Tailwind CSS 設定檔
```

## 🔧 開發指令

```bash
# 啟動開發伺服器（熱重載）
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 📝 注意事項

1. **API 設定**：確認 `api.ts` 中的 `API_URL` 已正確設定為你的 Google Apps Script Web App URL
2. **後端部署**：確認 `Code.gs` 已部署到 Google Apps Script 並設定為 Web App
3. **試算表 ID**：確認 `Code.gs` 中的 `SPREADSHEET_ID` 已正確設定

## 🐛 疑難排解

### 問題 1：`npm install` 失敗

**解決方案**：
- 確認 Node.js 版本：`node --version`（應該 >= 16）
- 清除快取：`npm cache clean --force`
- 刪除 `node_modules` 資料夾和 `package-lock.json`，重新執行 `npm install`

### 問題 2：無法連接到後端 API

**檢查**：
1. 確認 `api.ts` 中的 `API_URL` 是否正確
2. 確認 Google Apps Script 已部署為 Web App
3. 檢查瀏覽器開發者工具的 Console 和 Network 標籤

### 問題 3：樣式沒有顯示

**解決方案**：
- 確認 Tailwind CSS 已正確安裝
- 重新啟動開發伺服器

## 🚀 推送到 GitHub

### 快速推送

**方法 1：使用批處理文件（推薦）**
```bash
推送到_GitHub.bat
```

**方法 2：使用 PowerShell 腳本**
```powershell
.\推送到_GitHub.ps1
```

**方法 3：手動執行**
```bash
git init
git add .
git commit -m "初始提交：任務交辦系統"
git remote add origin https://github.com/你的用戶名/倉庫名稱.git
git branch -M main
git push -u origin main
```

詳細說明請參考：`推送到_GitHub_說明.md`

## 📚 相關文件

- `快速設定指南.md` - 完整的設定步驟
- `串接GoogleSheets準備清單.md` - 準備項目清單
- `推送到_GitHub_說明.md` - GitHub 推送詳細指南

