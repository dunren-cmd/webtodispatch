#!/bin/bash
# 執行 CSV 匯入

echo "============================================================"
echo "📥 CSV 匯入 Supabase"
echo "============================================================"
echo ""

# 檢查 Supabase 連接
echo "🔍 檢查 Supabase 連接..."
if curl -s http://192.168.62.101:54321/rest/v1/ > /dev/null 2>&1; then
    echo "✅ Supabase API 連接正常"
else
    echo "❌ 無法連接到 Supabase API"
    exit 1
fi
echo ""

# 提示用戶提供檔案路徑
echo "請提供 CSV 檔案路徑："
echo ""
read -p "roles CSV 路徑（留空跳過）: " ROLES_PATH
read -p "users CSV 路徑（留空跳過）: " USERS_PATH  
read -p "tasks CSV 路徑（留空跳過）: " TASKS_PATH
echo ""

# 建立命令
CMD="python3 import_all_csv_to_supabase.py"

if [ -n "$ROLES_PATH" ]; then
    CMD="$CMD --roles \"$ROLES_PATH\""
fi

if [ -n "$USERS_PATH" ]; then
    CMD="$CMD --users \"$USERS_PATH\""
fi

if [ -n "$TASKS_PATH" ]; then
    CMD="$CMD --tasks \"$TASKS_PATH\""
fi

# 執行匯入
echo "🚀 開始匯入..."
echo ""
eval $CMD
