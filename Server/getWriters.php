<?php

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

require_once './db/config.php';
require_once './db/getUserBlogs.php';

$controller = new BlogUserController($pdo);

// รับ Authorization header
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

// ตรวจสอบการมี token
if (!$token) {
    echo json_encode(['error' => 'Token is required']);
    exit();
}

// ตรวจสอบ HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// ประมวลผลตาม HTTP method
switch ($method) {
    case 'GET':
        // ดึงข้อมูลบล็อกของผู้ใช้
        $response = $controller->getWriters($token);
        echo json_encode($response);
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
