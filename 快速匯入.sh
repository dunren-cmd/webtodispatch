#!/bin/bash
# 快速匯入 CSV 到 Supabase

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================================"
echo "📥 CSV 匯入 Supabase 快速腳本"
echo "============================================================"
echo ""

# 檢查 Supabase 狀態
echo "🔍 檢查 Supabase 狀態..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI 未安裝${NC}"
    exit 1
fi

# 設定預設路徑
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLES_CSV="${1:-roles_rows.csv}"
USERS_CSV="${2:-users_rows (2).csv}"
TASKS_CSV="${3:-tasks_rows.csv}"

# 檢查檔案是否存在
check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${YELLOW}⚠️  檔案不存在：$1${NC}"
        return 1
    else
        echo -e "${GREEN}✅ 找到檔案：$1${NC}"
        return 0
    fi
}

echo "📁 檢查 CSV 檔案..."
ROLES_EXISTS=0
USERS_EXISTS=0
TASKS_EXISTS=0

if check_file "$ROLES_CSV"; then
    ROLES_EXISTS=1
fi

if check_file "$USERS_CSV"; then
    USERS_EXISTS=1
fi

if check_file "$TASKS_CSV"; then
    TASKS_EXISTS=1
fi

echo ""

# 如果沒有任何檔案，提示用戶
if [ $ROLES_EXISTS -eq 0 ] && [ $USERS_EXISTS -eq 0 ] && [ $TASKS_EXISTS -eq 0 ]; then
    echo -e "${RED}❌ 沒有找到任何 CSV 檔案${NC}"
    echo ""
    echo "使用方法："
    echo "  $0 [roles_csv] [users_csv] [tasks_csv]"
    echo ""
    echo "範例："
    echo "  $0 roles_rows.csv \"users_rows (2).csv\" tasks_rows.csv"
    echo ""
    exit 1
fi

# 建立命令參數
CMD="python3 import_all_csv_to_supabase.py"

if [ $ROLES_EXISTS -eq 1 ]; then
    CMD="$CMD --roles \"$ROLES_CSV\""
fi

if [ $USERS_EXISTS -eq 1 ]; then
    CMD="$CMD --users \"$USERS_CSV\""
fi

if [ $TASKS_EXISTS -eq 1 ]; then
    CMD="$CMD --tasks \"$TASKS_CSV\""
fi

echo "🚀 開始匯入..."
echo ""
echo "執行命令："
echo "  $CMD"
echo ""

# 執行匯入
eval $CMD

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ 匯入完成！${NC}"
else
    echo -e "${RED}❌ 匯入失敗（退出碼：$EXIT_CODE）${NC}"
fi

exit $EXIT_CODE

