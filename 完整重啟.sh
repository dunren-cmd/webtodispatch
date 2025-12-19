#!/bin/bash
# 完整重啟專案腳本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================================"
echo "🔄 完整重啟 WebToDispatch 專案"
echo "============================================================"
echo ""

cd "$(dirname "$0")"

# 1. 停止現有服務
echo -e "${BLUE}[1/5] 停止現有服務...${NC}"
pkill -f "vite.*--host" 2>/dev/null
sleep 2
echo -e "${GREEN}✅ 前端服務已停止${NC}"
echo ""

# 2. 檢查並重啟 Supabase
echo -e "${BLUE}[2/5] 檢查 Supabase 服務...${NC}"
if curl -s http://192.168.62.101:54321/rest/v1/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Supabase 正在運行${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase 未運行，嘗試啟動...${NC}"
    if command -v supabase &> /dev/null; then
        supabase start
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Supabase 已啟動${NC}"
        else
            echo -e "${RED}❌ Supabase 啟動失敗${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ 找不到 supabase 命令${NC}"
        exit 1
    fi
fi
echo ""

# 3. 檢查環境變數
echo -e "${BLUE}[3/5] 檢查環境變數...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  未找到 .env 文件${NC}"
    if [ -f .env.example ]; then
        echo "從 .env.example 創建 .env..."
        cp .env.example .env
        echo -e "${GREEN}✅ 已創建 .env 文件${NC}"
        echo -e "${YELLOW}請編輯 .env 文件設定 Supabase 配置${NC}"
    else
        echo -e "${RED}❌ 找不到 .env.example 文件${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env 文件存在${NC}"
fi
echo ""

# 4. 檢查依賴
echo -e "${BLUE}[4/5] 檢查依賴...${NC}"
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  node_modules 不存在，安裝依賴...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 安裝依賴失敗${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 依賴安裝完成${NC}"
else
    echo -e "${GREEN}✅ node_modules 已存在${NC}"
fi
echo ""

# 5. 啟動前端服務
echo -e "${BLUE}[5/5] 啟動前端服務...${NC}"
echo ""
echo "============================================================"
echo -e "${GREEN}🚀 啟動前端開發伺服器${NC}"
echo "============================================================"
echo ""
echo "前端將在以下地址啟動："
echo "  📍 本地：http://localhost:3050"
echo "  🌐 網路：http://$(hostname -I | awk '{print $1}'):3050"
echo ""
echo "Supabase API："
echo "  📍 http://192.168.62.101:54321"
echo ""
echo "按 Ctrl+C 停止服務"
echo "============================================================"
echo ""

npm run dev
