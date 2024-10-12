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
    case 'POST':
        // ดึงข้อมูล JSON จาก request body
        $input = json_decode(file_get_contents('php://input'), true);

        // ตรวจสอบว่ามีการส่งข้อมูล writer มาหรือไม่
        if (!isset($input['writer']) || empty($input['writer'])) {
            echo json_encode(['error' => 'Writer name is required']);
            exit();
        }

        // ดึงข้อมูล writer
        $writer = $input['writer'];
        $response = $controller->insertWriter($token, $writer);
        echo json_encode($response);
        break;

    case 'GET':
        // ดึงข้อมูลบล็อกของผู้ใช้
        $response = $controller->getWriterUser($token);
        echo json_encode($response);
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
