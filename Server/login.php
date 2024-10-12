<?php

header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json');

require_once './db/config.php';
require_once './db/loginAuth.php';

$controller = new LoginController($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['username']) && isset($data['password'])) {
        $username = $data['username'];
        $password = $data['password'];
        $controller->login($username, $password);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'ข้อมูลที่ได้รับไม่ครบถ้วน']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'วิธีการส่งคำขอไม่ถูกต้อง']);
}
?>