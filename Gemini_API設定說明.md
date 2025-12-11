# Gemini API 設定說明

## 📋 設定步驟

### 步驟 1：取得 Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登入你的 Google 帳號
3. 點擊「建立 API 金鑰」
4. 複製 API Key（格式：`AIza...`）

### 步驟 2：將 API Key 設定到指令碼屬性（推薦）

**推薦方式：使用指令碼屬性（更安全）**

1. **開啟 Google Apps Script 專案**
   - 前往 [Google Apps Script](https://script.google.com/)
   - 開啟「任務交辦系統後端」專案

2. **開啟專案設定**
   - 點擊左側的「專案設定」圖示（⚙️ 齒輪圖示）
   - 或點擊右上角的「專案設定」按鈕

3. **新增指令碼屬性**
   - 向下滾動找到「指令碼屬性」區塊
   - 點擊「新增指令碼屬性」按鈕
   - **屬性名稱**：輸入 `GEMINI_API_KEY`
   - **值**：貼上你的 Gemini API Key
   - 點擊「儲存指令碼屬性」

**替代方式：儲存到試算表（不推薦，但可用）**

如果無法使用指令碼屬性，可以將 API Key 儲存到試算表：

1. 開啟試算表：`1Y_DdF0sGFjSqCi9SPelZlkF6Mz32q5O0XNjdPOaq-c8`
2. 在第一個工作表的 A1 儲存格輸入你的 Gemini API Key
3. 儲存

### 步驟 3：確認設定

**方法 1：檢查指令碼屬性**
1. 在 Google Apps Script 編輯器中
2. 點擊「專案設定」
3. 確認「指令碼屬性」中有 `GEMINI_API_KEY`

**方法 2：執行測試函數**
1. 在 Google Apps Script 編輯器中
2. 選擇 `testGeminiAPI` 函數
3. 點擊「執行」
4. 查看執行記錄，應該看到「✅ 成功從指令碼屬性讀取 Gemini API Key」

---

## 🔧 API Key 格式

Gemini API Key 的格式通常是：
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

長度約 39 個字元，以 `AIza` 開頭。

---

## 🧪 測試 AI 功能

### 方法 1：透過前端測試

1. 啟動前端應用程式
2. 點擊「交辦任務」
3. 在「任務描述」欄位輸入文字
4. 點擊「串接 AI 形成結構化工作任務」按鈕
5. 等待 AI 分析完成
6. 查看生成的結構化任務說明

### 方法 2：透過 Google Apps Script 測試

建立測試函數：
```javascript
function testGeminiAPI() {
  const testDescription = '請幫我規劃下個月的員工訓練課程，需要包含新進人員培訓和主管管理課程';
  const result = analyzeTaskWithAI(testDescription);
  Logger.log('測試結果：' + JSON.stringify(result));
}
```

---

## ⚠️ 注意事項

1. **API Key 安全性**：
   - API Key 儲存在試算表中，請確保試算表權限設定正確
   - 不要將 API Key 分享給不信任的人
   - 如果 API Key 洩露，請立即重新產生

2. **API 使用限制**：
   - Gemini API 有免費額度限制
   - 超過額度後需要付費
   - 建議監控 API 使用量

3. **錯誤處理**：
   - 如果 API Key 錯誤，會顯示錯誤訊息
   - 如果 API 額度用完，會顯示相應錯誤
   - 前端會顯示錯誤訊息給用戶

---

## 🐛 常見問題

### Q1: 找不到 API Key

**錯誤訊息**：
```
找不到 Gemini API Key，請確認指令碼屬性中已設定 GEMINI_API_KEY
```

**解決方案**：
1. 確認已在「專案設定」→「指令碼屬性」中新增 `GEMINI_API_KEY`
2. 確認屬性名稱完全一致：`GEMINI_API_KEY`（大小寫敏感）
3. 確認 API Key 格式正確（以 `AIza` 開頭）
4. 確認已點擊「儲存指令碼屬性」

### Q2: API 回應錯誤

**錯誤訊息**：
```
Gemini API 錯誤：401 - Unauthorized
```

**解決方案**：
1. 確認 API Key 正確
2. 確認 API Key 未被撤銷
3. 重新產生 API Key

### Q3: API 額度用完

**錯誤訊息**：
```
Gemini API 錯誤：429 - Resource Exhausted
```

**解決方案**：
1. 等待額度重置（通常是每月重置）
2. 升級 API 方案以獲得更多額度

---

## 📝 API Key 讀取邏輯

系統會從以下位置讀取 API Key：

1. **指令碼屬性（優先）**：`GEMINI_API_KEY` 屬性
   - 這是推薦的方式，更安全且方便管理
   - 設定位置：專案設定 → 指令碼屬性

如果指令碼屬性中沒有找到，程式會記錄警告訊息並返回 null。

---

## 🔗 相關連結

- [Google AI Studio](https://aistudio.google.com/app/apikey) - 取得 API Key
- [Gemini API 文件](https://ai.google.dev/docs) - API 使用說明
- [API 定價](https://ai.google.dev/pricing) - 查看定價資訊

