# CSV 匯入 Supabase - 完整步驟

## 📋 當前狀況

- ✅ Supabase API 連接正常
- ✅ 匯入腳本已準備就緒
- ⚠️  CSV 檔案在 Windows 系統上，需要複製到 Linux

## 🚀 快速開始

### 步驟 1：複製 CSV 檔案到 Linux

請將以下三個檔案從 Windows Desktop 複製到 Linux：

**來源（Windows）：**
- `c:\Users\dunre\Desktop\roles_rows.csv`
- `c:\Users\dunre\Desktop\users_rows (2).csv`
- `c:\Users\dunre\Desktop\tasks_rows.csv`

**目標（Linux）：**
- `/home/dunren/cursor/webtodispatch/WebToDispatch_2/`

### 步驟 2：執行匯入

複製完成後，執行：

```bash
cd /home/dunren/cursor/webtodispatch/WebToDispatch_2

python3 import_all_csv_to_supabase.py \
  --roles roles_rows.csv \
  --users users_rows.csv \
  --tasks tasks_rows.csv
```

## 📝 複製檔案的方法

### 方法 A：使用檔案管理器（最簡單）

1. 在 Windows 上開啟檔案總管
2. 找到 `c:\Users\dunre\Desktop\`
3. 選取三個 CSV 檔案
4. 複製（Ctrl+C）
5. 在 Linux 上開啟檔案管理器
6. 導航到 `/home/dunren/cursor/webtodispatch/WebToDispatch_2/`
7. 貼上（Ctrl+V）

### 方法 B：使用 SCP（如果兩台電腦在同一網路）

在 Windows PowerShell 中：

```powershell
scp "c:\Users\dunre\Desktop\roles_rows.csv" user@linux-ip:/home/dunren/cursor/webtodispatch/WebToDispatch_2/
scp "c:\Users\dunre\Desktop\users_rows (2).csv" user@linux-ip:/home/dunren/cursor/webtodispatch/WebToDispatch_2/users_rows.csv
scp "c:\Users\dunre\Desktop\tasks_rows.csv" user@linux-ip:/home/dunren/cursor/webtodispatch/WebToDispatch_2/
```

### 方法 C：使用 USB 隨身碟

1. 將 CSV 檔案複製到 USB 隨身碟
2. 在 Linux 上掛載 USB
3. 複製檔案到目標目錄

## ✅ 驗證檔案已複製

執行以下命令檢查：

```bash
cd /home/dunren/cursor/webtodispatch/WebToDispatch_2
ls -lh *.csv
```

應該看到三個 CSV 檔案。

## 🎯 執行匯入

檔案複製完成後，執行匯入：

```bash
cd /home/dunren/cursor/webtodispatch/WebToDispatch_2

# 檢查 Supabase 連接
curl -s http://192.168.62.101:54321/rest/v1/ > /dev/null && echo "✅ Supabase 連接正常" || echo "❌ Supabase 連接失敗"

# 執行匯入
python3 import_all_csv_to_supabase.py \
  --roles roles_rows.csv \
  --users users_rows.csv \
  --tasks tasks_rows.csv
```

## 📊 預期結果

匯入成功後會看到：

```
============================================================
📊 匯入結果統計
============================================================
✅ 總成功：X 筆
❌ 總失敗：0 筆

🎉 匯入完成！
```

## 🆘 需要幫助？

如果遇到問題，請檢查：

1. CSV 檔案是否已複製到正確位置
2. Supabase 服務是否正在運行
3. 檔案權限是否正確（應該可讀）

