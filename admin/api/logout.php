<?php
session_start();

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Content-Type: application/json');
    echo json_encode(['authenticated' => false]);
    exit;
}

if (isset($_POST['action']) && $_POST['action'] === 'logout') {
    session_destroy();
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
    exit;
}

header('Content-Type: application/json');
echo json_encode(['authenticated' => true]);
?>