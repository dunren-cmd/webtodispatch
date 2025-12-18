# Code.gs 配置說明

## Google Apps Script 配置

`Code.gs` 是 Google Apps Script 後端，用於處理任務通知等功能。

## 配置方式

### 方法 1：使用指令碼屬性（推薦）

1. 在 Google Apps Script 編輯器中
2. 點擊「專案設定」（齒輪圖示）
3. 點擊「指令碼屬性」標籤
4. 新增以下屬性：

| 屬性名稱 | 值 | 說明 |
|---------|-----|------|
| `SUPABASE_URL` | `http://你的IP:54321` | Supabase API URL |
| `SUPABASE_ANON_KEY` | `你的Supabase_ANON_KEY` | Supabase Anon Key |

**優點：**
- 不需要修改程式碼
- 可以為不同環境設定不同值
- 敏感資訊不會在程式碼中

### 方法 2：直接修改常數（簡單但不推薦）

編輯 `Code.gs` 第 7-8 行：

```javascript
const SUPABASE_URL = "http://你的IP:54321";
const SUPABASE_ANON_KEY = "你的Supabase_ANON_KEY";
```

## 取得 Supabase 配置

執行以下命令取得配置：

```bash
supabase status
```

複製 `API URL` 和 `anon key` 到指令碼屬性或常數中。

## 不同環境的配置

### 環境 A

```
SUPABASE_URL: http://192.168.62.101:54321
SUPABASE_ANON_KEY: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 環境 B

```
SUPABASE_URL: http://192.168.1.100:54321
SUPABASE_ANON_KEY: 從該環境的 supabase status 取得
```

## 注意事項

1. **指令碼屬性優先**：如果設定了指令碼屬性，會優先使用
2. **常數作為備用**：如果沒有指令碼屬性，會使用常數定義
3. **環境一致性**：確保 Code.gs 的配置與前端 `.env` 中的配置一致
