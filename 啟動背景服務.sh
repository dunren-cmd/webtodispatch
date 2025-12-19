#!/bin/bash
# 啟動 WebToDispatch 背景服務

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================================"
echo "🚀 啟動 WebToDispatch 背景服務"
echo "============================================================"
echo ""

# 檢查服務是否已安裝
if [ ! -f /etc/systemd/system/webtodispatch.service ]; then
    echo -e "${RED}❌ 服務尚未安裝${NC}"
    echo ""
    echo "請先執行安裝："
    echo "  sudo ./快速安裝開機啟動.sh"
    echo ""
    exit 1
fi

# 檢查開機自動啟動是否啟用
ENABLED=$(systemctl is-enabled webtodispatch 2>&1)
if [ "$ENABLED" != "enabled" ]; then
    echo -e "${YELLOW}⚠️  開機自動啟動未啟用${NC}"
    echo "正在啟用開機自動啟動..."
    sudo systemctl enable webtodispatch.service
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 已啟用開機自動啟動${NC}"
    else
        echo -e "${RED}❌ 啟用失敗${NC}"
        exit 1
    fi
    echo ""
fi

# 檢查服務當前狀態
STATUS=$(systemctl is-active webtodispatch 2>&1)
if [ "$STATUS" = "active" ]; then
    echo -e "${GREEN}✅ 服務已在運行中${NC}"
    echo ""
    echo "服務狀態："
    sudo systemctl status webtodispatch --no-pager | head -15
    exit 0
fi

# 啟動服務
echo -e "${BLUE}正在啟動服務...${NC}"
sudo systemctl start webtodispatch.service

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 服務已啟動${NC}"
    echo ""
    
    # 等待服務完全啟動
    sleep 3
    
    # 顯示服務狀態
    echo "服務狀態："
    sudo systemctl status webtodispatch --no-pager | head -15
    echo ""
    
    # 檢查端口
    if netstat -tlnp 2>/dev/null | grep -q :3050 || ss -tlnp 2>/dev/null | grep -q :3050; then
        echo -e "${GREEN}✅ 前端服務正在監聽端口 3050${NC}"
    fi
    
    echo ""
    echo "============================================================"
    echo -e "${GREEN}✅ 服務已在背景運行${NC}"
    echo "============================================================"
    echo ""
    echo "訪問地址："
    echo "  📍 本地：http://localhost:3050"
    echo "  🌐 網路：http://$(hostname -I | awk '{print $1}'):3050"
    echo ""
    echo "常用命令："
    echo "  查看狀態：    sudo systemctl status webtodispatch"
    echo "  查看日誌：    sudo journalctl -u webtodispatch -f"
    echo "  停止服務：    sudo systemctl stop webtodispatch"
    echo "  重啟服務：    sudo systemctl restart webtodispatch"
    echo ""
else
    echo -e "${RED}❌ 啟動失敗${NC}"
    echo ""
    echo "查看錯誤訊息："
    sudo systemctl status webtodispatch --no-pager
    echo ""
    echo "查看日誌："
    sudo journalctl -u webtodispatch -n 50 --no-pager
    exit 1
fi

