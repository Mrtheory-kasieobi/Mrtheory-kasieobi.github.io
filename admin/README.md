# Admin Editor - Secure Content Management System

A secure, private admin text editor for managing website content with rich-text editing, auto-save, and version history.

## Features

- **Rich Text Editor**: Full-featured editor with headings, bold, italic, lists, links, and math equations
- **Auto-Save**: Changes are automatically saved to localStorage every 2 seconds
- **Version History**: Keep track of all changes with timestamps and restore any previous version
- **Section Organization**: Pages organized into logical sections (General, Courses, Expository)
- **Preview Mode**: See how your content will look before publishing
- **Download/Publish**: Export updated HTML files directly

## Quick Start

### Option 1: Browser-Based (Recommended for Single Device)

Open `admin/index.html` in Chrome (via Live Server at http://127.0.0.1:5500/admin/).

### Option 2: Node.js Server (Recommended for Real-Time Updates)

```bash
# Install dependencies
npm install

# Start the admin server
npm start
```

Then visit http://localhost:5501/admin/

## Login Credentials

- **Username**: admin
- **Password**: pokgev-4Pimho-wixjep

## Security Features

- Session-based authentication with secure cookies
- CSRF protection for all form submissions
- Rate limiting on login attempts
- Directory traversal prevention
- Automatic file backups before each save
- No public access (not linked from main site)
- robots.txt blocks indexing of admin pages
- .htaccess denies all web access

## Page Sections

### General Pages
- Homepage (index.html)
- About (about.html)
- Contact (contact.html)
- Research (research.html)
- Teaching (teaching.html)
- Notes (notes.html)
- Blog (blog.html)
- Track and Field (Track.html)

### Course Pages
- Precalculus 11 & 12
- Calculus I, II, III
- Real Analysis
- Introduction to Proofs
- Elementary Number Theory
- Algebra I & II
- Linear Algebra

### Expository Writing
- Olympiad
- Undergraduate
- Graduate

## Editor Features

### Formatting Options
- **Headings**: H1, H2, H3
- **Text**: Bold, Italic, Underline, Strikethrough
- **Lists**: Bulleted, Numbered
- **Other**: Blockquote, Code Block
- **Links**: Insert hyperlinks
- **Math**: LaTeX equations with $...$ syntax

### Action Buttons
- **Save**: Save changes locally
- **Download**: Export the HTML file
- **Preview**: See how content will look
- **Cancel**: Discard unsaved changes
- **Versions**: View and restore previous versions
- **Publish**: Download for live update

## File Structure

```
admin/
├── index.html          # Admin interface
├── robots.txt          # SEO blocking for admin
├── .htaccess           # Web server access control
├── package.json        # Node.js dependencies
└── README.md           # This file

admin-server.js         # Node.js backend server
```

## Usage

1. Login with your credentials
2. Select a page from the sidebar
3. Edit content using the toolbar or direct typing
4. Auto-save keeps changes in browser
5. Click **Download** to save updated HTML file to your project
6. Replace the original file in your website project

## Version History

All changes are stored in localStorage with timestamps. Access via the "Versions" button to:
- View all saved versions with dates
- Restore any previous version
- See content previews before restoring

## Extending the Editor

To add new editable sections:

1. Add new page paths to the `pages` object in `admin/index.html`
2. Create new sections in the sidebar by adding entries to the appropriate section array
3. Update the page list will automatically include new pages

## Security Best Practices

- Change the default password immediately
- Use environment variables for production passwords
- Enable HTTPS for production use
- Set up proper database storage instead of localStorage for multi-device use
- Regularly review backup files
- Consider implementing two-factor authentication

## Troubleshooting

**Login not working**: Check browser console for errors, ensure cookies are enabled

**Changes not saving**: Check localStorage availability, try clearing browser cache

**Download not working**: Ensure browser allows file downloads, check for popup blockers

## License

MIT License - Feel free to modify and use for your website