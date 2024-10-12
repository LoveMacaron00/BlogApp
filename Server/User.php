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

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];
$path = dirname($_SERVER['REQUEST_URI']);
$urlimg = $protocol . $host . $path . "/";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // ดึงข้อมูลผู้ใช้ทั้งหมด
        $response = $controller->getUser();
        echo json_encode($response);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['id']) && isset($data['action']) && $data['action'] === 'delete') {
            $response = $controller->deleteUser($data['id']);
            echo json_encode($response);
        } else if (isset($data['id'])) {
            $response = $controller->updateView($data['id']);
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
