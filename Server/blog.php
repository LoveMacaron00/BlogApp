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
        if (isset($_GET['id'])) {
            $response = $controller->getBlogDetail($_GET['id']);
        } else {  // เพิ่มเงื่อนไขใน else if
            $response = $controller->getBlogs();
        }
        echo json_encode($response);
        break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['id'])) {
                // ใช้ $data['id'] แทน $_GET['id']
                $response = $controller->updateView($data['id']);
                echo json_encode($response);
                break;
            } else {
                echo json_encode(['error' => 'อัพเดตยอดดูไม่ได้']);
                break;
            }
}

?>
