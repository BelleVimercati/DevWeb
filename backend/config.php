<?php
require_once "cors.php";

// Sessão SEM DOMAIN (obrigatório para Docker + localhost)
session_set_cookie_params([
    "lifetime" => 86400,
    "path" => "/",
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

// Debug
error_log("=== SESSION START ===");
error_log("Session ID: " . session_id());
error_log("User ID: " . ($_SESSION["user_id"] ?? "NOT SET"));

define("DB_HOST", "mysql");
define("DB_NAME", "todo_pomodoro");
define("DB_USER", "appuser");
define("DB_PASS", "apppass");

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

function respond($data, $code = 200) {
    http_response_code($code);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($data);
    exit;
}