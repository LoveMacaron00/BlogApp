<?php

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST, PUT');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once './db/config.php';
require_once './db/getUserBlogs.php';

$controller = new BlogUserController($pdo);

// รับ Authorization header
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

// บันทึกค่า token เพื่อตรวจสอบ
error_log('Received token: ' . $token);

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
        // ตรวจสอบการอัปโหลดไฟล์ (หากมี)
        $file = isset($_FILES['file']) ? $_FILES['file'] : null;

        // อ่านข้อมูลจาก POST request
        $data = $_POST;

        // ตรวจสอบข้อมูลที่จำเป็น
        if (isset($data['id'], $data['title'], $data['description'], $data['category'], $data['content'], $data['writer'])) {
            // รับค่าจาก POST
            $id = $data['id'];
            $title = $data['title'];
            $description = $data['description'];
            $content = $data['content'];
            $category = $data['category'];
            $writer = $data['writer'];

            // แสดงข้อมูลที่ได้รับเพื่อตรวจสอบ
            error_log('Received data: ' . print_r($data, true));
            error_log('File: ' . print_r($file, true));

            // เรียกใช้ฟังก์ชัน update โดยส่งข้อมูลที่จำเป็น
            $response = $controller->update($token, $id, $title, $description, $content, $file, $writer, $category);
            echo json_encode($response);
        } else {
            echo json_encode(['error' => 'Missing required fields']);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
