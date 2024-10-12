<?php
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST, PUT');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once './db/config.php';
require_once './db/controller.php';

$controller = new BlogController($pdo);

// ตรวจสอบ HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// ประมวลผลตาม HTTP method
switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['id'], $data['categoryName'])) {
            // รับค่าจาก POST
            $id = $data['id'];
            $categoryName = $data['categoryName'];

            $response = $controller->editCategory($id, $categoryName);
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
