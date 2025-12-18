#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
直接從 Windows 路徑讀取 CSV 並匯入 Supabase
不需要先複製檔案到 Linux
"""

import sys
import os

# 將 import_all_csv_to_supabase 的函數匯入
sys.path.insert(0, os.path.dirname(__file__))

# Windows 路徑對應
WINDOWS_PATHS = {
    'roles': [
        r'c:\Users\dunre\Desktop\roles_rows.csv',
        r'C:\Users\dunre\Desktop\roles_rows.csv',
        '/mnt/c/Users/dunre/Desktop/roles_rows.csv',
    ],
    'users': [
        r'c:\Users\dunre\Desktop\users_rows (2).csv',
        r'C:\Users\dunre\Desktop\users_rows (2).csv',
        '/mnt/c/Users/dunre/Desktop/users_rows (2).csv',
    ],
    'tasks': [
        r'c:\Users\dunre\Desktop\tasks_rows.csv',
        r'C:\Users\dunre\Desktop\tasks_rows.csv',
        '/mnt/c/Users/dunre/Desktop/tasks_rows.csv',
    ]
}

def find_file(file_type):
    """尋找檔案"""
    for path in WINDOWS_PATHS[file_type]:
        # 嘗試 WSL 路徑格式
        wsl_path = path.replace('\\', '/').replace('c:', '/mnt/c').replace('C:', '/mnt/c')
        if os.path.exists(wsl_path):
            return wsl_path
        
        # 嘗試原始路徑
        if os.path.exists(path):
            return path
    
    return None

def main():
    print("=" * 60)
    print("📥 從 Windows 路徑匯入 CSV 到 Supabase")
    print("=" * 60)
    print()
    
    # 尋找檔案
    roles_file = find_file('roles')
    users_file = find_file('users')
    tasks_file = find_file('tasks')
    
    found_files = []
    
    if roles_file:
        print(f"✅ 找到 roles CSV: {roles_file}")
        found_files.append(('roles', roles_file))
    else:
        print("⚠️  未找到 roles CSV")
    
    if users_file:
        print(f"✅ 找到 users CSV: {users_file}")
        found_files.append(('users', users_file))
    else:
        print("⚠️  未找到 users CSV")
    
    if tasks_file:
        print(f"✅ 找到 tasks CSV: {tasks_file}")
        found_files.append(('tasks', tasks_file))
    else:
        print("⚠️  未找到 tasks CSV")
    
    print()
    
    if not found_files:
        print("❌ 沒有找到任何 CSV 檔案")
        print()
        print("請手動指定檔案路徑：")
        print()
        
        roles_file = input("roles CSV 路徑（留空跳過）: ").strip()
        users_file = input("users CSV 路徑（留空跳過）: ").strip()
        tasks_file = input("tasks CSV 路徑（留空跳過）: ").strip()
        
        if not roles_file and not users_file and not tasks_file:
            print("❌ 沒有指定任何檔案")
            return
    
    # 匯入 import_all_csv_to_supabase 並執行
    from import_all_csv_to_supabase import import_to_supabase, read_csv, convert_row_to_role, convert_row_to_user, convert_row_to_task
    import requests
    
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'http://192.168.62.101:54321')
    SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')
    API_BASE_URL = f"{SUPABASE_URL}/rest/v1"
    
    def create_headers():
        return {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    
    total_success = 0
    total_error = 0
    
    # 匯入 roles
    if roles_file and os.path.exists(roles_file):
        print("=" * 60)
        print("1️⃣  匯入 roles 表")
        print("=" * 60)
        try:
            rows = read_csv(roles_file)
            print(f"📋 讀取到 {len(rows)} 行")
            
            roles = []
            for row_num, row in enumerate(rows, start=2):
                role = convert_row_to_role(row, row_num)
                if role:
                    roles.append(role)
            
            print(f"✅ 轉換成功 {len(roles)} 筆")
            print()
            
            success, error = import_to_supabase('roles', roles, 10)
            total_success += success
            total_error += error
            print(f"\n📊 roles：成功 {success} 筆，失敗 {error} 筆\n")
        except Exception as e:
            print(f"❌ 匯入 roles 失敗：{e}\n")
            total_error += 1
    
    # 匯入 users
    if users_file and os.path.exists(users_file):
        print("=" * 60)
        print("2️⃣  匯入 users 表")
        print("=" * 60)
        try:
            rows = read_csv(users_file)
            print(f"📋 讀取到 {len(rows)} 行")
            
            users = []
            for row_num, row in enumerate(rows, start=2):
                user = convert_row_to_user(row, row_num)
                if user:
                    users.append(user)
            
            print(f"✅ 轉換成功 {len(users)} 筆")
            print()
            
            success, error = import_to_supabase('users', users, 10)
            total_success += success
            total_error += error
            print(f"\n📊 users：成功 {success} 筆，失敗 {error} 筆\n")
        except Exception as e:
            print(f"❌ 匯入 users 失敗：{e}\n")
            total_error += 1
    
    # 匯入 tasks
    if tasks_file and os.path.exists(tasks_file):
        print("=" * 60)
        print("3️⃣  匯入 tasks 表")
        print("=" * 60)
        try:
            rows = read_csv(tasks_file)
            print(f"📋 讀取到 {len(rows)} 行")
            
            tasks = []
            for row_num, row in enumerate(rows, start=2):
                task = convert_row_to_task(row, row_num)
                if task:
                    tasks.append(task)
            
            print(f"✅ 轉換成功 {len(tasks)} 筆")
            print()
            
            success, error = import_to_supabase('tasks', tasks, 10)
            total_success += success
            total_error += error
            print(f"\n📊 tasks：成功 {success} 筆，失敗 {error} 筆\n")
        except Exception as e:
            print(f"❌ 匯入 tasks 失敗：{e}\n")
            total_error += 1
    
    # 總結
    print("=" * 60)
    print("📊 匯入結果統計")
    print("=" * 60)
    print(f"✅ 總成功：{total_success} 筆")
    print(f"❌ 總失敗：{total_error} 筆")
    print()
    
    if total_success > 0:
        print("🎉 匯入完成！")
    else:
        print("⚠️  沒有成功匯入任何資料")

if __name__ == '__main__':
    main()

