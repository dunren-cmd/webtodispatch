# 任務交辦系統

智慧化成果管理系統 - 任務交辦暨統計儀表板

## 🚀 快速開始

### 從 Git 拉取代碼後

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設定環境變數**
   ```bash
   # Windows
   copy .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```
   
   然後編輯 `.env` 文件，填入你的 Supabase 配置：
   ```env
   VITE_SUPABASE_URL=http://你的IP:54321
   VITE_SUPABASE_ANON_KEY=你的Supabase_ANON_KEY
   ```

3. **啟動 Supabase**
   ```bash
   supabase start
   ```
   
   取得配置：
   ```bash
   supabase status
   ```

4. **執行資料庫遷移和種子資料**
   ```bash
   # 重置資料庫（會執行所有 migrations 和 seed.sql）
   supabase db reset
   
   # 或只執行遷移（如果只需要結構）
   supabase migration up
   
   # 然後執行種子資料（如果需要資料內容）
   supabase db seed
   ```
   
   這會執行所有遷移文件，確保資料庫**結構**和**資料內容**都一致。

5. **啟動應用**
   ```bash
   npm run dev
   ```

或直接執行 `start.bat`（Windows）自動完成以上步驟。

## 📁 專案結構

```
WebToDispatch_2/
├── src/
│   ├── App.tsx          # 主應用程式
│   ├── main.tsx         # 入口文件
│   └── index.css        # 樣式
├── supabase/
│   ├── migrations/      # 資料庫遷移文件
│   ├── config.toml      # Supabase 配置
│   └── seed.sql         # 種子資料
├── api.ts               # API 服務（Supabase 通訊）
├── Code.gs              # Google Apps Script 後端
├── .env.example         # 環境變數範本
├── .env                 # 環境變數（不提交到 Git）
└── package.json         # 專案依賴
```

## 🔧 環境變數

所有配置都在 `.env` 文件中：

```env
# Supabase 配置
VITE_SUPABASE_URL=http://192.168.68.75:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# 前端應用程式配置
VITE_APP_PORT=3050
VITE_APP_HOST=0.0.0.0
```

**重要：**
- `.env` 文件不會提交到 Git
- 每個環境需要自己創建 `.env` 文件
- 參考 `.env.example` 作為範本

## 📊 資料庫結構

### 表結構

- **users** - 用戶表
  - `id` (BIGINT, PRIMARY KEY)
  - `name` (TEXT)
  - `role` (TEXT, FOREIGN KEY → roles.id)
  - `level` (INTEGER, 1-4)
  - `mail` (TEXT)
  - `employee_id` (TEXT)
  - `headshot` (TEXT)

- **tasks** - 任務表
  - `id` (BIGINT, PRIMARY KEY)
  - `title` (TEXT)
  - `description` (TEXT)
  - `assigner_id` (BIGINT)
  - `assignee_id` (BIGINT)
  - `role_category` (TEXT)
  - `status` (TEXT)
  - `evidence` (JSONB)

- **roles** - 角色表（一對多關聯）
  - `id` (TEXT, PRIMARY KEY)
  - `name` (TEXT)
  - `level` (INTEGER, 1-4)
  - `webhook` (TEXT)
  - `icon_name` (TEXT)
  - `color` (TEXT)

### 關聯關係

```
roles (一)  ──────<  users (多)
  id              role (外鍵)
```

## 🔄 資料庫遷移

所有遷移文件在 `supabase/migrations/` 目錄中，按時間戳順序執行：

1. `20251212134638_init.sql` - 創建 users 和 tasks 表
2. `20251212170000_merge_personnel_to_users.sql` - 添加 mail, employee_id, headshot
3. `20251213000000_change_avatar_to_level.sql` - 添加 level，移除 avatar
4. `20251213120000_update_level5_to_level4.sql` - 更新 level 5 為 4
5. `20251214000000_fix_users_table_structure.sql` - 修復 users 表結構
6. `20251215000000_create_roles_table.sql` - 創建 roles 表並建立關聯

**執行遷移：**
```bash
supabase migration up
```

## 🌍 不同環境配置

### 開發環境

```env
VITE_SUPABASE_URL=http://192.168.68.75:54321
VITE_SUPABASE_ANON_KEY=從 supabase status 取得
```

### 其他電腦

1. 修改 `.env` 中的 `VITE_SUPABASE_URL` 為該電腦的 IP
2. 執行 `supabase status` 取得該電腦的 `anon key`
3. 更新 `.env` 中的 `VITE_SUPABASE_ANON_KEY`

### 生產環境

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=生產環境Key
```

## 📝 開發指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 🔍 驗證資料庫

### 檢查表是否存在

在 Supabase Studio SQL Editor 中執行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

應該看到：`users`, `tasks`, `roles`

### 檢查關聯

```sql
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

## 📊 資料庫資料同步

### 確保資料內容一致

除了資料庫結構，資料內容也需要同步：

1. **導出當前資料**
   ```bash
   # 執行導出腳本
   導出資料庫資料_完整版.bat
   ```
   
   或在 Supabase Studio 中執行 `生成資料導出SQL.sql` 中的查詢

2. **更新 seed.sql**
   - 將導出的 INSERT 語句貼到 `supabase/seed.sql`
   - 使用 `ON CONFLICT` 避免重複插入

3. **在其他環境中執行**
   ```bash
   supabase db reset  # 會執行所有 migrations 和 seed.sql
   ```

詳細說明請參考：[資料庫資料同步說明](./資料庫資料同步說明.md)

## 📚 相關文件

- [環境變數設定說明](./環境變數設定說明.md)
- [快速啟動指南](./快速啟動指南.md)
- [資料庫資料同步說明](./資料庫資料同步說明.md)
- [roles_users關聯說明](./roles_users關聯說明.md)
- [本地端_Supabase_設定](./本地端_Supabase_設定.md)

## ⚠️ 重要提醒

1. **環境變數**：每個環境需要自己創建 `.env` 文件
2. **資料庫遷移**：拉取代碼後必須執行 `supabase migration up` 或 `supabase db reset`
3. **資料庫資料**：執行 `supabase db reset` 或 `supabase db seed` 確保資料內容一致
4. **Supabase 配置**：使用 `supabase status` 取得當前環境的配置
5. **資料一致性**：
   - **結構一致性**：確保所有遷移文件都已執行
   - **資料一致性**：確保 seed.sql 已更新並執行

## 🐛 故障排除

詳見 [快速啟動指南](./快速啟動指南.md) 的故障排除章節。
