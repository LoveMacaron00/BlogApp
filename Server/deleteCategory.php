<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

require_once './db/config.php';
require_once './db/controller.php';

$controller = new BlogController($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'POST':
        // ตรวจสอบว่า Content-Type เป็น application/json หรือไม่
        if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // ตรวจสอบว่า key 'id' และ 'action' มีอยู่และ 'action' เป็น 'delete'
            if (isset($data['id']) && isset($data['action']) && $data['action'] === 'delete') {
                $response = $controller->deleteCategory($data['id']);
                echo json_encode($response);
            } else {
                echo json_encode(['error' => 'คำขอไม่สมบูรณ์']);
            }
        } else {
            echo json_encode(['error' => 'Content-Type ต้องเป็น application/json']);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

?>
