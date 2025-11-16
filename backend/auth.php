<?php
// auth.php
require_once 'config.php';

function require_auth() {
    if (!isset($_SESSION['user_id'])) {
        respond(['error' => 'Unauthorized'], 401);
    }
}

function current_user_id() {
    return $_SESSION['user_id'] ?? null;
}