#!/bin/bash
# 互動式 CSV 匯入腳本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================================"
echo "📥 互動式 CSV 匯入 Supabase"
echo "============================================================"
echo ""

# 檢查 Supabase 連接
echo -e "${BLUE}🔍 檢查 Supabase 連接...${NC}"
if curl -s http://192.168.62.101:54321/rest/v1/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Supabase API 連接正常${NC}"
else
    echo -e "${RED}❌ 無法連接到 Supabase API${NC}"
    echo "請確認 Supabase 服務正在運行"
    exit 1
fi
echo ""

# 尋找 CSV 檔案
echo -e "${BLUE}📁 尋找 CSV 檔案...${NC}"

# 可能的檔案位置
POSSIBLE_PATHS=(
    "."
    "$HOME/Desktop"
    "$HOME/Downloads"
    "/mnt/c/Users/dunre/Desktop"
    "/mnt/c/Users/dunre/Downloads"
)

ROLES_FILE=""
USERS_FILE=""
TASKS_FILE=""

# 搜尋檔案
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        # 尋找 roles CSV
        if [ -z "$ROLES_FILE" ]; then
            found=$(find "$path" -maxdepth 1 -iname "*roles*.csv" 2>/dev/null | head -1)
            if [ -n "$found" ]; then
                ROLES_FILE="$found"
            fi
        fi
        
        # 尋找 users CSV
        if [ -z "$USERS_FILE" ]; then
            found=$(find "$path" -maxdepth 1 -iname "*users*.csv" 2>/dev/null | head -1)
            if [ -n "$found" ]; then
                USERS_FILE="$found"
            fi
        fi
        
        # 尋找 tasks CSV
        if [ -z "$TASKS_FILE" ]; then
            found=$(find "$path" -maxdepth 1 -iname "*tasks*.csv" 2>/dev/null | head -1)
            if [ -n "$found" ]; then
                TASKS_FILE="$found"
            fi
        fi
    fi
done

# 顯示找到的檔案
echo ""
if [ -n "$ROLES_FILE" ]; then
    echo -e "${GREEN}✅ 找到 roles CSV: $ROLES_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  未找到 roles CSV${NC}"
fi

if [ -n "$USERS_FILE" ]; then
    echo -e "${GREEN}✅ 找到 users CSV: $USERS_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  未找到 users CSV${NC}"
fi

if [ -n "$TASKS_FILE" ]; then
    echo -e "${GREEN}✅ 找到 tasks CSV: $TASKS_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  未找到 tasks CSV${NC}"
fi

echo ""

# 如果沒有找到任何檔案，提示用戶
if [ -z "$ROLES_FILE" ] && [ -z "$USERS_FILE" ] && [ -z "$TASKS_FILE" ]; then
    echo -e "${RED}❌ 沒有找到任何 CSV 檔案${NC}"
    echo ""
    echo "請將 CSV 檔案放在以下位置之一："
    echo "  - 當前目錄：$(pwd)"
    echo "  - Desktop: $HOME/Desktop"
    echo "  - Downloads: $HOME/Downloads"
    echo ""
    echo "或者手動指定檔案路徑："
    read -p "roles CSV 路徑（留空跳過）: " ROLES_FILE
    read -p "users CSV 路徑（留空跳過）: " USERS_FILE
    read -p "tasks CSV 路徑（留空跳過）: " TASKS_FILE
fi

# 確認匯入
echo ""
echo "============================================================"
echo "準備匯入以下檔案："
[ -n "$ROLES_FILE" ] && echo "  ✅ roles: $ROLES_FILE"
[ -n "$USERS_FILE" ] && echo "  ✅ users: $USERS_FILE"
[ -n "$TASKS_FILE" ] && echo "  ✅ tasks: $TASKS_FILE"
echo "============================================================"
echo ""

read -p "確認開始匯入？(y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消匯入"
    exit 0
fi

echo ""
echo "🚀 開始匯入..."
echo ""

# 建立命令
CMD="python3 import_all_csv_to_supabase.py"

if [ -n "$ROLES_FILE" ] && [ -f "$ROLES_FILE" ]; then
    CMD="$CMD --roles \"$ROLES_FILE\""
fi

if [ -n "$USERS_FILE" ] && [ -f "$USERS_FILE" ]; then
    CMD="$CMD --users \"$USERS_FILE\""
fi

if [ -n "$TASKS_FILE" ] && [ -f "$TASKS_FILE" ]; then
    CMD="$CMD --tasks \"$TASKS_FILE\""
fi

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

