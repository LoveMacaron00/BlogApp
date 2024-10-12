<?php
// Example PHP code for updating comment
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: PUT');
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once './db/config.php';
require_once './db/comments.php';

$controller = new CommentController($pdo);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Read input
        $data = json_decode(file_get_contents('php://input'), true);

        // Check for required fields
        if (isset($data['id']) && isset($data['content'])) {
            $commentId = $data['id'];
            $content = $data['content'];

            $response = $controller->editComment($commentId, $content);
            echo json_encode($response);
        } else {
            echo json_encode(['error' => 'Missing required fields']);
        }
        break;

    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

?>
