<?php
// -------- CORS --------
header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

session_start();
header("Content-Type: application/json");

// -------- INPUT --------
$input = json_decode(file_get_contents("php://input"), true);

$username = $input["login"] ?? "";
$password = $input["password"] ?? "";

// -------- BANCO --------
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

// -------- QUERY (usa username na tabela) --------
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// -------- VALIDAÇÃO --------
if (!$user || !password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "message" => "Login inválido"]);
    exit;
}

// -------- SUCESSO --------
$_SESSION["user_id"] = $user["id"];

echo json_encode([
    "success" => true,
    "user_id" => $user["id"]
]);