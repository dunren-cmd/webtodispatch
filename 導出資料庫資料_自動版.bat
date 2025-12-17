@echo off
chcp 65001 >nul
echo ========================================
echo 自動導出資料庫資料到 seed.sql
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 檢查 Supabase 狀態...
supabase status >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase 未啟動，請先執行：supabase start
    pause
    exit /b 1
)
echo ✅ Supabase 正在運行
echo.

echo [2/4] 備份現有 seed.sql...
if exist "supabase\seed.sql" (
    copy "supabase\seed.sql" "supabase\seed.sql.backup" >nul
    echo ✅ 已備份現有 seed.sql
)
echo.

echo [3/4] 生成導出 SQL 查詢...
(
    echo -- ========================================
    echo -- 資料庫種子資料
    echo -- 導出時間: %date% %time%
    echo -- 此文件包含所有表的初始資料
    echo -- ========================================
    echo.
    echo -- 注意：此文件會在 supabase db reset 時自動執行
    echo -- 如果表已存在資料，請先清空或使用 INSERT ... ON CONFLICT
    echo.
    echo -- ========================================
    echo -- 1. 清空現有資料（可選）
    echo -- ========================================
    echo -- TRUNCATE TABLE tasks CASCADE;
    echo -- TRUNCATE TABLE users CASCADE;
    echo -- TRUNCATE TABLE roles CASCADE;
    echo.
    echo -- ========================================
    echo -- 2. 插入 roles 表資料
    echo -- ========================================
    echo -- 請在 Supabase Studio SQL Editor 中執行以下查詢來生成 INSERT 語句：
    echo.
    echo -- SELECT 'INSERT INTO roles (id, name, icon_name, color, level, webhook, is_default, created_at, updated_at) VALUES (' ||
    echo --        quote_literal(id) || ', ' ||
    echo --        quote_literal(name) || ', ' ||
    echo --        COALESCE(quote_literal(icon_name), 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(color), 'NULL') || ', ' ||
    echo --        COALESCE(level::text, 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(webhook), 'NULL') || ', ' ||
    echo --        COALESCE(is_default::text, 'NULL') || ', ' ||
    echo --        COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
    echo --        COALESCE('''' || updated_at::text || '''', 'NULL') || ');'
    echo -- FROM roles ORDER BY id;
    echo.
    echo -- ========================================
    echo -- 3. 插入 users 表資料
    echo -- ========================================
    echo -- SELECT 'INSERT INTO users (id, name, role, level, mail, employee_id, headshot) VALUES (' ||
    echo --        id::text || ', ' ||
    echo --        quote_literal(name) || ', ' ||
    echo --        COALESCE(quote_literal(role), 'NULL') || ', ' ||
    echo --        COALESCE(level::text, '4') || ', ' ||
    echo --        COALESCE(quote_literal(mail), 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(employee_id), 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(headshot), 'NULL') || ');'
    echo -- FROM users ORDER BY id;
    echo.
    echo -- ========================================
    echo -- 4. 插入 tasks 表資料
    echo -- ========================================
    echo -- SELECT 'INSERT INTO tasks (id, title, description, assigner_id, assignee_id, role_category, status, evidence, created_at, updated_at) VALUES (' ||
    echo --        id::text || ', ' ||
    echo --        quote_literal(title) || ', ' ||
    echo --        COALESCE(quote_literal(description), 'NULL') || ', ' ||
    echo --        COALESCE(assigner_id::text, 'NULL') || ', ' ||
    echo --        COALESCE(assignee_id::text, 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(role_category), 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(status), 'NULL') || ', ' ||
    echo --        COALESCE(quote_literal(evidence::text), 'NULL') || ', ' ||
    echo --        COALESCE('''' || created_at::text || '''', 'NULL') || ', ' ||
    echo --        COALESCE('''' || updated_at::text || '''', 'NULL') || ');'
    echo -- FROM tasks ORDER BY id;
    echo.
    echo -- ========================================
    echo -- 使用說明：
    echo -- 1. 在 Supabase Studio SQL Editor 中執行上面的 SELECT 查詢
    echo -- 2. 複製查詢結果（INSERT 語句）
    echo -- 3. 貼到此文件中對應的位置
    echo -- 4. 或使用 pg_dump 導出：pg_dump -t roles -t users -t tasks --data-only
    echo -- ========================================
) > "supabase\seed.sql"

echo ✅ 已生成 seed.sql 範本
echo.

echo [4/4] 生成 pg_dump 命令...
echo.
echo 你也可以使用 pg_dump 直接導出資料：
echo.
echo pg_dump -h localhost -p 54322 -U postgres -d postgres ^
echo        -t roles -t users -t tasks ^
echo        --data-only --inserts ^
echo        -f supabase\seed.sql
echo.
echo 或使用 Supabase CLI：
echo.
echo supabase db dump --data-only -f supabase\seed.sql
echo.
echo ========================================
echo 完成！
echo ========================================
echo.
echo 下一步：
echo 1. 打開 supabase\seed.sql
echo 2. 在 Supabase Studio 中執行上面的 SELECT 查詢
echo 3. 複製結果並貼到 seed.sql 中
echo 4. 或使用 pg_dump 命令直接導出
echo.
pause
