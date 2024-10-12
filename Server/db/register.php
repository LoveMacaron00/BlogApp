<?php

class RegisterController {
    private $db;

    function __construct($con) {
        $this->db = $con;
    }

    function insert($username, $email, $password) {
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO user (username, email, password) VALUES (:username, :email, :password)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $hashedPassword);
            $stmt->execute();
            return ['success' => true];
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถแทรกข้อมูลผู้ใช้ได้: ' . $e->getMessage()];
        }
    }
    

}
?>
