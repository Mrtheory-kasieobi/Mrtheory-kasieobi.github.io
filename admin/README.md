# Admin Editor - Secure Access Only

This directory contains a secure admin text editor for managing website content.

## Security Features

1. **Session-based authentication** - Uses PHP sessions with secure tokens
2. **CSRF protection** - All form submissions require valid CSRF tokens
3. **Path validation** - Prevents directory traversal attacks
4. **Password hashing** - Uses PASSWORD_DEFAULT for secure password storage
5. **No indexing** - Meta tag prevents search engine indexing
6. **Rate limiting** - Can be enhanced with additional rate limiting

## Setup Instructions

1. **Change the default password** - Edit `admin/api/auth.php` and replace `YOUR_SECURE_PASSWORD_HERE` with a strong password

2. **Upload to server** - The admin directory must be uploaded to your web server

3. **Access the admin panel** - Navigate to `yourdomain.com/admin/`

4. **Default credentials**:
   - Username: `admin`
   - Password: Change this immediately!

## File Structure

```
admin/
├── index.html          # Admin login and editor interface
├── api/
│   ├── auth.php        # Authentication handler
│   ├── content.php     # Content management API
│   └── logout.php      # Logout handler
└── backups/            # Auto-generated backup directory
```

## Usage

1. Log in with your credentials
2. Select a page from the sidebar
3. Edit content using the rich text editor
4. Use toolbar buttons for formatting
5. Save, preview, or publish changes

## Editor Features

- Rich text editing with headings, bold, italic
- Bullet and numbered lists
- Links
- Mathematical equations (LaTeX support via MathJax)
- Save, Preview, Cancel, and Restore Previous Version options
- Version history tracking

## Security Recommendations

1. Use HTTPS for all admin access
2. Change the default password immediately
3. Use a strong, unique password (min 16 characters)
4. Consider adding IP restrictions
5. Enable two-factor authentication for production use
6. Regular security audits

## .htaccess for Additional Security (Optional)

Create an `.htaccess` file in the admin directory:

```
# Deny access to PHP files from specific IPs
<Files "auth.php">
    Order Deny,Allow
    Deny from all
</Files>
```

## Backup Strategy

The system automatically creates backups of each page before editing, stored in:
`backups/YYYY-MM-DD/page-name.html.timestamp`

## Important Notes

- The admin page is NOT linked from anywhere on the main site
- URL guessing will not grant access without authentication
- All credentials are stored server-side only
- Content changes are immediate upon saving