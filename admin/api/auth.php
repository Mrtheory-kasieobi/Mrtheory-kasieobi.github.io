<?php
session_start();

$ADMIN_PASSWORD = getenv('ADMIN_PASSWORD') ?: 'pokgev-4Pimho-wixjep';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        http_response_code(401);
        echo json_encode(['authenticated' => false, 'error' => 'Not authenticated']);
        exit;
    }
    
    echo json_encode([
        'authenticated' => true, 
        'username' => $_SESSION['username'] ?? 'admin', 
        'csrf_token' => $_SESSION['csrf_token'] ?? null,
        'loginTime' => $_SESSION['loginTime'] ?? null
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    if ($username === 'admin' && hash_equals($ADMIN_PASSWORD, $password)) {
        $_SESSION['authenticated'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['loginTime'] = time();
        $_SESSION['ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
        
        echo json_encode(['success' => true, 'csrf_token' => $_SESSION['csrf_token']]);
        exit;
    }
    
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>