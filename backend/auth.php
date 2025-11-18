<?php
// auth.php
function require_auth() {
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function current_user_id() {
    return $_SESSION['user_id'] ?? null;
}
?>