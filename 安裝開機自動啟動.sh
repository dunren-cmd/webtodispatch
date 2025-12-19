#!/bin/bash
# 安裝 WebToDispatch 開機自動啟動服務

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================================"
echo "🔧 安裝 WebToDispatch 開機自動啟動服務"
echo "============================================================"
echo ""

# 檢查是否為 root 或使用 sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  需要 root 權限來安裝 systemd 服務${NC}"
    echo "請使用 sudo 執行此腳本："
    echo "  sudo ./安裝開機自動啟動.sh"
    exit 1
fi

PROJECT_DIR="/home/dunren/cursor/webtodispatch/WebToDispatch_2"
SERVICE_FILE="$PROJECT_DIR/webtodispatch.service"
SYSTEMD_PATH="/etc/systemd/system/webtodispatch.service"

# 1. 檢查服務文件是否存在
if [ ! -f "$SERVICE_FILE" ]; then
    echo -e "${RED}❌ 找不到服務文件：$SERVICE_FILE${NC}"
    exit 1
fi

# 2. 檢查啟動腳本是否存在
START_SCRIPT="$PROJECT_DIR/start_service.sh"
if [ ! -f "$START_SCRIPT" ]; then
    echo -e "${RED}❌ 找不到啟動腳本：$START_SCRIPT${NC}"
    exit 1
fi

# 3. 確保啟動腳本有執行權限
chmod +x "$START_SCRIPT"
echo -e "${GREEN}✅ 已設定啟動腳本執行權限${NC}"

# 4. 複製服務文件到 systemd 目錄
echo -e "${BLUE}[1/4] 複製服務文件到 systemd 目錄...${NC}"
cp "$SERVICE_FILE" "$SYSTEMD_PATH"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 服務文件已複製${NC}"
else
    echo -e "${RED}❌ 複製服務文件失敗${NC}"
    exit 1
fi

# 5. 重新載入 systemd
echo -e "${BLUE}[2/4] 重新載入 systemd 配置...${NC}"
systemctl daemon-reload
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ systemd 配置已重新載入${NC}"
else
    echo -e "${RED}❌ 重新載入 systemd 失敗${NC}"
    exit 1
fi

# 6. 啟用開機自動啟動
echo -e "${BLUE}[3/4] 啟用開機自動啟動...${NC}"
systemctl enable webtodispatch.service
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 已啟用開機自動啟動${NC}"
else
    echo -e "${RED}❌ 啟用開機自動啟動失敗${NC}"
    exit 1
fi

# 7. 詢問是否立即啟動服務
echo ""
echo -e "${BLUE}[4/4] 服務安裝完成${NC}"
echo ""
read -p "是否立即啟動服務？(Y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}啟動服務...${NC}"
    systemctl start webtodispatch.service
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 服務已啟動${NC}"
        echo ""
        echo "查看服務狀態："
        echo "  sudo systemctl status webtodispatch"
        echo ""
        echo "查看服務日誌："
        echo "  sudo journalctl -u webtodispatch -f"
        echo "  或"
        echo "  tail -f $PROJECT_DIR/service.log"
    else
        echo -e "${RED}❌ 啟動服務失敗${NC}"
        echo "查看錯誤訊息："
        echo "  sudo systemctl status webtodispatch"
    fi
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✅ 安裝完成！${NC}"
echo "============================================================"
echo ""
echo "常用命令："
echo "  啟動服務：    sudo systemctl start webtodispatch"
echo "  停止服務：    sudo systemctl stop webtodispatch"
echo "  重啟服務：    sudo systemctl restart webtodispatch"
echo "  查看狀態：    sudo systemctl status webtodispatch"
echo "  查看日誌：    sudo journalctl -u webtodispatch -f"
echo "  禁用開機啟動：sudo systemctl disable webtodispatch"
echo "  啟用開機啟動：sudo systemctl enable webtodispatch"
echo ""

