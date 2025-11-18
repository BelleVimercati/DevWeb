<?php
// config.php - VERSÃO PARA DESENVOLVIMENTO

// Headers PRIMEIRO
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://127.0.0.1:5500';

// Permite ESPECIFICAMENTE a origem que chamou
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization");

// OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// CONFIGURAÇÃO DE SESSÃO PARA LOCALHOST
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false, // se você não usa HTTPS
    'httponly' => true,
    'samesite' => 'Lax' // coloca Lax para funcionar no localhost
]);


// Inicia a sessão
session_start();

// Debug da sessão
error_log("=== SESSION START ===");
error_log("Session ID: " . session_id());
error_log("Session Name: " . session_name());
error_log("User ID: " . ($_SESSION['user_id'] ?? 'NOT SET'));

// Configuração do banco
define('DB_HOST', 'mysql');
define('DB_NAME', 'todo_pomodoro');
define('DB_USER', 'appuser');
define('DB_PASS', 'apppass');

try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

function respond($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
?>