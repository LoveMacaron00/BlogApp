<?php

class CommentController {
    private $db;
    
    function __construct($con) {
        $this->db = $con;
    }
    
    function getCommentsBlog($blogId) {
        try {
            $sql = "SELECT c.*, w.writerName  FROM comments c JOIN writer w ON c.writer_id = w.id WHERE c.blog_id = :blog_id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':blog_id', $blogId, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถดึงข้อมูลคอมเม้นท์ได้: ' . $e->getMessage()];
        }
    }

    function addComment($blogId, $content, $writer_id) {
        try {
            $sql = "INSERT INTO comments (blog_id, content, writer_id) VALUES (:blog_id, :content, :writer_id)";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':blog_id', $blogId, PDO::PARAM_INT);
            $stmt->bindParam(':content', $content, PDO::PARAM_STR);
            $stmt->bindParam(':writer_id', $writer_id, PDO::PARAM_INT);
            $stmt->execute();

            // Return the inserted comment
            $commentId = $this->db->lastInsertId();
            $sql = "SELECT * FROM comments WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $commentId, PDO::PARAM_INT);
            $stmt->execute();
            $comment = $stmt->fetch(PDO::FETCH_ASSOC);

            return $comment;
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถเพิ่มคอมเม้นท์ได้: ' . $e->getMessage()];
        }
    }

    function editComment($id, $content) {
        try {
            // สร้างคำสั่ง SQL สำหรับอัปเดตคอมเม้นท์
            $sql = "UPDATE comments SET content = :content WHERE id = :id";
            $stmt = $this->db->prepare($sql);
    
            // ผูกพารามิเตอร์กับคำสั่ง SQL
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':content', $content, PDO::PARAM_STR);
    
            // รันคำสั่ง SQL
            $stmt->execute();
    
            // ตรวจสอบว่ามีการอัปเดตแถวใดบ้าง
            if ($stmt->rowCount() > 0) {
                // ดึงข้อมูลคอมเม้นท์ที่อัปเดต
                $sql = "SELECT * FROM comments WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->bindParam(':id', $id, PDO::PARAM_INT);
                $stmt->execute();
                $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
                return $comment;
            } else {
                // คืนค่าข้อความว่าไม่พบคอมเม้นท์ที่จะอัปเดต
                return ['error' => 'ไม่พบคอมเม้นท์ที่ต้องการอัปเดต'];
            }
        } catch (PDOException $e) {
            // คืนค่าข้อความผิดพลาดในกรณีที่เกิดข้อผิดพลาด
            return ['error' => 'ไม่สามารถอัปเดตคอมเม้นท์ได้: ' . $e->getMessage()];
        }
    }
    
    function deleteComment($id) {
        try {
            // สร้างคำสั่ง SQL สำหรับลบคอมเม้นท์
            $sql = "DELETE FROM comments WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
    
            // ตรวจสอบว่ามีการลบแถวใดบ้าง
            if ($stmt->rowCount() > 0) {
                return ['success' => 'คอมเม้นท์ถูกลบเรียบร้อยแล้ว'];
            } else {
                return ['error' => 'ไม่พบคอมเม้นท์ที่ต้องการลบ'];
            }
        } catch (PDOException $e) {
            return ['error' => 'ไม่สามารถลบคอมเม้นท์ได้: ' . $e->getMessage()];
        }
    }
    
}

?>
