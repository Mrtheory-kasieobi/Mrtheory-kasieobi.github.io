<?php
session_start();

$ADMIN_PASSWORD = getenv('ADMIN_PASSWORD') ?: 'pokgev-4Pimho-wixjep';
$PROJECT_ROOT = dirname(__DIR__, 2);

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['authenticated' => false, 'error' => 'Not authenticated']);
    exit;
}

$pages = [
    'general' => [
        'index.html' => 'Homepage',
        'about.html' => 'About',
        'contact.html' => 'Contact',
        'research.html' => 'Research',
        'teaching.html' => 'Teaching',
        'notes.html' => 'Notes',
        'blog.html' => 'Blog',
        'Track.html' => 'Track and Field'
    ],
    'courses' => [
        'courses/precalculus-11.html' => 'Precalculus 11',
        'courses/precalculus-12.html' => 'Precalculus 12',
        'courses/calculus-1.html' => 'Calculus I',
        'courses/calculus-2.html' => 'Calculus II',
        'courses/calculus-3.html' => 'Calculus III',
        'courses/real-analysis.html' => 'Real Analysis',
        'courses/introduction-to-proofs.html' => 'Introduction to Proofs',
        'courses/number-theory.html' => 'Elementary Number Theory',
        'courses/algebra-I.html' => 'Algebra I',
        'courses/algebra-II.html' => 'Algebra II',
        'courses/linear-algebra.html' => 'Linear Algebra'
    ],
    'expository' => [
        'olympiad.html' => 'Olympiad',
        'undergraduate.html' => 'Undergraduate',
        'graduate.html' => 'Graduate'
    ]
];

$action = $_GET['action'] ?? '';

if ($action === 'list') {
    echo json_encode(['pages' => $pages, 'sections' => array_keys($pages)]);
    exit;
}

if ($action === 'content') {
    $page = $_GET['page'] ?? '';
    $filepath = $PROJECT_ROOT . '/' . $page;
    
    if (preg_match('/\.\./', $page) || !preg_match('/\.html$/', $page)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid page path']);
        exit;
    }
    
    if (file_exists($filepath)) {
        $content = file_get_contents($filepath);
        
        $backupDir = $PROJECT_ROOT . '/admin/backups/' . date('Y-m-d');
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        copy($filepath, $backupDir . '/' . basename($page) . '.' . time());
        
        echo json_encode(['content' => $content]);
        exit;
    } else {
        echo json_encode(['error' => 'Page not found']);
        exit;
    }
}

if ($action === 'save') {
    $csrfToken = $_POST['csrf_token'] ?? '';
    if ($csrfToken !== ($_SESSION['csrf_token'] ?? '')) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
    
    $page = $_POST['page'] ?? '';
    $content = $_POST['content'] ?? '';
    
    if (preg_match('/\.\./', $page) || !preg_match('/\.html$/', $page)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid page path']);
        exit;
    }
    
    $filepath = $PROJECT_ROOT . '/' . $page;
    
    if (file_put_contents($filepath, $content)) {
        echo json_encode(['success' => true]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
?>