<?php

require_once 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class BlogUserController {
    private $db;
    private $secretKey = "WaveBlog";

    function __construct($con) {
        $this->db = $con;
    }

    private function getUserFromToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            return ['error' => 'Invalid token: ' . $e->getMessage()];
        }
    }

    function getUserBlogs($token) {
        $user = $this->getUserFromToken($token);

        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }

        $username = $user['username'];

        try {
            $sql = "SELECT a.id, a.title, a.description, a.content, w.writerName, a.view, b.username, c.categoryName, a.image_url, a.created_at, a.updated_at
            FROM blog a
            INNER JOIN user b ON a.user_id = b.id
            INNER JOIN writer w ON a.writer_id = w.id
            INNER JOIN category c ON a.category_id = c.id
            WHERE b.username = :username
            ORDER BY a.id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลบล็อกของผู้ใช้ได้: ' . $e->getMessage()];
        }
    }

    function getWriterUser($token) {
        $user = $this->getUserFromToken($token);
    
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
    
        $username = $user['username'];
    
        try {
            $sql = "SELECT a.id, a.writerName, b.username
                    FROM writer a
                    INNER JOIN user b ON a.user_id = b.id
                    WHERE b.username = :username
                    ORDER BY a.id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลของผู้เขียนได้: ' . $e->getMessage()];
        }
    }
    

    function getUserBlogsId($token, $id) {
        $user = $this->getUserFromToken($token);
        $userId = $user['id'];
    
        try {
            $sql = "SELECT a.id, a.title, a.description, a.content, w.writerName, a.view, b.username, c.categoryName, a.image_url, a.created_at, a.updated_at
            FROM blog a
            INNER JOIN user b ON a.user_id = b.id
            INNER JOIN writer w ON a.writer_id = w.id
            INNER JOIN category c ON a.category_id = c.id
            WHERE a.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลรายละเอียดบล็อกได้: ' . $e->getMessage()];
        }
    }
    
    function getWriters($token) {
        // ดึงข้อมูลผู้ใช้จาก token
        $user = $this->getUserFromToken($token);
    
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
    
        $username = $user['username'];
    
        try {

            $sql = "SELECT a.writerName
                    FROM writer a
                    INNER JOIN user b ON a.user_id = b.id
                    WHERE b.username = :username
                    ORDER BY a.id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลนักเขียนได้: ' . $e->getMessage()];
        }
    }

    function getCategory() {
        try {
            $sql = "SELECT id, categoryName
            FROM category
            ORDER BY id";
            $result = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลบล็อกได้: ' . $e->getMessage()];
        }
    }

    function deleteCategory($id) {
        try {
            // ใช้ SQL Query เพื่อลบหมวดหมู่ที่มี id ตรงกับที่ระบุ
            $sql = "DELETE FROM category WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
    
            // ตรวจสอบว่ามีแถวที่ได้รับผลกระทบหรือไม่
            if ($stmt->rowCount() > 0) {
                return ['success' => 'หมวดหมู่ถูกลบเรียบร้อยแล้ว'];
            } else {
                return ['error' => 'ไม่พบหมวดหมู่ที่ต้องการลบ'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถลบหมวดหมู่ได้: ' . $e->getMessage()];
        }
    }

    function insert($token, $title, $description, $content, $file, $writer_id, $category_id) {
        // ดึงข้อมูลผู้ใช้จาก token
        $user = $this->getUserFromToken($token);
    
        // ตรวจสอบว่ามีข้อผิดพลาดในการดึงข้อมูลผู้ใช้หรือไม่
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
    
        // ตรวจสอบว่า user_id ไม่ใช่ null
        if (empty($user['id'])) {
            return ['error' => 'User ID is missing'];
        }
    
        // ตรวจสอบการอัปโหลดไฟล์ (หากมีการส่งไฟล์)
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            // อัปโหลดรูปภาพ
            $targetDir = "uploads/";
            $uploadResult = $this->uploadImage($file, $targetDir);
    
            // ตรวจสอบผลการอัปโหลด
            if ($uploadResult['status'] === 'error') {
                return ['error' => $uploadResult['message']];
            }
    
            $image_url = $uploadResult['path'];
        } else {
            $image_url = null; // หรือใช้ค่าเริ่มต้นถ้าไม่มีการอัปโหลดไฟล์
        }
    
        try {
            // เตรียมคำสั่ง SQL สำหรับการแทรกข้อมูลบล็อก
            $sql = "INSERT INTO blog (title, description, content, writer_id, category_id, user_id, image_url) 
                    VALUES (:title, :description, :content, :writer_id, :category_id, :user_id, :image_url)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":content", $content);
            $stmt->bindParam(":writer_id", $writer_id);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":user_id", $user['id']);
            $stmt->bindParam(":image_url", $image_url);
            $stmt->execute();
            return ['success' => true];
        } catch (PDOException $e) {
            // แสดงข้อผิดพลาดหากมีปัญหาในการแทรกข้อมูล
            return ['error' => 'ไม่สามารถแทรกข้อมูลบล็อกได้: ' . $e->getMessage()];
        }
    }


    function insertWriter($token, $writer) {
        // ดึงข้อมูลผู้ใช้จาก token
        $user = $this->getUserFromToken($token);
    
        // ตรวจสอบว่ามีข้อผิดพลาดในการดึงข้อมูลผู้ใช้หรือไม่
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
    
        // ตรวจสอบว่า user_id ไม่ใช่ null
        if (empty($user['id'])) {
            return ['error' => 'User ID is missing'];
        }
    
        try {
            // เตรียมคำสั่ง SQL สำหรับการแทรกข้อมูลนักเขียน
            $sql = "INSERT INTO writer (writerName, user_id) 
                    VALUES (:writerName, :user_id)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":writerName", $writer);
            $stmt->bindParam(":user_id", $user['id']);
            $stmt->execute();
            return ['success' => true];
        } catch (PDOException $e) {
            // แสดงข้อผิดพลาดหากมีปัญหาในการแทรกข้อมูล
            return ['error' => 'ไม่สามารถแทรกข้อมูลนักเขียนได้: ' . $e->getMessage()];
        }
    }

    public function deleteWriter($token, $id) {
        $user = $this->getUserFromToken($token);
        
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
      
        if (empty($user['id'])) {
            return ['error' => 'User ID is missing'];
        }
      
        try {
            // ตรวจสอบว่านักเขียนที่ต้องการลบมีอยู่ในฐานข้อมูลและ user_id ตรงกันหรือไม่
            $checkSql = "SELECT id FROM writer WHERE id = :writerId AND user_id = :userId";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->bindParam(":writerId", $id);
            $checkStmt->bindParam(":userId", $user['id']);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() == 0) {
                return ['error' => 'No writer found with the given ID or you do not have permission to delete it'];
            }
    
            // ลบข้อมูลที่เชื่อมโยงในตาราง blog ก่อน
            $deleteBlogsSql = "DELETE FROM blog WHERE writer_id = :writerId";
            $deleteBlogsStmt = $this->db->prepare($deleteBlogsSql);
            $deleteBlogsStmt->bindParam(":writerId", $id);
            $deleteBlogsStmt->execute();
        
            // เตรียมคำสั่ง SQL สำหรับการลบข้อมูลนักเขียน
            $sql = "DELETE FROM writer WHERE id = :writerId AND user_id = :userId";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":writerId", $id);
            $stmt->bindParam(":userId", $user['id']);
            $stmt->execute();
      
            if ($stmt->rowCount() > 0) {
                return ['success' => true];
            } else {
                return ['error' => 'Failed to delete the writer'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถลบข้อมูลนักเขียนได้: ' . $e->getMessage()];
        }
    }
    

    function update($token, $id, $title = null, $description = null, $content = null, $file = null, $writer_id = null, $category_id = null) {
        // ดึงข้อมูลผู้ใช้จาก token
        $user = $this->getUserFromToken($token);
    
        // ตรวจสอบว่ามีข้อผิดพลาดในการดึงข้อมูลผู้ใช้หรือไม่
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
    
        // ตรวจสอบว่า user_id ไม่ใช่ null
        if (empty($user['id'])) {
            return ['error' => 'User ID is missing'];
        }
    
        // ตรวจสอบการอัปโหลดไฟล์ (หากมีการส่งไฟล์)
        $image_url = null; // ใช้ค่าเดิมถ้าไม่มีการอัปโหลดไฟล์ใหม่
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            // ดึง URL ของรูปภาพเดิม
            $oldImageUrl = $this->getImageUrlById($id);
    
            // อัปโหลดรูปภาพใหม่
            $targetDir = "uploads/";
            $uploadResult = $this->uploadImage($file, $targetDir);
    
            // ตรวจสอบผลการอัปโหลด
            if ($uploadResult['status'] === 'error') {
                return ['error' => $uploadResult['message']];
            }
    
            $image_url = $uploadResult['path'];
    
            // ลบรูปภาพเก่าถ้ามี
            if ($oldImageUrl) {
                // แปลง URL เป็นเส้นทางไฟล์จริงในระบบไฟล์
                $oldFilePath = str_replace('http://localhost/BlogApi-v1/Server/uploads/', 'uploads/', $oldImageUrl);
                
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }
        }
    
        try {
            // เตรียมคำสั่ง SQL สำหรับการอัปเดตข้อมูลบล็อก
            $sql = "UPDATE blog SET ";
            $params = [];
    
            if ($title !== null) {
                $sql .= "title = :title, ";
                $params[':title'] = $title;
            }
            if ($description !== null) {
                $sql .= "description = :description, ";
                $params[':description'] = $description;
            }
            if ($content !== null) {
                $sql .= "content = :content, ";
                $params[':content'] = $content;
            }
            if ($writer_id !== null) {
                $sql .= "writer_id = :writer_id, ";
                $params[':writer_id'] = $writer_id;
            }
            if ($category_id !== null) {
                $sql .= "category_id = :category_id, ";
                $params[':category_id'] = $category_id;
            }
            if ($image_url !== null) {
                $sql .= "image_url = :image_url, ";
                $params[':image_url'] = $image_url;
            }
    
            // ลบเครื่องหมายจุลภาคสุดท้าย
            $sql = rtrim($sql, ", ");
    
            // เพิ่มเงื่อนไข WHERE
            $sql .= " WHERE id = :id AND user_id = :user_id";
            $params[':id'] = $id;
            $params[':user_id'] = $user['id'];
    
            $stmt = $this->db->prepare($sql);
    
            // bind parameters
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
    
            $stmt->execute();
    
            return ['success' => true];
        } catch (PDOException $e) {
            // แสดงข้อผิดพลาดหากมีปัญหาในการอัปเดตข้อมูล
            return ['error' => 'ไม่สามารถอัปเดตข้อมูลบล็อกได้: ' . $e->getMessage()];
        }
    }
    
    private function getImageUrlById($id) {
        // ค้นหา image_url ของบล็อกโดยใช้ id
        $sql = "SELECT image_url FROM blog WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['image_url'] ?? null;
    }

    function delete($token, $id) {
        // ตรวจสอบผู้ใช้จาก token
        $user = $this->getUserFromToken($token);
    
        if (isset($user['error'])) {
            return ['error' => $user['error']];
        }
    
        // ตรวจสอบว่า user_id ไม่ใช่ null
        if (empty($user['id'])) {
            return ['error' => 'User ID is missing'];
        }
    
        try {
            // ค้นหา URL ของรูปภาพที่เกี่ยวข้องกับบล็อกที่ต้องลบ
            $imageUrl = $this->getImageUrlById($id);
    
            // ลบบล็อกจากฐานข้อมูล
            $sql = "DELETE FROM blog WHERE id = :id AND user_id = :user_id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->bindParam(":user_id", $user['id']);
            $stmt->execute();
    
            // ลบรูปภาพถ้ามี
            if ($imageUrl) {
                // แปลง URL เป็นเส้นทางไฟล์จริงในระบบไฟล์
                $filePath = str_replace('http://localhost/BlogApi-v1/Server/uploads/', 'uploads/', $imageUrl);
                
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
    
            return ['success' => true];
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถลบบล็อกได้: ' . $e->getMessage()];
        }
    }

    private function uploadImage($file, $targetDir) {
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0777, true); // สร้างโฟลเดอร์หากยังไม่มี
        }
    
        $imageFileType = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    
        if (!in_array($imageFileType, $allowedTypes)) {
            return ['status' => 'error', 'message' => 'ไฟล์รูปภาพไม่ได้รับอนุญาต'];
        }
    
        $newFileName = uniqid() . '.' . $imageFileType;
        $targetFile = $targetDir . $newFileName;
    
        if (move_uploaded_file($file["tmp_name"], $targetFile)) {
            $baseUrl = 'http://localhost/BlogApi-v1/Server/uploads/';
            $imageUrl = $baseUrl . $newFileName;
            return ['status' => 'success', 'path' => $imageUrl];
        } else {
            return ['status' => 'error', 'message' => 'ไม่สามารถอัปโหลดไฟล์ได้'];
        }
    }

}
