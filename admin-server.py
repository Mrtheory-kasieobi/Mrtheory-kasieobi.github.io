#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import urllib.parse
from http import cookies
import hashlib
import time
import shutil

PORT = 5502
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ADMIN_DIR = os.path.join(BASE_DIR, 'admin')

sessions = {}

def get_session_id():
    return hashlib.sha256(str(time.time()).encode()).hexdigest()[:16]

class AdminHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = dict(urllib.parse.parse_qsl(parsed.query))
        
        if path == '/admin/api/auth.php':
            self.send_response(401)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': False, 'error': 'Not authenticated'}).encode())
            return
        
        if path == '/admin/api/content.php':
            action = query.get('action', '')
            
            if action == 'list':
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                pages = {
                    'index.html': 'Homepage',
                    'teaching.html': 'Teaching',
                    'courses/calculus-1.html': 'Calculus I',
                    'courses/calculus-2.html': 'Calculus II',
                    'courses/calculus-3.html': 'Calculus III',
                    'courses/linear-algebra.html': 'Linear Algebra',
                    'courses/real-analysis.html': 'Real Analysis',
                    'courses/introduction-to-proofs.html': 'Introduction to Proofs',
                    'courses/number-theory.html': 'Elementary Number Theory',
                    'courses/algebra-I.html': 'Algebra I',
                    'courses/algebra-II.html': 'Algebra II',
                    'research.html': 'Research',
                    'about.html': 'About',
                    'contact.html': 'Contact',
                    'notes.html': 'Notes',
                    'blog.html': 'Blog',
                    'courses/lecture-notes-1.html': 'Lecture Notes 1',
                    'courses/lecture-notes-2.html': 'Lecture Notes 2',
                    'courses/lecture-notes-3.html': 'Lecture Notes 3',
                    'courses/lecture-notes-4.html': 'Lecture Notes 4',
                    'courses/lecture-notes-5.html': 'Lecture Notes 5',
                    'courses/lecture-notes-6.html': 'Lecture Notes 6',
                    'courses/lecture-notes-7.html': 'Lecture Notes 7',
                    'courses/lecture-notes-8.html': 'Lecture Notes 8',
                    'courses/lecture-notes-9.html': 'Lecture Notes 9',
                    'courses/lecture-notes-10.html': 'Lecture Notes 10',
                    'courses/lecture-notes-11.html': 'Lecture Notes 11',
                    'courses/lecture-notes-12.html': 'Lecture Notes 12',
                    'courses/lecture-notes-13.html': 'Lecture Notes 13',
                    'courses/lecture-notes-14.html': 'Lecture Notes 14'
                }
                self.wfile.write(json.dumps({'pages': pages}).encode())
                return
            
            if action == 'content':
                page = query.get('page', '')
                filepath = os.path.join(ADMIN_DIR, page)
                if os.path.exists(filepath):
                    with open(filepath, 'r') as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'content': content}).encode())
                    return
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Page not found'}).encode())
                    return
        
        super().do_GET()
    
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        if path == '/admin/api/auth.php':
            data = dict(urllib.parse.parse_qsl(post_data))
            username = data.get('username', '')
            password = data.get('password', '')
            
            if username == 'admin' and password == 'pokgev-4Pimho-wixjep':
                session_id = get_session_id()
                sessions[session_id] = {'username': username, 'csrf_token': get_session_id()}
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Set-Cookie', f'session_id={session_id}; Path=/')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True, 'csrf_token': sessions[session_id]['csrf_token']}).encode())
                return
            else:
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'Invalid credentials'}).encode())
                return
        
        if path == '/admin/api/content.php':
            data = dict(urllib.parse.parse_qsl(post_data))
            page = data.get('page', '')
            content = data.get('content', '')
            csrf_token = data.get('csrf_token', '')
            
            if page and content:
                filepath = os.path.join(ADMIN_DIR, page)
                if not os.path.exists(filepath):
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Page not found'}).encode())
                    return
                
                backup_dir = os.path.join(ADMIN_DIR, 'backups', time.strftime('%Y-%m-%d'))
                os.makedirs(backup_dir, exist_ok=True)
                if os.path.exists(filepath):
                    shutil.copy(filepath, os.path.join(backup_dir, os.path.basename(page)))
                
                with open(filepath, 'w') as f:
                    f.write(content)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': True}).encode())
                return
        
        super().do_POST()

with socketserver.TCPServer(("", PORT), AdminHandler) as httpd:
    print(f"Serving at port {PORT}")
    print(f"Visit http://localhost:{PORT}/admin/")
    httpd.serve_forever()