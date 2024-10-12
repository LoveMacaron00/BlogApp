<?php

require_once 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class LoginController {
    private $db;
    private $secretKey = "WaveBlog";
    private $adminUsername = "admin";
    private $adminPassword = "admin123";

    function __construct($con) {
        $this->db = $con;
    }

    function login($username, $password) {
        try {
            // ตรวจสอบข้อมูล admin
            if ($username === $this->adminUsername && $password === $this->adminPassword) {
                $token = $this->createJWT($username, 'admin'); // ส่ง 'admin' เป็น userId
                echo json_encode(['status' => 'success', 'token' => $token]);
                return;
            }

            // ตรวจสอบข้อมูลผู้ใช้จากฐานข้อมูล
            $sql = "SELECT * FROM user WHERE username = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(1, $username);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if (password_verify($password, $user['password'])) {
                    $token = $this->createJWT($username, $user['id']); // ส่ง user id ไปที่ createJWT
                    echo json_encode(['status' => 'success', 'token' => $token]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'ข้อมูลรับรองไม่ถูกต้อง']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'ไม่พบผู้ใช้']);
            }
        } catch (Exception $e) {
            echo json_encode(['error' => 'ไม่สามารถทำงานได้: ' . $e->getMessage()]);
        }
    }

    private function createJWT($username, $userId) {
        $issuedAt = time();
        $expirationTime = $issuedAt + 3600;
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'username' => $username,
            'id' => $userId
        ];

        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    function validateJWT($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return $decoded->username;
        } catch (Exception $e) {
            return false;
        }
    }
}
?>
