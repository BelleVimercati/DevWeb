<?php
// register.php
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$email || !$password) {
    respond(['error' => 'username, email and password are required'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'invalid email'], 400);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :hash)");
    $stmt->execute([':username' => $username, ':email' => $email, ':hash' => $hash]);
    $userId = $pdo->lastInsertId();
    // auto-login after register
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int)$userId;
    respond(['message' => 'registered', 'user_id' => $userId], 201);
} catch (PDOException $e) {
    if ($e->errorInfo[1] === 1062) { // duplicate
        respond(['error' => 'username or email already exists'], 409);
    }
    respond(['error' => 'database error'], 500);
}