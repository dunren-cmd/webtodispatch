#!/bin/bash
# 檢查開機自動啟動狀態

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================================"
echo "🔍 檢查 WebToDispatch 開機自動啟動狀態"
echo "============================================================"
echo ""

# 1. 檢查服務文件是否存在
echo -e "${BLUE}[1/4] 檢查服務文件...${NC}"
if [ -f /etc/systemd/system/webtodispatch.service ]; then
    echo -e "${GREEN}✅ 服務文件已安裝${NC}"
    echo "   位置：/etc/systemd/system/webtodispatch.service"
else
    echo -e "${RED}❌ 服務文件未安裝${NC}"
    echo "   請執行：sudo ./快速安裝開機啟動.sh"
    echo ""
fi

# 2. 檢查開機自動啟動是否啟用
echo -e "${BLUE}[2/4] 檢查開機自動啟動狀態...${NC}"
if [ -f /etc/systemd/system/webtodispatch.service ]; then
    ENABLED=$(systemctl is-enabled webtodispatch 2>&1)
    if [ "$ENABLED" = "enabled" ]; then
        echo -e "${GREEN}✅ 開機自動啟動已啟用${NC}"
    elif [ "$ENABLED" = "disabled" ]; then
        echo -e "${YELLOW}⚠️  開機自動啟動已禁用${NC}"
        echo "   啟用命令：sudo systemctl enable webtodispatch"
    else
        echo -e "${RED}❌ 無法檢查狀態：$ENABLED${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  服務未安裝，無法檢查${NC}"
fi

# 3. 檢查服務當前狀態
echo -e "${BLUE}[3/4] 檢查服務運行狀態...${NC}"
if [ -f /etc/systemd/system/webtodispatch.service ]; then
    STATUS=$(systemctl is-active webtodispatch 2>&1)
    if [ "$STATUS" = "active" ]; then
        echo -e "${GREEN}✅ 服務正在運行${NC}"
    elif [ "$STATUS" = "inactive" ]; then
        echo -e "${YELLOW}⚠️  服務未運行${NC}"
        echo "   啟動命令：sudo systemctl start webtodispatch"
    else
        echo -e "${RED}❌ 服務狀態異常：$STATUS${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  服務未安裝，無法檢查${NC}"
fi

# 4. 檢查啟動腳本
echo -e "${BLUE}[4/4] 檢查啟動腳本...${NC}"
PROJECT_DIR="/home/dunren/cursor/webtodispatch/WebToDispatch_2"
START_SCRIPT="$PROJECT_DIR/start_service.sh"
if [ -f "$START_SCRIPT" ]; then
    if [ -x "$START_SCRIPT" ]; then
        echo -e "${GREEN}✅ 啟動腳本存在且有執行權限${NC}"
    else
        echo -e "${YELLOW}⚠️  啟動腳本存在但無執行權限${NC}"
        echo "   設定權限：chmod +x $START_SCRIPT"
    fi
else
    echo -e "${RED}❌ 啟動腳本不存在${NC}"
fi

echo ""
echo "============================================================"
echo "📋 總結"
echo "============================================================"

# 總結
if [ -f /etc/systemd/system/webtodispatch.service ]; then
    ENABLED=$(systemctl is-enabled webtodispatch 2>&1)
    if [ "$ENABLED" = "enabled" ]; then
        echo -e "${GREEN}✅ 開機自動啟動已正確設定${NC}"
        echo ""
        echo "重新開機後，服務會自動啟動。"
        echo ""
        echo "測試建議："
        echo "  1. 查看服務狀態：sudo systemctl status webtodispatch"
        echo "  2. 查看服務日誌：sudo journalctl -u webtodispatch -n 50"
        echo "  3. 手動啟動測試：sudo systemctl start webtodispatch"
    else
        echo -e "${YELLOW}⚠️  服務已安裝但開機自動啟動未啟用${NC}"
        echo ""
        echo "請執行以下命令啟用："
        echo "  sudo systemctl enable webtodispatch"
    fi
else
    echo -e "${RED}❌ 服務尚未安裝${NC}"
    echo ""
    echo "請執行以下命令安裝："
    echo "  sudo ./快速安裝開機啟動.sh"
    echo ""
    echo "或手動執行："
    echo "  sudo cp webtodispatch.service /etc/systemd/system/"
    echo "  sudo systemctl daemon-reload"
    echo "  sudo systemctl enable webtodispatch"
fi

echo ""

