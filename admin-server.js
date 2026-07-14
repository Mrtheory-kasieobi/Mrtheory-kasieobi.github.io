const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname));

const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

app.post('/admin/api/auth.php', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'pokgev-4Pimho-wixjep') {
        req.session.authenticated = true;
        req.session.username = username;
        req.session.csrf_token = crypto.randomBytes(32).toString('hex');
        res.json({ success: true, csrf_token: req.session.csrf_token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

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

app.post('/admin/api/content.php', requireAuth, (req, res) => {
    const { page, content, csrf_token } = req.body;
    
    if (!page) {
        return res.status(400).json({ error: 'No page specified' });
    }
    
    if (csrf_token !== req.session.csrf_token) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    if (page.includes('..') || !page.endsWith('.html')) {
        return res.status(403).json({ error: 'Invalid page path' });
    }
    
    const filepath = path.join(__dirname, page);
    
    try {
        const backupDir = path.join(__dirname, 'backups', new Date().toISOString().split('T')[0]);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        if (fs.existsSync(filepath)) {
            fs.writeFileSync(path.join(backupDir, page), fs.readFileSync(filepath));
        }
        fs.writeFileSync(filepath, content);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save' });
    }
});

app.post('/admin/api/logout.php', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/admin/api/auth.php', requireAuth, (req, res) => {
    res.json({ authenticated: true, username: req.session.username, csrf_token: req.session.csrf_token });
});

app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT}/admin/ to access the editor`);
});