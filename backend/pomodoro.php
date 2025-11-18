<?php
require_once 'config.php';
require_once 'auth.php';
require_once 'cors.php';

//autenticação obrigatória
require_auth();
$uid = current_user_id();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Start a session: POST { type: 'focus'|'break' }
if ($method === 'POST') {
    $type = ($input['type'] ?? 'focus') === 'break' ? 'break' : 'focus';
    
    //inicializar o pomodoro
    $started_at = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("INSERT INTO pomodoro_sessions (user_id, started_at, type) VALUES (:uid, :started, :type)");
    $stmt->execute([':uid'=>$uid, ':started'=>$started_at, ':type'=>$type]);
    $id = $pdo->lastInsertId();
    respond(['message'=>'started','id'=>$id,'started_at'=>$started_at], 201);
}

// Stop session: PUT { id }
if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) respond(['error'=>'id required'], 400);

    // get started_at
    $stmt = $pdo->prepare("SELECT started_at FROM pomodoro_sessions WHERE id = :id AND user_id = :uid AND ended_at IS NULL");
    $stmt->execute([':id'=>$id, ':uid'=>$uid]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) respond(['error'=>'session not found or already ended'], 404);

    $ended_at = date('Y-m-d H:i:s');
    $started = new DateTime($row['started_at']);
    $ended = new DateTime($ended_at);
    $duration = $ended->getTimestamp() - $started->getTimestamp();

    $stmt = $pdo->prepare("UPDATE pomodoro_sessions SET ended_at = :ended, duration_seconds = :d WHERE id = :id AND user_id = :uid");
    $stmt->execute([':ended'=>$ended_at, ':d'=>$duration, ':id'=>$id, ':uid'=>$uid]);
    respond(['message'=>'stopped', 'id'=>$id, 'ended_at'=>$ended_at, 'duration_seconds'=>$duration]);
}

// GET list recent sessions
if ($method === 'GET') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $stmt = $pdo->prepare("SELECT id, started_at, ended_at, duration_seconds, type FROM pomodoro_sessions WHERE user_id = :uid ORDER BY started_at DESC LIMIT :limit");
    $stmt->bindValue(':uid', $uid, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    respond(['sessions' => $rows]);
}

respond(['error'=>'method not allowed'], 405);