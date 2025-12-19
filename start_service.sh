#!/bin/bash
# WebToDispatch 專案啟動腳本
# 用於 systemd 服務自動啟動

# 設定顏色輸出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 專案目錄
PROJECT_DIR="/home/dunren/cursor/webtodispatch/WebToDispatch_2"
cd "$PROJECT_DIR" || exit 1

# 日誌文件
LOG_FILE="$PROJECT_DIR/service.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# 初始化日誌
log "=========================================="
log "WebToDispatch 服務啟動"
log "=========================================="

# 1. 檢查並啟動 Supabase
log_info "檢查 Supabase 服務狀態..."
if command -v supabase &> /dev/null; then
    # 檢查 Supabase 是否正在運行
    if curl -s http://localhost:54321/rest/v1/ > /dev/null 2>&1; then
        log_success "Supabase 正在運行"
    else
        log_warning "Supabase 未運行，嘗試啟動..."
        supabase start >> "$LOG_FILE" 2>&1
        if [ $? -eq 0 ]; then
            log_success "Supabase 已啟動"
            # 等待 Supabase 完全啟動
            sleep 5
        else
            log_error "Supabase 啟動失敗"
            exit 1
        fi
    fi
else
    log_error "找不到 supabase 命令，請確認已安裝 Supabase CLI"
    exit 1
fi

# 2. 檢查環境變數文件
log_info "檢查環境變數配置..."
if [ ! -f .env ]; then
    log_warning ".env 文件不存在"
    if [ -f .env.example ]; then
        log_info "從 .env.example 創建 .env 文件..."
        cp .env.example .env
        log_warning "請編輯 .env 文件設定 Supabase 配置後重新啟動服務"
    else
        log_error "找不到 .env.example 文件"
        exit 1
    fi
else
    log_success ".env 文件存在"
fi

# 3. 檢查依賴
log_info "檢查 Node.js 依賴..."
if [ ! -d node_modules ]; then
    log_warning "node_modules 不存在，安裝依賴..."
    npm install >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        log_error "安裝依賴失敗"
        exit 1
    fi
    log_success "依賴安裝完成"
else
    log_success "node_modules 已存在"
fi

# 4. 啟動前端服務
log_info "啟動前端開發伺服器..."
log "前端將在以下地址啟動："
log "  📍 本地：http://localhost:3050"
log "  🌐 網路：http://$(hostname -I | awk '{print $1}'):3050"
log ""

# 在前台運行 npm run dev（systemd 會管理此進程）
# 輸出會自動重定向到 systemd 日誌和服務日誌文件
exec npm run dev

