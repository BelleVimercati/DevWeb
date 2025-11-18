<?php
// essa função confere se a variável de sessão do usuário está definida
require_once 'config.php';

if (isset($_SESSION["user_id"])) {
    respond(["logged" => true, "user_id" => $_SESSION["user_id"]]);
} else {
    respond(["logged" => false]);
}
?>