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
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['categoryName'])) {
            $response = $controller->addCategory($data['categoryName']);
            echo json_encode($response);
        } else {
            echo json_encode(['error' => 'คำขอไม่สมบูรณ์']);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
