#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 匯入 Supabase 腳本
將 tasks_rows.csv 檔案匯入到 Supabase 的 tasks 表
"""

import csv
import json
import requests
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional

# ========================================
# Supabase 配置
# ========================================
# 預設值（本地開發環境）
SUPABASE_URL = os.getenv('SUPABASE_URL', 'http://192.168.62.101:54321')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH')

# Supabase REST API 端點
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
    
    # 嘗試多種日期格式
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
    
    # 如果都無法解析，返回 None
    print(f"⚠️  無法解析日期：{date_str}")
    return None


def parse_json_field(json_str: str) -> Any:
    """解析 JSON 字串欄位（如 collaborator_ids, evidence）"""
    if not json_str or json_str.strip() == '':
        return []
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        # 如果不是有效的 JSON，嘗試解析為逗號分隔的數字列表
        try:
            values = [int(x.strip()) for x in json_str.split(',') if x.strip()]
            return values
        except ValueError:
            return []


def convert_row_to_task(row: Dict[str, str], row_num: int) -> Optional[Dict[str, Any]]:
    """
    將 CSV 行轉換為 Supabase tasks 表格式
    
    tasks 表欄位：
    - id (BIGINT)
    - timestamp (TIMESTAMPTZ) - 自動生成
    - title (TEXT)
    - description (TEXT)
    - assigner_id (BIGINT)
    - assigner_name (TEXT)
    - assignee_id (BIGINT)
    - assignee_name (TEXT)
    - collaborator_ids (JSONB)
    - role_category (TEXT)
    - plan_date (DATE)
    - interim_date (DATE)
    - final_date (DATE)
    - status (TEXT)
    - assignee_response (TEXT)
    - evidence (JSONB)
    """
    try:
        # 生成任務 ID（如果 CSV 中沒有）
        task_id = None
        if 'id' in row and row['id'].strip():
            try:
                task_id = int(row['id'].strip())
            except ValueError:
                task_id = int(datetime.now().timestamp() * 1000) + row_num
        
        if task_id is None:
            task_id = int(datetime.now().timestamp() * 1000) + row_num
        
        # 建立任務資料
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


def import_csv_to_supabase(csv_file_path: str, batch_size: int = 10) -> None:
    """
    從 CSV 檔案匯入資料到 Supabase
    
    Args:
        csv_file_path: CSV 檔案路徑
        batch_size: 批次大小（一次匯入多少筆）
    """
    print("=" * 60)
    print("📥 開始匯入 CSV 到 Supabase")
    print("=" * 60)
    print(f"📁 CSV 檔案：{csv_file_path}")
    print(f"🌐 Supabase URL：{SUPABASE_URL}")
    print(f"📊 批次大小：{batch_size}")
    print()
    
    # 檢查檔案是否存在
    if not os.path.exists(csv_file_path):
        print(f"❌ 錯誤：找不到檔案 {csv_file_path}")
        sys.exit(1)
    
    # 讀取 CSV 檔案
    tasks = []
    total_rows = 0
    success_count = 0
    error_count = 0
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8-sig') as f:
            # 自動偵測分隔符號
            sample = f.read(1024)
            f.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(f, delimiter=delimiter)
            
            print(f"📋 CSV 欄位：{reader.fieldnames}")
            print()
            
            for row_num, row in enumerate(reader, start=2):  # 從第 2 行開始（第 1 行是標題）
                total_rows += 1
                task = convert_row_to_task(row, row_num)
                
                if task:
                    tasks.append(task)
                    print(f"✅ 第 {row_num} 行：已轉換（ID: {task['id']}, 標題: {task['title'][:30]}...）")
                else:
                    error_count += 1
                    print(f"❌ 第 {row_num} 行：轉換失敗")
        
        print()
        print(f"📊 總共讀取 {total_rows} 行，成功轉換 {len(tasks)} 筆，失敗 {error_count} 筆")
        print()
        
        # 批次匯入到 Supabase
        if not tasks:
            print("⚠️  沒有可匯入的資料")
            return
        
        print("=" * 60)
        print("🚀 開始匯入到 Supabase")
        print("=" * 60)
        
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (len(tasks) + batch_size - 1) // batch_size
            
            print(f"\n📦 批次 {batch_num}/{total_batches}（{len(batch)} 筆）")
            
            try:
                response = requests.post(
                    f"{API_BASE_URL}/tasks",
                    headers=create_headers(),
                    json=batch
                )
                
                if response.status_code == 201:
                    result = response.json()
                    inserted_count = len(result) if isinstance(result, list) else 1
                    success_count += inserted_count
                    print(f"✅ 成功匯入 {inserted_count} 筆")
                    
                    # 顯示匯入的任務 ID
                    if isinstance(result, list):
                        ids = [str(task['id']) for task in result]
                        print(f"   ID: {', '.join(ids)}")
                
                elif response.status_code == 409:
                    # 衝突（ID 已存在），嘗試更新
                    print(f"⚠️  部分任務 ID 已存在，嘗試更新...")
                    for task in batch:
                        try:
                            update_response = requests.patch(
                                f"{API_BASE_URL}/tasks?id=eq.{task['id']}",
                                headers=create_headers(),
                                json=task
                            )
                            if update_response.status_code in [200, 204]:
                                success_count += 1
                                print(f"   ✅ 已更新任務 ID: {task['id']}")
                            else:
                                error_count += 1
                                print(f"   ❌ 更新失敗 ID: {task['id']}, 錯誤: {update_response.text}")
                        except Exception as e:
                            error_count += 1
                            print(f"   ❌ 更新任務 ID {task['id']} 時發生錯誤：{e}")
                
                else:
                    error_count += len(batch)
                    print(f"❌ 匯入失敗：HTTP {response.status_code}")
                    print(f"   錯誤訊息：{response.text}")
            
            except Exception as e:
                error_count += len(batch)
                print(f"❌ 批次匯入時發生錯誤：{e}")
        
        print()
        print("=" * 60)
        print("📊 匯入結果統計")
        print("=" * 60)
        print(f"✅ 成功：{success_count} 筆")
        print(f"❌ 失敗：{error_count} 筆")
        print(f"📋 總計：{total_rows} 筆")
        print()
        
        if success_count > 0:
            print("🎉 匯入完成！")
        else:
            print("⚠️  沒有成功匯入任何資料")
    
    except Exception as e:
        print(f"❌ 讀取 CSV 檔案時發生錯誤：{e}")
        sys.exit(1)


def main():
    """主函數"""
    import argparse
    
    parser = argparse.ArgumentParser(description='將 CSV 檔案匯入 Supabase tasks 表')
    parser.add_argument('csv_file', nargs='?', default='tasks_rows.csv',
                       help='CSV 檔案路徑（預設：tasks_rows.csv）')
    parser.add_argument('--url', default=None,
                       help=f'Supabase URL（預設：{SUPABASE_URL}）')
    parser.add_argument('--key', default=None,
                       help='Supabase Anon Key（預設：從環境變數或使用預設值）')
    parser.add_argument('--batch-size', type=int, default=10,
                       help='批次大小（預設：10）')
    
    args = parser.parse_args()
    
    # 更新配置
    global SUPABASE_URL, SUPABASE_ANON_KEY, API_BASE_URL
    if args.url:
        SUPABASE_URL = args.url
        API_BASE_URL = f"{SUPABASE_URL}/rest/v1"
    if args.key:
        SUPABASE_ANON_KEY = args.key
    
    # 執行匯入
    import_csv_to_supabase(args.csv_file, args.batch_size)


if __name__ == '__main__':
    main()

