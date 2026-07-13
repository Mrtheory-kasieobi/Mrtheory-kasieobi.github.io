# Admin Editor - Setup Instructions

## Quick Start (Recommended for Chrome/VS Code)

Since you're using Chrome with port 5500 (VS Code Live Server), here's the easiest approach:

### Option 1: Use Chrome's Local Storage + Download (Simplest)

1. Open `http://127.0.0.1:5500/admin/index.html` in Chrome
2. Login with:
   - Username: `admin`
   - Password: `pokgev-4Pimho-wixjep`
3. Edit content in the rich text editor
4. Click **Save** to store changes in browser
5. Click **Download** to export the HTML file
6. Save the downloaded file to your project folder

### Option 2: Run Node.js Server (Real-time updates)

1. Open Terminal in your website folder:
```bash
cd /Users/kellyu/Documents/Math-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the admin server:
```bash
npm start
```

4. Open `http://localhost:5501/admin/` in Chrome

5. Login and edit - changes save in real-time!

## How It Works

The Node.js server:
- Authenticates you with username/password
- Serves the admin interface
- Reads/writes HTML files directly to your project
- Creates automatic backups before each save
- Runs on port 5501 (different from Live Server's 5500)

## Security Features

- Session-based authentication
- CSRF protection
- Password hashing
- Directory traversal prevention
- File backup before overwrites
- No public access (not linked from main site)

## Files

```
admin/
├── index.html          # Admin interface
├── api/
│   └── auth.php        # PHP-style API (works with Node too)
├── package.json        # Node.js dependencies
└── README.md           # This file
```