#!/bin/bash
# 快速安裝開機自動啟動（需要 sudo 權限）

echo "============================================================"
echo "🔧 安裝 WebToDispatch 開機自動啟動服務"
echo "============================================================"
echo ""

# 檢查是否為 root 或使用 sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  需要 root 權限來安裝 systemd 服務"
    echo ""
    echo "請在終端機中執行以下命令："
    echo "  sudo ./快速安裝開機啟動.sh"
    echo ""
    exit 1
fi

PROJECT_DIR="/home/dunren/cursor/webtodispatch/WebToDispatch_2"
SERVICE_FILE="$PROJECT_DIR/webtodispatch.service"
SYSTEMD_PATH="/etc/systemd/system/webtodispatch.service"
START_SCRIPT="$PROJECT_DIR/start_service.sh"

# 1. 確保啟動腳本有執行權限
chmod +x "$START_SCRIPT"
echo "✅ 已設定啟動腳本執行權限"

# 2. 複製服務文件
echo "[1/3] 複製服務文件..."
cp "$SERVICE_FILE" "$SYSTEMD_PATH" && echo "✅ 服務文件已複製" || { echo "❌ 複製失敗"; exit 1; }

# 3. 重新載入 systemd
echo "[2/3] 重新載入 systemd..."
systemctl daemon-reload && echo "✅ systemd 已重新載入" || { echo "❌ 重新載入失敗"; exit 1; }

# 4. 啟用開機自動啟動
echo "[3/3] 啟用開機自動啟動..."
systemctl enable webtodispatch.service && echo "✅ 已啟用開機自動啟動" || { echo "❌ 啟用失敗"; exit 1; }

echo ""
echo "============================================================"
echo "✅ 安裝完成！"
echo "============================================================"
echo ""
echo "服務狀態："
systemctl status webtodispatch --no-pager | head -10
echo ""
echo "開機自動啟動狀態："
systemctl is-enabled webtodispatch
echo ""
echo "常用命令："
echo "  啟動服務：    sudo systemctl start webtodispatch"
echo "  停止服務：    sudo systemctl stop webtodispatch"
echo "  查看狀態：    sudo systemctl status webtodispatch"
echo "  查看日誌：    sudo journalctl -u webtodispatch -f"
echo ""

