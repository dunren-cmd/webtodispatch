@echo off
chcp 65001 >nul
echo ========================================
echo 導出資料庫資料到 seed.sql
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 檢查 Supabase 狀態...
supabase status >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase 未啟動，請先執行：supabase start
    pause
    exit /b 1
)
echo ✅ Supabase 正在運行
echo.

echo [2/3] 取得資料庫連接資訊...
for /f "tokens=*" %%i in ('supabase status --output json ^| findstr "DB_URL"') do set DB_URL=%%i
echo ✅ 已取得資料庫連接資訊
echo.

echo [3/3] 導出資料...
echo.
echo 正在導出以下表的資料：
echo   - roles
echo   - users
echo   - tasks
echo.

REM 創建臨時 SQL 文件來導出資料
echo -- 導出時間: %date% %time% > temp_export.sql
echo -- 此文件包含當前資料庫的所有資料 >> temp_export.sql
echo. >> temp_export.sql
echo -- 清空現有資料（可選，取消註解以啟用） >> temp_export.sql
echo -- TRUNCATE TABLE tasks CASCADE; >> temp_export.sql
echo -- TRUNCATE TABLE users CASCADE; >> temp_export.sql
echo -- TRUNCATE TABLE roles CASCADE; >> temp_export.sql
echo. >> temp_export.sql

echo 請在 Supabase Studio 中執行以下 SQL 查詢來導出資料：
echo.
echo ========================================
echo 1. 導出 roles 表資料：
echo ========================================
echo.
echo COPY (SELECT * FROM roles ORDER BY id) TO STDOUT WITH CSV HEADER;
echo.
echo 或使用 INSERT 語句：
echo.
echo SELECT 'INSERT INTO roles (id, name, icon_name, color, level, webhook, is_default, created_at, updated_at) VALUES (' ||
echo        quote_literal(id) || ', ' ||
echo        quote_literal(name) || ', ' ||
echo        COALESCE(quote_literal(icon_name), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(color), 'NULL') || ', ' ||
echo        COALESCE(level::text, 'NULL') || ', ' ||
echo        COALESCE(quote_literal(webhook), 'NULL') || ', ' ||
echo        COALESCE(is_default::text, 'NULL') || ', ' ||
echo        COALESCE(quote_literal(created_at::text), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(updated_at::text), 'NULL') || ');'
echo FROM roles ORDER BY id;
echo.
echo ========================================
echo 2. 導出 users 表資料：
echo ========================================
echo.
echo SELECT 'INSERT INTO users (id, name, role, level, mail, employee_id, headshot) VALUES (' ||
echo        id::text || ', ' ||
echo        quote_literal(name) || ', ' ||
echo        COALESCE(quote_literal(role), 'NULL') || ', ' ||
echo        COALESCE(level::text, '4') || ', ' ||
echo        COALESCE(quote_literal(mail), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(employee_id), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(headshot), 'NULL') || ');'
echo FROM users ORDER BY id;
echo.
echo ========================================
echo 3. 導出 tasks 表資料：
echo ========================================
echo.
echo SELECT 'INSERT INTO tasks (id, title, description, assigner_id, assignee_id, role_category, status, evidence, created_at, updated_at) VALUES (' ||
echo        id::text || ', ' ||
echo        quote_literal(title) || ', ' ||
echo        COALESCE(quote_literal(description), 'NULL') || ', ' ||
echo        COALESCE(assigner_id::text, 'NULL') || ', ' ||
echo        COALESCE(assignee_id::text, 'NULL') || ', ' ||
echo        COALESCE(quote_literal(role_category), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(status), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(evidence::text), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(created_at::text), 'NULL') || ', ' ||
echo        COALESCE(quote_literal(updated_at::text), 'NULL') || ');'
echo FROM tasks ORDER BY id;
echo.
echo ========================================
echo 完成！
echo ========================================
echo.
echo 請按照以下步驟操作：
echo 1. 打開 Supabase Studio: http://localhost:54323
echo 2. 進入 SQL Editor
echo 3. 執行上面的 SQL 查詢
echo 4. 複製結果並貼到 seed.sql 文件中
echo 5. 或使用「導出資料庫資料_自動版.bat」自動完成
echo.
pause
