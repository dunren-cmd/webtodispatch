#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
接收 CSV 檔案內容並儲存到本地
可以通過標準輸入或檔案內容接收
"""

import sys
import os

def receive_file_content():
    """接收檔案內容"""
    print("=" * 60)
    print("📥 接收 CSV 檔案")
    print("=" * 60)
    print()
    
    target_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("請選擇接收方式：")
    print("1. 從標準輸入讀取（貼上檔案內容）")
    print("2. 從檔案路徑讀取")
    print()
    
    choice = input("請選擇 (1/2): ").strip()
    
    if choice == "1":
        print()
        print("請貼上 CSV 檔案內容（結束時按 Ctrl+D 或輸入 'END'）：")
        print("-" * 60)
        
        lines = []
        try:
            while True:
                line = input()
                if line.strip() == 'END':
                    break
                lines.append(line)
        except EOFError:
            pass
        
        if not lines:
            print("❌ 沒有接收到內容")
            return None
        
        filename = input("\n請輸入檔案名稱（例如：tasks_rows.csv）: ").strip()
        if not filename:
            filename = "received.csv"
        
        filepath = os.path.join(target_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        print(f"✅ 檔案已儲存到: {filepath}")
        return filepath
    
    elif choice == "2":
        filepath = input("請輸入檔案完整路徑: ").strip()
        
        if not os.path.exists(filepath):
            print(f"❌ 檔案不存在: {filepath}")
            return None
        
        filename = os.path.basename(filepath)
        target_path = os.path.join(target_dir, filename)
        
        try:
            import shutil
            shutil.copy2(filepath, target_path)
            print(f"✅ 檔案已複製到: {target_path}")
            return target_path
        except Exception as e:
            print(f"❌ 複製失敗: {e}")
            return None
    
    else:
        print("❌ 無效的選擇")
        return None

if __name__ == '__main__':
    receive_file_content()

