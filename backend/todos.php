<?php
// todos.php
require_once 'config.php';
require_once 'auth.php';
require_once 'cors.php';

require_auth();

$uid = current_user_id();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // get all todos for user
    $stmt = $pdo->prepare("SELECT id, title, description, is_done, created_at, updated_at FROM todos WHERE user_id = :uid ORDER BY created_at DESC");
    $stmt->execute([':uid' => $uid]);
    $todos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    respond(['todos' => $todos]);
}

$input = json_decode(file_get_contents('php://input'), true);

// CREATE
if ($method === 'POST') {
    $title = trim($input['title'] ?? '');
    $description = $input['description'] ?? null;
    if (!$title) respond(['error' => 'title required'], 400);
    $stmt = $pdo->prepare("INSERT INTO todos (user_id, title, description) VALUES (:uid, :title, :desc)");
    $stmt->execute([':uid'=>$uid, ':title'=>$title, ':desc'=>$description]);
    $id = $pdo->lastInsertId();
    respond(['message'=>'created','id'=>$id], 201);
}

// UPDATE (toggle or edit). We accept PUT with JSON {id, title?, description?, is_done?}
if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) respond(['error'=>'id required'], 400);
    // only update provided fields
    $fields = [];
    $params = [':id'=>$id, ':uid'=>$uid];
    if (isset($input['title'])) { $fields[] = "title = :title"; $params[':title'] = $input['title']; }
    if (array_key_exists('description', $input)) { $fields[] = "description = :description"; $params[':description'] = $input['description']; }
    if (isset($input['is_done'])) { $fields[] = "is_done = :is_done"; $params[':is_done'] = $input['is_done'] ? 1 : 0; }
    if (empty($fields)) respond(['error'=>'no fields to update'], 400);

    $fields[] = "updated_at = NOW()";
    $sql = "UPDATE todos SET " . implode(',', $fields) . " WHERE id = :id AND user_id = :uid";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    respond(['message'=>'updated']);
}

// DELETE (expects JSON {id})
if ($method === 'DELETE') {
    $id = (int)($input['id'] ?? 0);
    if (!$id) respond(['error'=>'id required'], 400);
    $stmt = $pdo->prepare("DELETE FROM todos WHERE id = :id AND user_id = :uid");
    $stmt->execute([':id'=>$id, ':uid'=>$uid]);
    respond(['message'=>'deleted']);
}

// else
respond(['error'=>'method not allowed'], 405);