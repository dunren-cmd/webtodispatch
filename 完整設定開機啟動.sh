#!/bin/bash
# 完整設定開機自動啟動並在背景運行

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================================"
echo "🔧 完整設定 WebToDispatch 開機自動啟動（背景運行）"
echo "============================================================"
echo ""

# 檢查是否為 root 或使用 sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  需要 root 權限來安裝 systemd 服務${NC}"
    echo ""
    echo "請在終端機中執行："
    echo "  sudo ./完整設定開機啟動.sh"
    echo ""
    exit 1
fi

PROJECT_DIR="/home/dunren/cursor/webtodispatch/WebToDispatch_2"
SERVICE_FILE="$PROJECT_DIR/webtodispatch.service"
SYSTEMD_PATH="/etc/systemd/system/webtodispatch.service"
START_SCRIPT="$PROJECT_DIR/start_service.sh"

# 1. 確保啟動腳本有執行權限
echo -e "${BLUE}[1/5] 設定啟動腳本權限...${NC}"
chmod +x "$START_SCRIPT" && echo -e "${GREEN}✅ 完成${NC}" || { echo -e "${RED}❌ 失敗${NC}"; exit 1; }

# 2. 複製服務文件
echo -e "${BLUE}[2/5] 安裝服務文件...${NC}"
cp "$SERVICE_FILE" "$SYSTEMD_PATH" && echo -e "${GREEN}✅ 完成${NC}" || { echo -e "${RED}❌ 失敗${NC}"; exit 1; }

# 3. 重新載入 systemd
echo -e "${BLUE}[3/5] 重新載入 systemd...${NC}"
systemctl daemon-reload && echo -e "${GREEN}✅ 完成${NC}" || { echo -e "${RED}❌ 失敗${NC}"; exit 1; }

# 4. 啟用開機自動啟動
echo -e "${BLUE}[4/5] 啟用開機自動啟動...${NC}"
systemctl enable webtodispatch.service && echo -e "${GREEN}✅ 完成${NC}" || { echo -e "${RED}❌ 失敗${NC}"; exit 1; }

# 5. 啟動服務
echo -e "${BLUE}[5/5] 啟動背景服務...${NC}"
systemctl start webtodispatch.service && echo -e "${GREEN}✅ 完成${NC}" || { echo -e "${RED}❌ 失敗${NC}"; exit 1; }

echo ""
echo "============================================================"
echo -e "${GREEN}✅ 設定完成！${NC}"
echo "============================================================"
echo ""

# 等待服務啟動
sleep 3

# 顯示服務狀態
echo "服務狀態："
systemctl status webtodispatch --no-pager | head -15
echo ""

# 顯示開機自動啟動狀態
echo "開機自動啟動狀態："
ENABLED=$(systemctl is-enabled webtodispatch)
if [ "$ENABLED" = "enabled" ]; then
    echo -e "${GREEN}✅ 已啟用 - 重新開機後會自動啟動${NC}"
else
    echo -e "${YELLOW}⚠️  狀態：$ENABLED${NC}"
fi
echo ""

# 顯示服務運行狀態
echo "服務運行狀態："
ACTIVE=$(systemctl is-active webtodispatch)
if [ "$ACTIVE" = "active" ]; then
    echo -e "${GREEN}✅ 正在運行（背景模式）${NC}"
    echo ""
    echo "訪問地址："
    echo "  📍 本地：http://localhost:3050"
    echo "  🌐 網路：http://$(hostname -I | awk '{print $1}'):3050"
else
    echo -e "${YELLOW}⚠️  狀態：$ACTIVE${NC}"
    echo "查看日誌：sudo journalctl -u webtodispatch -n 50"
fi
echo ""

echo "常用命令："
echo "  查看狀態：    sudo systemctl status webtodispatch"
echo "  查看日誌：    sudo journalctl -u webtodispatch -f"
echo "  停止服務：    sudo systemctl stop webtodispatch"
echo "  重啟服務：    sudo systemctl restart webtodispatch"
echo "  禁用開機啟動：sudo systemctl disable webtodispatch"
echo ""

