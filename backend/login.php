<?php
// login.php
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$login = trim($input['login'] ?? ''); // can be username or email
$password = $input['password'] ?? '';

if (!$login || !$password) {
    respond(['error' => 'login and password required'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = :login OR email = :login LIMIT 1");
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(['error' => 'invalid credentials'], 401);
    }

    // login success
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$user['id'];
    respond(['message' => 'logged_in', 'user_id' => $user['id']]);
} catch (PDOException $e) {
    respond(['error' => 'database error'], 500);
}