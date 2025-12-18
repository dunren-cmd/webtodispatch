#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
統一 CSV 匯入 Supabase 腳本
支援匯入 users、roles、tasks 三個表的 CSV 檔案
匯入順序：roles → users → tasks（因為 users.role 是外鍵到 roles.id）
"""

import csv
import json
import requests
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional, List

# ========================================
# Supabase 配置
# ========================================
SUPABASE_URL = os.getenv('SUPABASE_URL', 'http://192.168.62.101:54321')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')
API_BASE_URL = f"{SUPABASE_URL}/rest/v1"


def create_headers() -> Dict[str, str]:
    """建立 Supabase API 請求標頭"""
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }


def parse_date(date_str: str) -> Optional[str]:
    """解析日期字串，轉換為 YYYY-MM-DD 格式"""
    if not date_str or date_str.strip() == '':
        return None
    
    date_str = date_str.strip()
    date_formats = [
        '%Y-%m-%d',
        '%Y/%m/%d',
        '%m/%d/%Y',
        '%d/%m/%Y',
        '%Y-%m-%d %H:%M:%S',
        '%Y/%m/%d %H:%M:%S',
    ]
    
    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    return None


def parse_json_field(json_str: str) -> Any:
    """解析 JSON 字串欄位"""
    if not json_str or json_str.strip() == '':
        return []
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        try:
            values = [int(x.strip()) for x in json_str.split(',') if x.strip()]
            return values
        except ValueError:
            return []


def parse_bool(value: str) -> bool:
    """解析布林值"""
    if not value or value.strip() == '':
        return False
    value = value.strip().lower()
    return value in ('true', '1', 'yes', 'y', 't')


def convert_row_to_role(row: Dict[str, str], row_num: int) -> Optional[Dict[str, Any]]:
    """
    將 CSV 行轉換為 Supabase roles 表格式
    
    roles 表欄位：
    - id (TEXT PRIMARY KEY)
    - name (TEXT NOT NULL)
    - icon_name (TEXT)
    - color (TEXT)
    - level (INTEGER, 1-4)
    - webhook (TEXT)
    - is_default (BOOLEAN)
    """
    try:
        # id 和 name 是必填的
        role_id = row.get('id', '').strip()
        role_name = row.get('name', '').strip()
        
        if not role_id:
            print(f"⚠️  第 {row_num} 行：缺少 id，跳過")
            return None
        
        if not role_name:
            role_name = role_id  # 如果沒有 name，使用 id 作為 name
        
        # 解析 level（確保在 1-4 範圍內）
        level = 4  # 預設值
        if row.get('level', '').strip():
            try:
                level_val = int(row['level'].strip())
                level = max(1, min(4, level_val))  # 限制在 1-4
            except ValueError:
                pass
        
        role_data = {
            'id': role_id,
            'name': role_name,
            'icon_name': row.get('icon_name', 'Briefcase').strip() or 'Briefcase',
            'color': row.get('color', 'bg-blue-100 text-blue-700').strip() or 'bg-blue-100 text-blue-700',
            'level': level,
            'webhook': row.get('webhook', '').strip() or None,
            'is_default': parse_bool(row.get('is_default', 'false'))
        }
        
        return role_data
    
    except Exception as e:
        print(f"❌ 第 {row_num} 行轉換失敗：{e}")
        return None


def convert_row_to_user(row: Dict[str, str], row_num: int) -> Optional[Dict[str, Any]]:
    """
    將 CSV 行轉換為 Supabase users 表格式
    
    users 表欄位：
    - id (BIGINT PRIMARY KEY)
    - timestamp (TIMESTAMPTZ) - 自動生成
    - name (TEXT NOT NULL)
    - role (TEXT) - 外鍵到 roles.id
    - level (INTEGER, 1-4)
    - mail (TEXT)
    - employee_id (TEXT)
    - headshot (TEXT)
    """
    try:
        # 生成或取得 ID
        user_id = None
        if 'id' in row and row['id'].strip():
            try:
                user_id = int(row['id'].strip())
            except ValueError:
                user_id = int(datetime.now().timestamp() * 1000) + row_num
        
        if user_id is None:
            user_id = int(datetime.now().timestamp() * 1000) + row_num
        
        # name 是必填的
        name = row.get('name', '').strip()
        if not name:
            print(f"⚠️  第 {row_num} 行：缺少 name，跳過")
            return None
        
        # 解析 level（確保在 1-4 範圍內，且 5 改為 4）
        level = 4  # 預設值
        if row.get('level', '').strip():
            try:
                level_val = int(row['level'].strip())
                if level_val == 5:
                    level_val = 4
                level = max(1, min(4, level_val))
            except ValueError:
                pass
        
        # 處理欄位名稱對應（資料庫使用小寫 mail 和 employee_id）
        mail = row.get('Mail', '').strip() or row.get('mail', '').strip() or None
        employee_id = row.get('ID4', '').strip() or row.get('id4', '').strip() or row.get('employee_id', '').strip() or None
        
        user_data = {
            'id': user_id,
            'name': name,
            'role': row.get('role', '').strip() or None,
            'level': level,
            'mail': mail,  # 資料庫使用小寫 mail
            'employee_id': employee_id,  # 資料庫使用小寫 employee_id（字串類型）
            'headshot': row.get('headshot', '').strip() or None
        }
        
        return user_data
    
    except Exception as e:
        print(f"❌ 第 {row_num} 行轉換失敗：{e}")
        return None


def convert_row_to_task(row: Dict[str, str], row_num: int) -> Optional[Dict[str, Any]]:
    """
    將 CSV 行轉換為 Supabase tasks 表格式
    """
    try:
        task_id = None
        if 'id' in row and row['id'].strip():
            try:
                task_id = int(row['id'].strip())
            except ValueError:
                task_id = int(datetime.now().timestamp() * 1000) + row_num
        
        if task_id is None:
            task_id = int(datetime.now().timestamp() * 1000) + row_num
        
        task_data = {
            'id': task_id,
            'title': row.get('title', '').strip() or f'任務 {row_num}',
            'description': row.get('description', '').strip() or None,
            'assigner_id': int(row['assigner_id'].strip()) if row.get('assigner_id', '').strip() else None,
            'assigner_name': row.get('assigner_name', '').strip() or None,
            'assignee_id': int(row['assignee_id'].strip()) if row.get('assignee_id', '').strip() else None,
            'assignee_name': row.get('assignee_name', '').strip() or None,
            'collaborator_ids': parse_json_field(row.get('collaborator_ids', '[]')),
            'role_category': row.get('role_category', '').strip() or None,
            'plan_date': parse_date(row.get('plan_date', '')),
            'interim_date': parse_date(row.get('interim_date', '')),
            'final_date': parse_date(row.get('final_date', '')),
            'status': row.get('status', 'pending').strip() or 'pending',
            'assignee_response': row.get('assignee_response', '').strip() or None,
            'evidence': parse_json_field(row.get('evidence', '[]'))
        }
        
        return task_data
    
    except Exception as e:
        print(f"❌ 第 {row_num} 行轉換失敗：{e}")
        return None


def read_csv(file_path: str) -> List[Dict[str, str]]:
    """讀取 CSV 檔案"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"找不到檔案：{file_path}")
    
    rows = []
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        sample = f.read(1024)
        f.seek(0)
        
        # 先嘗試常見的分隔符號
        delimiter = ','
        try:
            sniffer = csv.Sniffer()
            detected_delimiter = sniffer.sniff(sample).delimiter
            if detected_delimiter:
                delimiter = detected_delimiter
        except:
            # 如果 Sniffer 失敗，使用預設的逗號
            pass
        
        reader = csv.DictReader(f, delimiter=delimiter)
        for row in reader:
            rows.append(row)
    
    return rows


def import_to_supabase(table_name: str, data: List[Dict[str, Any]], batch_size: int = 10) -> tuple[int, int]:
    """
    匯入資料到 Supabase
    
    Returns:
        (成功數量, 失敗數量)
    """
    if not data:
        return 0, 0
    
    success_count = 0
    error_count = 0
    
    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(data) + batch_size - 1) // batch_size
        
        print(f"  📦 批次 {batch_num}/{total_batches}（{len(batch)} 筆）", end=' ... ')
        
        try:
            response = requests.post(
                f"{API_BASE_URL}/{table_name}",
                headers=create_headers(),
                json=batch
            )
            
            if response.status_code == 201:
                result = response.json()
                inserted_count = len(result) if isinstance(result, list) else 1
                success_count += inserted_count
                print(f"✅ {inserted_count} 筆")
            
            elif response.status_code == 409:
                # ID 衝突，嘗試更新
                print(f"⚠️  部分 ID 已存在，嘗試更新...")
                for item in batch:
                    try:
                        item_id = item.get('id')
                        if table_name == 'roles':
                            update_url = f"{API_BASE_URL}/{table_name}?id=eq.{item_id}"
                        else:
                            update_url = f"{API_BASE_URL}/{table_name}?id=eq.{item_id}"
                        
                        update_response = requests.patch(
                            update_url,
                            headers=create_headers(),
                            json=item
                        )
                        if update_response.status_code in [200, 204]:
                            success_count += 1
                        else:
                            error_count += 1
                    except Exception:
                        error_count += 1
                print(f"   完成更新")
            
            else:
                error_count += len(batch)
                print(f"❌ HTTP {response.status_code}: {response.text[:100]}")
        
        except Exception as e:
            error_count += len(batch)
            print(f"❌ 錯誤：{e}")
    
    return success_count, error_count


def main():
    """主函數"""
    import argparse
    
    global SUPABASE_URL, SUPABASE_ANON_KEY, API_BASE_URL
    
    parser = argparse.ArgumentParser(description='將 CSV 檔案匯入 Supabase（支援 users、roles、tasks）')
    parser.add_argument('--roles', help='roles CSV 檔案路徑')
    parser.add_argument('--users', help='users CSV 檔案路徑')
    parser.add_argument('--tasks', help='tasks CSV 檔案路徑')
    parser.add_argument('--url', default=None, help=f'Supabase URL（預設：{SUPABASE_URL}）')
    parser.add_argument('--key', default=None, help='Supabase Anon Key')
    parser.add_argument('--batch-size', type=int, default=10, help='批次大小（預設：10）')
    
    args = parser.parse_args()
    
    # 更新配置
    if args.url:
        SUPABASE_URL = args.url
        API_BASE_URL = f"{SUPABASE_URL}/rest/v1"
    if args.key:
        SUPABASE_ANON_KEY = args.key
    
    print("=" * 60)
    print("📥 開始匯入 CSV 到 Supabase")
    print("=" * 60)
    print(f"🌐 Supabase URL：{SUPABASE_URL}")
    print(f"📊 批次大小：{args.batch_size}")
    print()
    
    total_success = 0
    total_error = 0
    
    # 1. 匯入 roles（必須先匯入，因為 users.role 是外鍵）
    if args.roles:
        print("=" * 60)
        print("1️⃣  匯入 roles 表")
        print("=" * 60)
        try:
            rows = read_csv(args.roles)
            print(f"📋 讀取到 {len(rows)} 行")
            
            roles = []
            for row_num, row in enumerate(rows, start=2):
                role = convert_row_to_role(row, row_num)
                if role:
                    roles.append(role)
            
            print(f"✅ 轉換成功 {len(roles)} 筆")
            print()
            
            success, error = import_to_supabase('roles', roles, args.batch_size)
            total_success += success
            total_error += error
            print(f"\n📊 roles：成功 {success} 筆，失敗 {error} 筆\n")
        
        except Exception as e:
            print(f"❌ 匯入 roles 失敗：{e}\n")
            total_error += 1
    
    # 2. 匯入 users（先確保所有角色存在）
    if args.users:
        print("=" * 60)
        print("2️⃣  匯入 users 表")
        print("=" * 60)
        try:
            rows = read_csv(args.users)
            print(f"📋 讀取到 {len(rows)} 行")
            
            # 先收集所有需要的角色
            required_roles = set()
            for row in rows:
                role = row.get('role', '').strip()
                if role:
                    required_roles.add(role)
            
            # 確保所有角色都存在於 roles 表
            if required_roles:
                print(f"🔍 檢查並創建缺失的角色（{len(required_roles)} 個）...")
                missing_roles = []
                for role in required_roles:
                    # 檢查角色是否存在
                    check_response = requests.get(
                        f"{API_BASE_URL}/roles?id=eq.{role}",
                        headers=create_headers()
                    )
                    if check_response.status_code == 200 and len(check_response.json()) == 0:
                        missing_roles.append(role)
                
                # 創建缺失的角色
                if missing_roles:
                    print(f"   ⚠️  發現 {len(missing_roles)} 個缺失的角色，自動創建...")
                    roles_to_create = []
                    for role in missing_roles:
                        roles_to_create.append({
                            'id': role,
                            'name': role,
                            'icon_name': 'Briefcase',
                            'color': 'bg-blue-100 text-blue-700',
                            'level': 4,
                            'is_default': False
                        })
                    
                    create_response = requests.post(
                        f"{API_BASE_URL}/roles",
                        headers=create_headers(),
                        json=roles_to_create
                    )
                    if create_response.status_code == 201:
                        print(f"   ✅ 已創建 {len(missing_roles)} 個角色")
                    else:
                        print(f"   ⚠️  創建角色時發生錯誤：{create_response.text[:100]}")
                else:
                    print("   ✅ 所有角色都已存在")
                print()
            
            users = []
            for row_num, row in enumerate(rows, start=2):
                user = convert_row_to_user(row, row_num)
                if user:
                    users.append(user)
            
            print(f"✅ 轉換成功 {len(users)} 筆")
            print()
            
            success, error = import_to_supabase('users', users, args.batch_size)
            total_success += success
            total_error += error
            print(f"\n📊 users：成功 {success} 筆，失敗 {error} 筆\n")
        
        except Exception as e:
            print(f"❌ 匯入 users 失敗：{e}\n")
            import traceback
            traceback.print_exc()
            total_error += 1
    
    # 3. 匯入 tasks
    if args.tasks:
        print("=" * 60)
        print("3️⃣  匯入 tasks 表")
        print("=" * 60)
        try:
            rows = read_csv(args.tasks)
            print(f"📋 讀取到 {len(rows)} 行")
            
            tasks = []
            for row_num, row in enumerate(rows, start=2):
                task = convert_row_to_task(row, row_num)
                if task:
                    tasks.append(task)
            
            print(f"✅ 轉換成功 {len(tasks)} 筆")
            print()
            
            success, error = import_to_supabase('tasks', tasks, args.batch_size)
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

