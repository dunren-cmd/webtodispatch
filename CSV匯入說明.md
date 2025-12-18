# CSV 匯入 Supabase 說明

## 📋 功能說明

這個腳本可以將 `tasks_rows.csv` 檔案匯入到 Supabase 的 `tasks` 表中。

## 🔧 前置需求

### 1. Python 環境

確保已安裝 Python 3.6+：

```bash
python3 --version
```

### 2. 安裝依賴套件

```bash
pip install requests
```

或使用 requirements.txt：

```bash
pip install -r requirements.txt
```

### 3. Supabase 服務運行中

確保 Supabase 本地服務正在運行：

```bash
cd WebToDispatch_2
supabase status
```

如果沒有運行，請啟動：

```bash
supabase start
```

## 📁 CSV 檔案格式

CSV 檔案應包含以下欄位（欄位名稱不區分大小寫）：

| 欄位名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| id | 整數 | 否 | 任務 ID（如果沒有會自動生成） |
| title | 文字 | 是 | 任務標題 |
| description | 文字 | 否 | 任務描述 |
| assigner_id | 整數 | 否 | 交辦人 ID |
| assigner_name | 文字 | 否 | 交辦人姓名 |
| assignee_id | 整數 | 否 | 承辦人 ID |
| assignee_name | 文字 | 否 | 承辦人姓名 |
| collaborator_ids | JSON/文字 | 否 | 協作者 ID 列表（JSON 陣列或逗號分隔） |
| role_category | 文字 | 否 | 角色類別 |
| plan_date | 日期 | 否 | 計劃日期（YYYY-MM-DD 或 YYYY/MM/DD） |
| interim_date | 日期 | 否 | 期中日期 |
| final_date | 日期 | 否 | 最終日期 |
| status | 文字 | 否 | 狀態（pending/in_progress/done/overdue，預設：pending） |
| assignee_response | 文字 | 否 | 承辦人回覆 |
| evidence | JSON/文字 | 否 | 佐證資料（JSON 陣列） |

### CSV 範例

```csv
id,title,description,assigner_id,assigner_name,assignee_id,assignee_name,role_category,plan_date,status
1,完成報告,撰寫季度報告,1001,張三,2001,李四,管理,2024-01-15,pending
2,審核文件,審核客戶合約,1001,張三,2002,王五,財務,2024-01-20,in_progress
```

## 🚀 使用方法

### 基本用法

```bash
cd WebToDispatch_2
python3 import_csv_to_supabase.py tasks_rows.csv
```

### 指定 Supabase URL 和 Key

```bash
python3 import_csv_to_supabase.py tasks_rows.csv \
  --url http://192.168.62.101:54321 \
  --key sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 使用環境變數

```bash
export SUPABASE_URL=http://192.168.62.101:54321
export SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
python3 import_csv_to_supabase.py tasks_rows.csv
```

### 調整批次大小

```bash
python3 import_csv_to_supabase.py tasks_rows.csv --batch-size 20
```

## 📝 完整參數說明

```bash
python3 import_csv_to_supabase.py [CSV檔案] [選項]

參數：
  csv_file               CSV 檔案路徑（預設：tasks_rows.csv）

選項：
  --url URL              Supabase URL（預設：http://192.168.62.101:54321）
  --key KEY              Supabase Anon Key
  --batch-size SIZE      批次大小（預設：10）
  -h, --help             顯示說明
```

## 🔍 檢查 Supabase 連接

在匯入前，可以先測試 Supabase 連接：

```bash
# 檢查 Supabase 狀態
supabase status

# 測試 API 連接（使用 curl）
curl -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
     -H "Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
     http://192.168.62.101:54321/rest/v1/tasks?limit=1
```

## ⚠️ 注意事項

1. **ID 衝突處理**：如果 CSV 中的任務 ID 已存在於資料庫中，腳本會嘗試更新該任務，而不是建立新任務。

2. **日期格式**：腳本支援多種日期格式，包括：
   - `YYYY-MM-DD`
   - `YYYY/MM/DD`
   - `MM/DD/YYYY`
   - `DD/MM/YYYY`
   - 帶時間的格式也會自動處理

3. **JSON 欄位**：`collaborator_ids` 和 `evidence` 欄位可以是：
   - JSON 格式：`[1, 2, 3]` 或 `[]`
   - 逗號分隔：`1,2,3`
   - 空字串會被視為空陣列

4. **批次處理**：大量資料會分批匯入，預設每批 10 筆。可以透過 `--batch-size` 調整。

5. **錯誤處理**：如果某筆資料匯入失敗，腳本會繼續處理其他資料，並在最後顯示統計結果。

## 📊 匯入結果

腳本執行完成後會顯示：

```
============================================================
📊 匯入結果統計
============================================================
✅ 成功：X 筆
❌ 失敗：Y 筆
📋 總計：Z 筆
```

## 🐛 常見問題

### 1. 連接失敗

**錯誤訊息**：`Connection refused` 或 `HTTP error! status: 500`

**解決方法**：
- 確認 Supabase 服務正在運行：`supabase status`
- 檢查 URL 和 Port 是否正確
- 確認網路連接正常

### 2. 認證失敗

**錯誤訊息**：`HTTP error! status: 401`

**解決方法**：
- 檢查 Supabase Anon Key 是否正確
- 執行 `supabase status` 取得最新的 key
- 確認 key 格式正確（新版本使用 `sb_publishable_` 前綴）

### 3. CSV 編碼問題

**錯誤訊息**：`UnicodeDecodeError`

**解決方法**：
- 確保 CSV 檔案使用 UTF-8 編碼
- 如果檔案是從 Excel 匯出，選擇「UTF-8 CSV」格式

### 4. 日期解析失敗

**警告訊息**：`⚠️ 無法解析日期：XXX`

**解決方法**：
- 檢查日期格式是否符合支援的格式
- 手動調整 CSV 中的日期格式為 `YYYY-MM-DD`

## 📚 相關文件

- [Supabase 設定說明](./SUPABASE_SETUP.md)
- [Supabase API 錯誤排除](./Supabase_API錯誤排除.md)
- [檢查 Supabase 連接](./檢查_Supabase_連接.md)

