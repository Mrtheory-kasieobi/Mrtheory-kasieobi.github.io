<?php
session_start();

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'list') {
    $pages = [
        'index.html' => 'Homepage',
        'teaching.html' => 'Teaching',
        'courses/calculus-1.html' => 'Calculus I',
        'courses/calculus-2.html' => 'Calculus II',
        'courses/calculus-3.html' => 'Calculus III',
        'courses/linear-algebra.html' => 'Linear Algebra',
        'courses/real-analysis.html' => 'Real Analysis',
        'courses/introduction-to-proofs.html' => 'Introduction to Proofs',
        'courses/number-theory.html' => 'Elementary Number Theory',
        'courses/algebra-I.html' => 'Algebra I',
        'courses/algebra-II.html' => 'Algebra II',
        'research.html' => 'Research',
        'about.html' => 'About',
        'contact.html' => 'Contact',
        'notes.html' => 'Notes',
        'blog.html' => 'Blog'
    ];
    echo json_encode(['pages' => $pages]);
    exit;
}

if ($action === 'content') {
    $page = $_GET['page'] ?? '';
    $filepath = __DIR__ . '/../' . $page;
    
    if (file_exists($filepath)) {
        $content = file_get_contents($filepath);
        $backupDir = __DIR__ . '/../backups/' . date('Y-m-d');
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
    $filepath = __DIR__ . '/../' . $page;
    
    if (preg_match('/\.\./', $page) || !preg_match('/\.html$/', $page)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid page path']);
        exit;
    }
    
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