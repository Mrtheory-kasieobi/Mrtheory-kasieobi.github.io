<?php
session_start();

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === 'admin' && $password === 'pokgev-4Pimho-wixjep') {
    $_SESSION['authenticated'] = true;
    $_SESSION['username'] = $username;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

header('Content-Type: application/json');
echo json_encode(['authenticated' => true, 'csrf_token' => $_SESSION['csrf_token'] ?? null]);
?>