# 環境設定與快速啟動指南

## 📋 目錄

1. [快速開始](#快速開始)
2. [環境變數設定](#環境變數設定)
3. [資料庫遷移](#資料庫遷移)
4. [不同環境配置](#不同環境配置)
5. [故障排除](#故障排除)

## 🚀 快速開始

### 從 Git 拉取代碼後

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
copy .env.example .env  # Windows
# 或
cp .env.example .env     # Linux/Mac

# 3. 編輯 .env 文件，填入你的 Supabase 配置

# 4. 啟動 Supabase（如果使用本地）
supabase start

# 5. 執行資料庫遷移
supabase migration up

# 6. 啟動應用
npm run dev
```

或直接執行 `start.bat`（Windows）或 `start.sh`（Linux/Mac）

## 🔧 環境變數設定

### 步驟 1：複製範本

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

### 步驟 2：取得 Supabase 配置

執行以下命令取得 Supabase 配置：

```bash
supabase status
```

輸出範例：
```
API URL: http://192.168.62.101:54321
anon key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 步驟 3：編輯 .env 文件

```env
# Supabase 配置
VITE_SUPABASE_URL=http://192.168.62.101:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# 前端應用程式配置
VITE_APP_PORT=3050
VITE_APP_HOST=0.0.0.0
```

## 📊 資料庫遷移

### 確保資料庫資料完全一致

所有遷移文件都在 `supabase/migrations/` 目錄中，按時間戳順序執行：

1. **自動執行（推薦）**
   ```bash
   supabase migration up
   ```

2. **手動執行**
   在 Supabase Studio (`http://localhost:54323`) 的 SQL Editor 中，按順序執行：
   - `20251212134638_init.sql`
   - `20251212170000_merge_personnel_to_users.sql`
   - `20251213000000_change_avatar_to_level.sql`
   - `20251213120000_update_level5_to_level4.sql`
   - `20251214000000_fix_users_table_structure.sql`
   - `20251215000000_create_roles_table.sql`

### 驗證遷移狀態

```bash
# 檢查遷移狀態
supabase migration list
```

應該看到所有遷移文件都標記為已執行。

## 🌍 不同環境配置

### 開發環境（本地）

```env
VITE_SUPABASE_URL=http://192.168.62.101:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_APP_PORT=3050
VITE_APP_HOST=0.0.0.0
```

### 其他電腦（不同 IP）

```env
# 修改為該電腦的 Supabase IP
VITE_SUPABASE_URL=http://192.168.1.100:54321
VITE_SUPABASE_ANON_KEY=從該電腦的 supabase status 取得
VITE_APP_PORT=3050
VITE_APP_HOST=0.0.0.0
```

### 生產環境（Supabase Cloud）

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=你的生產環境Key
VITE_APP_PORT=3050
VITE_APP_HOST=0.0.0.0
```

## ✅ 檢查清單

拉取代碼後，確保完成以下步驟：

- [ ] 執行 `npm install`
- [ ] 複製 `.env.example` 為 `.env`
- [ ] 修改 `.env` 中的 Supabase URL 和 Key
- [ ] 啟動 Supabase：`supabase start`
- [ ] 執行遷移：`supabase migration up`
- [ ] 驗證資料庫結構（檢查 users, tasks, roles 表是否存在）
- [ ] 啟動應用：`npm run dev`
- [ ] 檢查瀏覽器控制台，確認沒有錯誤

## 🔍 驗證資料庫資料

### 檢查表是否存在

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

應該看到：`users`, `tasks`, `roles`

### 檢查關聯

```sql
-- 檢查 users 和 roles 的外鍵關聯
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

應該看到 `fk_users_role` 約束。

## 🛠️ 故障排除

### 問題 1：環境變數未生效

**解決方法：**
1. 確認變數名稱以 `VITE_` 開頭
2. 重新啟動開發伺服器
3. 清除瀏覽器快取

### 問題 2：Supabase 連接失敗

**解決方法：**
1. 檢查 Supabase 是否運行：`supabase status`
2. 檢查 `.env` 中的 URL 和 Key
3. 檢查 IP 位址是否正確
4. 檢查防火牆設定

### 問題 3：資料庫表不存在

**解決方法：**
1. 執行所有遷移：`supabase migration up`
2. 檢查遷移狀態：`supabase migration list`
3. 在 Supabase Studio 中手動執行遷移文件

### 問題 4：端口被占用

**解決方法：**
1. 修改 `.env` 中的 `VITE_APP_PORT`
2. 或停止占用端口的程序

## 📝 重要提醒

1. **`.env` 文件不會提交到 Git**
   - 每個環境需要自己創建 `.env` 文件
   - `.env.example` 會提交，作為範本

2. **資料庫遷移文件會提交到 Git**
   - 確保所有遷移文件都在 `supabase/migrations/` 目錄中
   - 拉取代碼後執行 `supabase migration up` 即可

3. **Supabase 配置**
   - 每個環境的 Supabase URL 和 Key 可能不同
   - 使用 `supabase status` 取得當前環境的配置
