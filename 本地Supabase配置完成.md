# 本地 Supabase 配置完成報告

## ✅ 已完成的步驟

### 1. 安裝 Supabase CLI ✓
- 作為項目 dev dependency 安裝
- 使用 `npx supabase` 運行命令

### 2. 安裝 Docker ✓
- Docker 版本: 28.2.2
- Docker Compose 已安裝
- Docker 服務已啟動並啟用

### 3. 初始化 Supabase ✓
- Supabase 配置已存在於 `supabase/config.toml`
- 遷移文件已準備就緒

### 4. 啟動 Supabase ✓
- 所有 Docker 容器已啟動
- 資料庫遷移已成功執行
- 種子資料已載入

### 5. 獲取配置信息 ✓
- Project URL: http://127.0.0.1:54321
- Publishable Key: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- Secret Key: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`

### 6. 創建 .env 文件 ✓
- 文件位置: `/home/dunren/cursor/webtodispatch/WebToDispatch_2/.env`
- 內容:
  ```
  VITE_SUPABASE_URL=http://127.0.0.1:54321
  VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
  ```

### 7. 執行資料庫遷移 ✓
- 所有遷移文件已成功執行
- 資料庫結構已建立
- 種子資料已載入

## 🔧 修復的問題

在部署過程中修復了以下遷移文件的問題：

1. **20251212155000_fill_personneldata_id.sql**
   - 問題: 引用不存在的 `PersonnelData` 表
   - 修復: 更新為使用 `personnel` 表

2. **20251212160000_link_users_personnel.sql**
   - 問題: 引用不存在的 `PersonnelData` 表
   - 修復: 更新所有引用為 `personnel` 表

3. **20251212170000_merge_personnel_to_users.sql**
   - 問題: 引用不存在的 `PersonnelData` 表，欄位名稱不匹配
   - 修復: 更新為使用 `personnel` 表，修正欄位名稱（`role` 和 `email`）

4. **20251213000000_change_avatar_to_level.sql**
   - 問題: 無法刪除 `avatar` 欄位，因為視圖依賴它
   - 修復: 先刪除視圖，刪除欄位後重新創建視圖

## 🌐 服務地址

### 開發工具
- **Supabase Studio**: http://127.0.0.1:54323
- **Mailpit**: http://127.0.0.1:54324

### API 端點
- **Project URL**: http://127.0.0.1:54321
- **REST API**: http://127.0.0.1:54321/rest/v1
- **GraphQL API**: http://127.0.0.1:54321/graphql/v1
- **Edge Functions**: http://127.0.0.1:54321/functions/v1

### 資料庫
- **連接字串**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

## 🚀 下一步

### 啟動應用程式

```bash
cd /home/dunren/cursor/webtodispatch/WebToDispatch_2
npm run dev
```

應用將在 `http://localhost:5173` 啟動（或 Vite 顯示的端口）。

### 常用 Supabase 命令

```bash
# 查看狀態
npx supabase status

# 停止 Supabase
npx supabase stop

# 啟動 Supabase
npx supabase start

# 重置資料庫（會執行所有遷移和種子資料）
npx supabase db reset

# 查看日誌
npx supabase logs
```

## 📝 注意事項

1. **Docker 權限**: 如果遇到 Docker 權限問題，可能需要重新登錄或執行：
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **端口衝突**: 確保以下端口未被占用：
   - 54321 (Supabase API)
   - 54322 (PostgreSQL)
   - 54323 (Studio)
   - 54324 (Mailpit)

3. **環境變數**: `.env` 文件已創建，應用程式會自動讀取這些變數。

4. **資料庫遷移**: 所有遷移已成功執行，資料庫結構已建立。

## ✅ 配置完成

本地 Supabase 環境已完全配置並運行！您可以開始開發應用程式了。

---

**配置時間**: 2025-12-18  
**項目位置**: `/home/dunren/cursor/webtodispatch/WebToDispatch_2`



