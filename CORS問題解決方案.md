# CORS 問題解決方案

## 🔴 錯誤訊息
```
建立任務失敗：Failed to fetch
```

## 📋 解決步驟

### 步驟 1：確認 Google Apps Script Web App 部署設定

1. 前往 [Google Apps Script](https://script.google.com/)
2. 開啟你的專案
3. 點擊右上角的「部署」→「管理部署作業」
4. 點擊現有部署旁的「編輯」（鉛筆圖示）
5. **確認以下設定**：
   - **執行身分**：我
   - **具有存取權的使用者**：**必須選擇「任何人」** ⚠️ 這很重要！
6. 如果設定不正確，請修改後點擊「部署」

### 步驟 2：重新部署 Web App

**重要**：每次修改 `Code.gs` 後，都需要重新部署才能生效！

1. 在 Google Apps Script 編輯器中
2. 點擊「部署」→「管理部署作業」
3. 點擊現有部署旁的「編輯」
4. 選擇「新版本」
5. 點擊「部署」
6. **複製新的 Web App URL**（如果 URL 有變更）

### 步驟 3：確認 API URL

1. 開啟 `api.ts` 檔案
2. 確認 `API_URL` 是否正確：
   ```typescript
   const API_URL = '你的 Google Apps Script Web App URL';
   ```
3. 如果 URL 有變更，請更新後重新啟動前端

### 步驟 4：測試 API 連線

在瀏覽器中直接訪問你的 Web App URL，應該會看到：
```json
{
  "message": "任務交辦系統 API 服務運行中",
  "timestamp": "2025-12-10T..."
}
```

如果看到這個回應，表示 API 正常運作。

### 步驟 5：檢查瀏覽器 Console

1. 開啟瀏覽器開發者工具（F12）
2. 切換到「Console」標籤
3. 嘗試建立任務
4. 查看詳細的錯誤訊息

常見錯誤訊息：
- `Failed to fetch` → CORS 問題或網路連線問題
- `CORS policy` → Web App 部署設定不正確
- `404 Not Found` → API URL 不正確
- `500 Internal Server Error` → Google Apps Script 程式碼有錯誤

### 步驟 6：檢查 Google Apps Script 執行記錄

1. 在 Google Apps Script 編輯器中
2. 點擊「檢視」→「執行記錄」
3. 查看是否有錯誤訊息
4. 如果有錯誤，檢查 `Code.gs` 的程式碼

## 🔧 常見問題

### Q1: 為什麼需要選擇「任何人」？

A: Google Apps Script Web App 只有在選擇「任何人」時，才會自動處理 CORS headers。如果選擇「只有我」，瀏覽器會阻擋跨域請求。

### Q2: 選擇「任何人」會不會有安全問題？

A: 不會。因為：
- 只有知道 Web App URL 的人才能存取
- 你可以在 `Code.gs` 中加入身份驗證邏輯
- Google Apps Script 會記錄所有請求

### Q3: 修改 Code.gs 後需要重新部署嗎？

A: **是的！** 每次修改 `Code.gs` 後，都需要：
1. 儲存檔案
2. 重新部署 Web App
3. 選擇「新版本」

### Q4: 如何確認 Web App 是否正確部署？

A: 在瀏覽器中直接訪問 Web App URL，如果看到 JSON 回應，表示部署成功。

## 📝 檢查清單

- [ ] Google Apps Script Web App 已部署
- [ ] 部署設定中「具有存取權的使用者」選擇「任何人」
- [ ] `api.ts` 中的 `API_URL` 正確
- [ ] 修改 `Code.gs` 後已重新部署
- [ ] 瀏覽器 Console 沒有 CORS 錯誤
- [ ] 直接訪問 Web App URL 可以看到 JSON 回應

## 🆘 如果問題仍然存在

1. **清除瀏覽器快取**：按 `Ctrl+Shift+Delete`（Windows）或 `Cmd+Shift+Delete`（Mac）
2. **使用無痕模式**測試
3. **檢查網路連線**
4. **確認防火牆設定**沒有阻擋 Google Apps Script
5. **查看 Google Apps Script 執行記錄**是否有錯誤

## 📞 需要協助？

如果以上步驟都無法解決問題，請提供：
1. 瀏覽器 Console 的完整錯誤訊息
2. Google Apps Script 執行記錄的錯誤訊息
3. 直接訪問 Web App URL 的回應內容

