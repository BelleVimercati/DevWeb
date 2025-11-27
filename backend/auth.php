<?php

function require_auth() {

    // ✔ Permite preflight sempre
    if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
        http_response_code(200);
        exit();
    }

    // ✔ Verifica a sessão
    if (empty($_SESSION["user_id"])) {
        http_response_code(401);
        header("Content-Type: application/json");
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
}

function current_user_id() {
    return $_SESSION["user_id"] ?? null;
}