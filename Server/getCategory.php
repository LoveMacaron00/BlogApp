<?php

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

require_once './db/config.php';
require_once './db/getUserBlogs.php';

// ตรวจสอบเมธอดการร้องขอ
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // สร้างอินสแตนซ์ของคอนโทรลเลอร์
    $controller = new BlogUserController($pdo);

    // ดึงข้อมูลนักเขียน
    $response = $controller->getCategory();

    // ส่งข้อมูลในรูปแบบ JSON
    echo json_encode($response);
} else {
    // ส่งสถานะข้อผิดพลาดหากไม่ใช่ GET request
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method not allowed']);
}
