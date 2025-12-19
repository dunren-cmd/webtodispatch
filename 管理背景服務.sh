#!/bin/bash
# WebToDispatch 背景服務管理腳本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/home/dunren/cursor/webtodispatch/WebToDispatch_2"
cd "$PROJECT_DIR" || exit 1

# 查找運行中的進程
find_process() {
    # 查找 vite 相關進程
    ps aux | grep -E "node.*vite|vite.*--host" | grep -v grep | grep -v "grep" | awk '{print $2}' | head -1
}

# 檢查服務狀態
check_status() {
    # 檢查端口是否在監聽
    PORT_CHECK=$(netstat -tlnp 2>/dev/null | grep :3050 || ss -tlnp 2>/dev/null | grep :3050)
    if [ -n "$PORT_CHECK" ]; then
        PID=$(echo "$PORT_CHECK" | grep -oP 'pid=\K[0-9]+' || find_process)
        echo -e "${GREEN}✅ 服務正在運行${NC}"
        echo "  進程 ID: $PID"
        echo "  監聽端口: 3050"
        echo "  訪問地址: http://localhost:3050"
        echo "  網路地址: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo 'localhost'):3050"
        return 0
    fi
    
    PID=$(find_process)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}⚠️  進程存在但端口未監聽（PID: $PID）${NC}"
        return 1
    fi
    
    echo -e "${RED}❌ 服務未運行${NC}"
    return 1
}

# 啟動服務
start_service() {
    PID=$(find_process)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}⚠️  服務已在運行中（PID: $PID）${NC}"
        return 0
    fi
    
    echo -e "${BLUE}正在啟動服務...${NC}"
    cd "$PROJECT_DIR"
    nohup npm run dev > /tmp/webtodispatch.log 2>&1 &
    
    sleep 3
    
    if check_status > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服務已成功啟動${NC}"
        PID=$(find_process)
        echo "  進程 ID: $PID"
        echo "  日誌文件: /tmp/webtodispatch.log"
    else
        echo -e "${RED}❌ 啟動失敗${NC}"
        echo "查看日誌: tail -f /tmp/webtodispatch.log"
        return 1
    fi
}

# 停止服務
stop_service() {
    PID=$(find_process)
    if [ -z "$PID" ]; then
        echo -e "${YELLOW}⚠️  服務未運行${NC}"
        return 0
    fi
    
    echo -e "${BLUE}正在停止服務（PID: $PID）...${NC}"
    kill $PID 2>/dev/null
    
    sleep 2
    
    # 如果還在運行，強制停止
    PID=$(find_process)
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}強制停止...${NC}"
        kill -9 $PID 2>/dev/null
    fi
    
    sleep 1
    
    PID=$(find_process)
    if [ -z "$PID" ]; then
        echo -e "${GREEN}✅ 服務已停止${NC}"
    else
        echo -e "${RED}❌ 停止失敗${NC}"
        return 1
    fi
}

# 重啟服務
restart_service() {
    echo -e "${BLUE}重啟服務...${NC}"
    stop_service
    sleep 1
    start_service
}

# 查看日誌
view_log() {
    if [ -f /tmp/webtodispatch.log ]; then
        tail -f /tmp/webtodispatch.log
    else
        echo -e "${YELLOW}⚠️  日誌文件不存在${NC}"
    fi
}

# 主選單
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        check_status
        ;;
    log)
        view_log
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|log}"
        echo ""
        echo "命令說明："
        echo "  start   - 啟動背景服務"
        echo "  stop    - 停止背景服務"
        echo "  restart - 重啟背景服務"
        echo "  status  - 查看服務狀態"
        echo "  log     - 查看服務日誌"
        echo ""
        check_status
        exit 1
        ;;
esac

