<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

require_once './db/config.php';
require_once './db/comments.php';

$controller = new CommentController($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $response = $controller->getCommentsBlog($_GET['id']);
            echo json_encode($response);
        } else {
            echo json_encode(['error' => 'Blog ID not provided']);
        }
        break;

        case 'POST':
            // รับข้อมูล JSON จากคำขอ
            $data = json_decode(file_get_contents('php://input'), true);
        
            // ตรวจสอบข้อมูลที่จำเป็น
            if (isset($data['blog_id']) && isset($data['content']) && isset($data['writer_id'])) {
                $blogId = $data['blog_id'];
                $content = $data['content'];
                $writerId = $data['writer_id'];
        
                // เรียกใช้ฟังก์ชันเพื่อเพิ่มคอมเม้นท์
                $response = $controller->addComment($blogId, $content, $writerId);
                echo json_encode($response);
            } else {
                echo json_encode(['error' => 'Missing blog_id, content, or writer_id']);
            }
            break;
        

}

?>
