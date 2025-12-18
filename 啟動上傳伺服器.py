#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
簡單的 HTTP 檔案上傳伺服器
在 Linux 上啟動此伺服器，然後從 Windows 瀏覽器上傳檔案
"""

import http.server
import socketserver
import os
import cgi
from urllib.parse import unquote

PORT = 8888
UPLOAD_DIR = os.path.dirname(os.path.abspath(__file__))

class FileUploadHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """處理 GET 請求 - 顯示上傳表單"""
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CSV 檔案上傳</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #333; }}
        form {{ background: #f5f5f5; padding: 20px; border-radius: 5px; }}
        input[type="file"] {{ margin: 10px 0; }}
        input[type="submit"] {{ background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 3px; cursor: pointer; }}
        input[type="submit"]:hover {{ background: #45a049; }}
        .info {{ background: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }}
    </style>
</head>
<body>
    <h1>📤 CSV 檔案上傳到 Linux</h1>
    
    <div class="info">
        <strong>目標目錄：</strong> {UPLOAD_DIR}<br>
        <strong>伺服器地址：</strong> http://{self.server.server_address[0]}:{PORT}/
    </div>
    
    <form enctype="multipart/form-data" method="post">
        <h3>上傳 roles CSV：</h3>
        <input type="file" name="roles_file" accept=".csv"><br>
        
        <h3>上傳 users CSV：</h3>
        <input type="file" name="users_file" accept=".csv"><br>
        
        <h3>上傳 tasks CSV：</h3>
        <input type="file" name="tasks_file" accept=".csv"><br>
        
        <br>
        <input type="submit" value="上傳檔案">
    </form>
    
    <div class="info">
        <strong>使用說明：</strong><br>
        1. 選擇要上傳的 CSV 檔案<br>
        2. 點擊「上傳檔案」按鈕<br>
        3. 上傳完成後，檔案會儲存到目標目錄<br>
        4. 然後可以執行匯入腳本
    </div>
</body>
</html>
"""
            self.wfile.write(html.encode('utf-8'))
        else:
            super().do_GET()
    
    def do_POST(self):
        """處理 POST 請求 - 接收上傳的檔案"""
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST'}
        )
        
        uploaded_files = []
        
        # 處理 roles 檔案
        if 'roles_file' in form:
            fileitem = form['roles_file']
            if fileitem.filename:
                filename = 'roles_rows.csv'
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(fileitem.file.read())
                uploaded_files.append(filename)
        
        # 處理 users 檔案
        if 'users_file' in form:
            fileitem = form['users_file']
            if fileitem.filename:
                filename = 'users_rows.csv'
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(fileitem.file.read())
                uploaded_files.append(filename)
        
        # 處理 tasks 檔案
        if 'tasks_file' in form:
            fileitem = form['tasks_file']
            if fileitem.filename:
                filename = 'tasks_rows.csv'
                filepath = os.path.join(UPLOAD_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(fileitem.file.read())
                uploaded_files.append(filename)
        
        # 回應
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        
        if uploaded_files:
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>上傳成功</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .success {{ background: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; }}
        .file-list {{ background: #f8f9fa; padding: 15px; margin: 10px 0; }}
    </style>
</head>
<body>
    <h1>✅ 上傳成功！</h1>
    
    <div class="success">
        <strong>已成功上傳 {len(uploaded_files)} 個檔案：</strong>
        <div class="file-list">
            {''.join([f'<div>✅ {f}</div>' for f in uploaded_files])}
        </div>
    </div>
    
    <div class="success">
        <strong>下一步：</strong><br>
        在 Linux 終端機中執行：<br>
        <code>python3 import_all_csv_to_supabase.py --roles roles_rows.csv --users users_rows.csv --tasks tasks_rows.csv</code>
    </div>
    
    <p><a href="/">返回上傳頁面</a></p>
</body>
</html>
"""
        else:
            html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>上傳失敗</title>
</head>
<body>
    <h1>❌ 沒有檔案被上傳</h1>
    <p><a href="/">返回上傳頁面</a></p>
</body>
</html>
"""
        
        self.wfile.write(html.encode('utf-8'))

def main():
    """啟動伺服器"""
    os.chdir(UPLOAD_DIR)
    
    with socketserver.TCPServer(("", PORT), FileUploadHandler) as httpd:
        print("=" * 60)
        print("📤 CSV 檔案上傳伺服器")
        print("=" * 60)
        print()
        print(f"伺服器已啟動在：http://0.0.0.0:{PORT}/")
        print(f"目標目錄：{UPLOAD_DIR}")
        print()
        print("從 Windows 瀏覽器訪問以下地址來上傳檔案：")
        print(f"  http://<linux-ip>:{PORT}/")
        print()
        print("按 Ctrl+C 停止伺服器")
        print()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n伺服器已停止")

if __name__ == '__main__':
    main()

