<?php

class BlogController {
    private $db;
    
    function __construct($con) {
        $this->db = $con;
    }
    
    function getBlogs() {
        try {
            $sql = "SELECT a.id, a.title, a.description, a.content, w.writerName, a.view, b.username, c.categoryName, a.image_url, a.created_at, a.updated_at
            FROM blog a
            INNER JOIN user b ON a.user_id = b.id
            INNER JOIN writer w ON a.writer_id = w.id
            INNER JOIN category c ON a.category_id = c.id
            ORDER BY a.id";
            $result = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลบล็อกได้: ' . $e->getMessage()];
        }
    }
    
    function getBlogDetail($id) {
        try {
            $sql = "SELECT a.id, a.title, a.description, a.content, w.writerName, a.view, b.username, c.categoryName, a.image_url, a.created_at, a.updated_at
                    FROM blog a
                    INNER JOIN user b ON a.user_id = b.id
                    INNER JOIN writer w ON a.writer_id = w.id
                    INNER JOIN category c ON a.category_id = c.id
                    WHERE a.id = :id"; // เพิ่ม WHERE clause เพื่อกรองตาม ID
            
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(":id", $id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลรายละเอียดบล็อกได้: ' . $e->getMessage()];
        }
    }
    
    function getUser() {
        try {
            $sql = "SELECT *
            FROM user a
            ORDER BY a.id";
            $result = $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลผู้ใช้ได้: ' . $e->getMessage()];
        }
    }

    public function deleteUser($id) {
        try {
            $id = intval($id); // ตรวจสอบให้แน่ใจว่า id เป็นตัวเลข
    
            // ลบข้อมูลในตาราง writer ที่มี user_id ตรงกับ id
            $sql = "DELETE FROM writer WHERE user_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
    
            // ลบข้อมูลในตาราง user
            $sql = "DELETE FROM user WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
    
            if ($stmt->rowCount() > 0) {
                return ['success' => 'ลบข้อมูลผู้ใช้สำเร็จ'];
            } else {
                return ['error' => 'ไม่พบข้อมูลที่ต้องการลบ'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถลบข้อมูลผู้ใช้ได้: ' . $e->getMessage()];
        }
    }

    public function addCategory($categoryName) {
        try {
            $sql = "INSERT INTO category (categoryName) VALUES (:categoryName)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':categoryName', $categoryName, PDO::PARAM_STR);
            $stmt->execute();
    
            if ($stmt->rowCount() > 0) {
                return ['success' => 'หมวดหมู่ถูกเพิ่มเรียบร้อยแล้ว'];
            } else {
                return ['error' => 'ไม่สามารถเพิ่มหมวดหมู่ได้'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถเพิ่มหมวดหมู่ได้: ' . $e->getMessage()];
        }
    }
    

    function deleteCategory($id) {
        try {
            $sql = "DELETE FROM category WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
    
            if ($stmt->rowCount() > 0) {
                return ['success' => 'หมวดหมู่ถูกลบเรียบร้อยแล้ว'];
            } else {
                return ['error' => 'ไม่พบหมวดหมู่ที่ต้องการลบ'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถลบหมวดหมู่ได้: ' . $e->getMessage()];
        }
    }

    public function editCategory($id, $categoryName) {
        try {
            $sql = "UPDATE category SET categoryName = :categoryName WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':categoryName', $categoryName, PDO::PARAM_STR);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return ['success' => 'หมวดหมู่ถูกแก้ไขเรียบร้อยแล้ว'];
            } else {
                return ['error' => 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถแก้ไขหมวดหมู่ได้: ' . $e->getMessage()];
        }
    }
    
    function uploadImage($file, $targetDir) {
        $targetFile = $targetDir . basename($file["name"]);
        $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
        $mimeType = mime_content_type($file["tmp_name"]);
        
        // ตรวจสอบว่ามันเป็นรูปภาพจริงหรือไม่
        if (strpos($mimeType, 'image') === false) {
            return ['status' => 'error', 'message' => 'ไฟล์ไม่ใช่รูปภาพ'];
        }
        
        // ตรวจสอบขนาดไฟล์
        if ($file["size"] > 500000) {
            return ['status' => 'error', 'message' => 'ไฟล์มีขนาดใหญ่เกินไป'];
        }
        
        // ตรวจสอบนามสกุลไฟล์
        if (!in_array($imageFileType, ["jpg", "png", "jpeg", "gif"])) {
            return ['status' => 'error', 'message' => 'อนุญาตเฉพาะไฟล์ JPG, JPEG, PNG & GIF เท่านั้น'];
        }

        $newFileName = uniqid() . '.' . $imageFileType;
        $targetFile = $targetDir . $newFileName;

        // อัปโหลดไฟล์
        if (move_uploaded_file($file["tmp_name"], $targetFile)) {
            return ['status' => 'success', 'path' => $newFileName];
        } else {
            return ['status' => 'error', 'message' => 'ขออภัย เกิดข้อผิดพลาดในการอัปโหลดไฟล์ของคุณ'];
        }
    }

    // ฟังก์ชันสำหรับอัพเดตยอดการดู
    function updateView($id) {
        try {
            $sql = "UPDATE blog SET view = view + 1 WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->bindValue(1, $id); // ระบุพารามิเตอร์โดยใช้ตำแหน่ง
            $stmt->execute();
            return ['success' => true];
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถอัพเดตยอดดูได้: ' . $e->getMessage()];
        }
    }
    

}

?>