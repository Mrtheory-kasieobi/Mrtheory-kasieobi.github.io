const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5501;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pokgev-4Pimho-wixjep';

const PROJECT_ROOT = path.resolve(__dirname, '..');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts, please try again later.'
});

app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 3600000,
        httpOnly: true,
        sameSite: 'strict'
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname));

app.use('/admin/api/auth.php', limiter);

const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
};

const pages = {
    general: [
        { path: 'index.html', name: 'Homepage' },
        { path: 'about.html', name: 'About' },
        { path: 'contact.html', name: 'Contact' },
        { path: 'research.html', name: 'Research' },
        { path: 'teaching.html', name: 'Teaching' },
        { path: 'notes.html', name: 'Notes' },
        { path: 'blog.html', name: 'Blog' },
        { path: 'Track.html', name: 'Track and Field' }
    ],
    courses: [
        { path: 'courses/precalculus-11.html', name: 'Precalculus 11' },
        { path: 'courses/precalculus-12.html', name: 'Precalculus 12' },
        { path: 'courses/calculus-1.html', name: 'Calculus I' },
        { path: 'courses/calculus-2.html', name: 'Calculus II' },
        { path: 'courses/calculus-3.html', name: 'Calculus III' },
        { path: 'courses/real-analysis.html', name: 'Real Analysis' },
        { path: 'courses/introduction-to-proofs.html', name: 'Introduction to Proofs' },
        { path: 'courses/number-theory.html', name: 'Elementary Number Theory' },
        { path: 'courses/algebra-I.html', name: 'Algebra I' },
        { path: 'courses/algebra-II.html', name: 'Algebra II' },
        { path: 'courses/linear-algebra.html', name: 'Linear Algebra' }
    ],
    olympiad: [
        { path: 'olympiad.html', name: 'Olympiad' },
        { path: 'undergraduate.html', name: 'Undergraduate' },
        { path: 'graduate.html', name: 'Graduate' }
    ]
};

app.post('/admin/api/auth.php', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        req.session.username = username;
        req.session.csrf_token = crypto.randomBytes(32).toString('hex');
        req.session.loginTime = Date.now();
        res.json({ success: true, csrf_token: req.session.csrf_token });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

app.get('/admin/api/auth.php', requireAuth, (req, res) => {
    res.json({ 
        authenticated: true, 
        username: req.session.username, 
        csrf_token: req.session.csrf_token,
        loginTime: req.session.loginTime
    });
});

app.get('/admin/api/content.php', requireAuth, (req, res) => {
    const action = req.query.action;
    
    if (action === 'list') {
        res.json({ pages, sections: Object.keys(pages) });
        return;
    }
    
    if (action === 'content' && req.query.page) {
        const page = req.query.page;
        const filepath = path.join(PROJECT_ROOT, page);
        
        if (fs.existsSync(filepath)) {
            const content = fs.readFileSync(filepath, 'utf8');
            
            const backupDir = path.join(PROJECT_ROOT, 'admin', 'backups', new Date().toISOString().split('T')[0]);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const backupFile = path.join(backupDir, page.replace(/\//g, '_') + '.' + Date.now());
            fs.writeFileSync(backupFile, content);
            
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
    
    if (!page || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (csrf_token !== req.session.csrf_token) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    if (page.includes('..') || !page.endsWith('.html')) {
        return res.status(403).json({ error: 'Invalid page path' });
    }
    
    const filepath = path.join(PROJECT_ROOT, page);
    
    try {
        const backupDir = path.join(PROJECT_ROOT, 'admin', 'backups', new Date().toISOString().split('T')[0]);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        if (fs.existsSync(filepath)) {
            fs.writeFileSync(path.join(backupDir, page.replace(/\//g, '_') + '.' + Date.now()), fs.readFileSync(filepath));
        }
        
        fs.writeFileSync(filepath, content);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save: ' + error.message });
    }
});

app.get('/admin/api/history.php', requireAuth, (req, res) => {
    const page = req.query.page;
    const historyDir = path.join(PROJECT_ROOT, 'admin', 'backups');
    
    if (!fs.existsSync(historyDir)) {
        return res.json({ versions: [] });
    }
    
    const versions = [];
    const dateDirs = fs.readdirSync(historyDir).filter(d => !d.startsWith('.'));
    
    dateDirs.forEach(date => {
        const dateDir = path.join(historyDir, date);
        if (fs.statSync(dateDir).isDirectory()) {
            const files = fs.readdirSync(dateDir);
            files.forEach(file => {
                if (file.includes(page.replace(/\//g, '_'))) {
                    versions.push({
                        date: date,
                        file: file,
                        path: path.join(dateDir, file)
                    });
                }
            });
        }
    });
    
    res.json({ versions: versions.sort((a, b) => b.date.localeCompare(a.date)) });
});

app.post('/admin/api/logout.php', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT}/admin/ to access the editor`);
});