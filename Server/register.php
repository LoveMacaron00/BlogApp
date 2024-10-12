<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: OPTIONS, POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

require_once './db/config.php';
require_once './db/register.php';

$controller = new RegisterController($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['username'], $data['email'], $data['password'])) {
            $response = $controller->insert($data['username'], $data['email'], $data['password']);
            echo json_encode($response);
        } else {
            echo json_encode(['error' => 'ข้อมูลที่จำเป็นหายไป']);
        }
        break;


    default:
        echo json_encode(['error' => 'วิธีการร้องขอที่ไม่ถูกต้อง']);
        break;
}

?>
