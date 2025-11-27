<?php
require_once 'cors.php';

session_start();
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);

$username = $input["login"] ?? "";
$password = $input["password"] ?? "";

// realiza a conexão com o banco de dados
try {
    $pdo = new PDO(
        "mysql:host=mysql;dbname=todo_pomodoro;charset=utf8",
        "appuser",
        "apppass",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => "Conexão falhou",
        "message" => $e->getMessage()
    ]);
    exit;
}

// recupera o usuário do banco de dados
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// valida o login e senha
if (!$user || !password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "message" => "Login inválido"]);
    exit;
}

// guarda o ID do usuário na sessão
$_SESSION["user_id"] = $user["id"];

// retorna sucesso
echo json_encode([
    "success" => true,
    "user_id" => $user["id"]
]);