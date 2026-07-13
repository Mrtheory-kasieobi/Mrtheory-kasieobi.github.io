const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = 5501;

// Session middleware
app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Auth check middleware
const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

// Login endpoint
app.post('/admin/api/auth.php', (req, res) => {
    const { username, password } = req.body;
    
    // In production, use proper password hashing and storage
    if (username === 'admin' && password === 'pokgev-4Pimho-wixjep') {
        req.session.authenticated = true;
        req.session.username = username;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// Content API
app.get('/admin/api/content.php', requireAuth, (req, res) => {
    const action = req.query.action;
    const page = req.query.page;
    
    if (action === 'list') {
        const pages = {
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
            'blog.html': 'Blog'
        };
        res.json({ pages });
        return;
    }
    
    if (action === 'content' && page) {
        const filepath = path.join(__dirname, page);
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf8');
            res.json({ content });
        } else {
            res.status(404).json({ error: 'Page not found' });
        }
        return;
    }
    
    res.status(400).json({ error: 'Invalid action' });
});

// Save content
app.post('/admin/api/content.php', requireAuth, (req, res) => {
    const { page, content } = req.body;
    
    if (!page) {
        return res.status(400).json({ error: 'No page specified' });
    }
    
    // Security: prevent directory traversal
    if (page.includes('..') || !page.endsWith('.html')) {
        return res.status(403).json({ error: 'Invalid page path' });
    }
    
    const filepath = path.join(__dirname, page);
    
    try {
        // Create backup
        const backupDir = path.join(__dirname, 'backups', new Date().toISOString().split('T')[0]);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        fs.writeFileSync(path.join(backupDir, page), fs.readFileSync(filepath));
        
        // Write new content
        fs.writeFileSync(filepath, content);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save' });
    }
});

// Logout
app.post('/admin/api/logout.php', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check auth
app.get('/admin/api/auth.php', requireAuth, (req, res) => {
    res.json({ authenticated: true, username: req.session.username });
});

app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT}/admin/ to access the editor`);
});