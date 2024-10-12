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
    case 'GET':
        // ดึงข้อมูลบล็อกของผู้ใช้
        $response = $controller->getUserBlogs($token);
        echo json_encode($response);
        break;

        case 'POST':
            // ตรวจสอบการอัปโหลดไฟล์ (หากมี)
            $file = isset($_FILES['image']) ? $_FILES['image'] : null;
        
            // ตรวจสอบข้อมูลที่จำเป็น
            if (isset($_POST['title'], $_POST['description'], $_POST['category_id'], $_POST['content'], $_POST['writer'])) {
                // รับค่าจาก POST
                $title = $_POST['title'];
                $description = $_POST['description'];
                $content = $_POST['content'];
                $category_id = $_POST['category_id'];
                $writer = $_POST['writer'];
        
                // เรียกใช้ฟังก์ชัน insert โดยส่งข้อมูลที่จำเป็น
                $response = $controller->insert($token, $title, $description, $content, $file, $writer, $category_id);
                echo json_encode($response);
            } else {
                echo json_encode(['error' => 'Missing required fields']);
            }
            break;

    case 'DELETE':
        // รับข้อมูลจาก body ของ request
        $data = json_decode(file_get_contents('php://input'), true);

        // ตรวจสอบข้อมูลที่จำเป็น
        if (isset($data['id'])) {
            $response = $controller->delete($token, $data['id']);
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
