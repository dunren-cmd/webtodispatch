#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
從 Windows 路徑上傳 CSV 檔案到 Linux 並匯入 Supabase
"""

import os
import sys
import shutil

def find_windows_file(filename):
    """尋找 Windows 上的檔案"""
    possible_paths = [
        # WSL 路徑格式
        f'/mnt/c/Users/dunre/Desktop/{filename}',
        f'/mnt/c/Users/dunre/Downloads/{filename}',
        # Windows 路徑格式（如果 Python 可以處理）
        rf'c:\Users\dunre\Desktop\{filename}',
        rf'C:\Users\dunre\Desktop\{filename}',
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def upload_and_import():
    """上傳 CSV 檔案並匯入"""
    print("=" * 60)
    print("📤 上傳 CSV 檔案到 Linux 並匯入 Supabase")
    print("=" * 60)
    print()
    
    # 目標目錄
    target_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 要上傳的檔案
    files_to_upload = {
        'roles': 'roles_rows.csv',
        'users': 'users_rows (2).csv',
        'tasks': 'tasks_rows.csv'
    }
    
    uploaded_files = {}
    
    # 尋找並複製檔案
    print("🔍 尋找 Windows 上的 CSV 檔案...")
    print()
    
    for file_type, filename in files_to_upload.items():
        source_path = find_windows_file(filename)
        
        if source_path:
            print(f"✅ 找到 {file_type}: {source_path}")
            
            # 目標檔案名稱（簡化名稱）
            target_filename = f"{file_type}_rows.csv"
            target_path = os.path.join(target_dir, target_filename)
            
            try:
                # 複製檔案
                shutil.copy2(source_path, target_path)
                print(f"   ✅ 已複製到: {target_path}")
                uploaded_files[file_type] = target_path
            except Exception as e:
                print(f"   ❌ 複製失敗: {e}")
        else:
            print(f"⚠️  未找到 {file_type}: {filename}")
    
    print()
    
    if not uploaded_files:
        print("❌ 沒有找到任何檔案可以上傳")
        print()
        print("請手動指定檔案路徑：")
        print()
        
        roles_path = input("roles CSV 完整路徑（留空跳過）: ").strip()
        users_path = input("users CSV 完整路徑（留空跳過）: ").strip()
        tasks_path = input("tasks CSV 完整路徑（留空跳過）: ").strip()
        
        if roles_path and os.path.exists(roles_path):
            target = os.path.join(target_dir, "roles_rows.csv")
            try:
                shutil.copy2(roles_path, target)
                uploaded_files['roles'] = target
                print(f"✅ 已複製 roles: {target}")
            except Exception as e:
                print(f"❌ 複製失敗: {e}")
        
        if users_path and os.path.exists(users_path):
            target = os.path.join(target_dir, "users_rows.csv")
            try:
                shutil.copy2(users_path, target)
                uploaded_files['users'] = target
                print(f"✅ 已複製 users: {target}")
            except Exception as e:
                print(f"❌ 複製失敗: {e}")
        
        if tasks_path and os.path.exists(tasks_path):
            target = os.path.join(target_dir, "tasks_rows.csv")
            try:
                shutil.copy2(tasks_path, target)
                uploaded_files['tasks'] = target
                print(f"✅ 已複製 tasks: {target}")
            except Exception as e:
                print(f"❌ 複製失敗: {e}")
    
    if not uploaded_files:
        print("❌ 沒有成功上傳任何檔案")
        return
    
    print()
    print("=" * 60)
    print("🚀 開始匯入到 Supabase")
    print("=" * 60)
    print()
    
    # 執行匯入
    import subprocess
    
    cmd = ["python3", "import_all_csv_to_supabase.py"]
    
    if 'roles' in uploaded_files:
        cmd.extend(["--roles", uploaded_files['roles']])
    if 'users' in uploaded_files:
        cmd.extend(["--users", uploaded_files['users']])
    if 'tasks' in uploaded_files:
        cmd.extend(["--tasks", uploaded_files['tasks']])
    
    print(f"執行命令: {' '.join(cmd)}")
    print()
    
    # 執行匯入腳本
    result = subprocess.run(cmd, cwd=target_dir)
    
    if result.returncode == 0:
        print()
        print("🎉 上傳和匯入完成！")
    else:
        print()
        print(f"⚠️  匯入過程結束（退出碼：{result.returncode}）")

if __name__ == '__main__':
    upload_and_import()

