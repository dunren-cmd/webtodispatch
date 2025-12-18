#!/bin/bash
# 從 Windows Desktop 複製 CSV 檔案到當前目錄

echo "============================================================"
echo "📋 複製 CSV 檔案"
echo "============================================================"
echo ""

# 可能的 Windows Desktop 路徑
WIN_PATHS=(
    "/mnt/c/Users/dunre/Desktop"
    "/mnt/c/Users/dunre/Downloads"
    "/mnt/d/Users/dunre/Desktop"
    "/mnt/d/Users/dunre/Downloads"
    "$HOME/Desktop"
    "$HOME/Downloads"
)

SOURCE_DIR=""
TARGET_DIR="$(pwd)"

# 尋找 Windows Desktop
echo "🔍 尋找 CSV 檔案來源..."
for path in "${WIN_PATHS[@]}"; do
    if [ -d "$path" ]; then
        csv_count=$(find "$path" -maxdepth 1 -iname "*.csv" 2>/dev/null | wc -l)
        if [ "$csv_count" -gt 0 ]; then
            echo "✅ 找到：$path ($csv_count 個 CSV 檔案)"
            SOURCE_DIR="$path"
            break
        fi
    fi
done

if [ -z "$SOURCE_DIR" ]; then
    echo "❌ 無法自動找到 CSV 檔案來源"
    echo ""
    echo "請手動指定來源目錄："
    read -p "來源目錄路徑: " SOURCE_DIR
    
    if [ ! -d "$SOURCE_DIR" ]; then
        echo "❌ 目錄不存在：$SOURCE_DIR"
        exit 1
    fi
fi

echo ""
echo "📁 來源目錄：$SOURCE_DIR"
echo "📁 目標目錄：$TARGET_DIR"
echo ""

# 尋找要複製的檔案
echo "🔍 尋找要複製的 CSV 檔案..."
ROLES_FILE=$(find "$SOURCE_DIR" -maxdepth 1 -iname "*roles*.csv" 2>/dev/null | head -1)
USERS_FILE=$(find "$SOURCE_DIR" -maxdepth 1 -iname "*users*.csv" 2>/dev/null | head -1)
TASKS_FILE=$(find "$SOURCE_DIR" -maxdepth 1 -iname "*tasks*.csv" 2>/dev/null | head -1)

# 顯示找到的檔案
FOUND_COUNT=0

if [ -n "$ROLES_FILE" ]; then
    echo "✅ 找到 roles CSV: $(basename "$ROLES_FILE")"
    FOUND_COUNT=$((FOUND_COUNT + 1))
else
    echo "⚠️  未找到 roles CSV"
fi

if [ -n "$USERS_FILE" ]; then
    echo "✅ 找到 users CSV: $(basename "$USERS_FILE")"
    FOUND_COUNT=$((FOUND_COUNT + 1))
else
    echo "⚠️  未找到 users CSV"
fi

if [ -n "$TASKS_FILE" ]; then
    echo "✅ 找到 tasks CSV: $(basename "$TASKS_FILE")"
    FOUND_COUNT=$((FOUND_COUNT + 1))
else
    echo "⚠️  未找到 tasks CSV"
fi

echo ""

if [ $FOUND_COUNT -eq 0 ]; then
    echo "❌ 沒有找到任何 CSV 檔案"
    exit 1
fi

# 確認複製
read -p "確認複製這些檔案到當前目錄？(y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消複製"
    exit 0
fi

echo ""
echo "📋 開始複製..."
echo ""

# 複製檔案
COPIED_COUNT=0

if [ -n "$ROLES_FILE" ]; then
    if cp "$ROLES_FILE" "$TARGET_DIR/roles_rows.csv" 2>/dev/null; then
        echo "✅ 已複製：roles_rows.csv"
        COPIED_COUNT=$((COPIED_COUNT + 1))
    else
        echo "❌ 複製失敗：$(basename "$ROLES_FILE")"
    fi
fi

if [ -n "$USERS_FILE" ]; then
    # 處理檔案名稱中的空格和括號
    if cp "$USERS_FILE" "$TARGET_DIR/users_rows.csv" 2>/dev/null; then
        echo "✅ 已複製：users_rows.csv"
        COPIED_COUNT=$((COPIED_COUNT + 1))
    else
        echo "❌ 複製失敗：$(basename "$USERS_FILE")"
    fi
fi

if [ -n "$TASKS_FILE" ]; then
    if cp "$TASKS_FILE" "$TARGET_DIR/tasks_rows.csv" 2>/dev/null; then
        echo "✅ 已複製：tasks_rows.csv"
        COPIED_COUNT=$((COPIED_COUNT + 1))
    else
        echo "❌ 複製失敗：$(basename "$TASKS_FILE")"
    fi
fi

echo ""
echo "============================================================"
echo "📊 複製結果：成功 $COPIED_COUNT 個檔案"
echo "============================================================"

if [ $COPIED_COUNT -gt 0 ]; then
    echo ""
    echo "✅ 檔案已複製到：$TARGET_DIR"
    echo ""
    echo "現在可以執行匯入："
    echo "  python3 import_all_csv_to_supabase.py \\"
    [ -n "$ROLES_FILE" ] && echo "    --roles roles_rows.csv \\"
    [ -n "$USERS_FILE" ] && echo "    --users users_rows.csv \\"
    [ -n "$TASKS_FILE" ] && echo "    --tasks tasks_rows.csv"
fi
