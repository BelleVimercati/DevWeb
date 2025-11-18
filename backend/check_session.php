<?php
// check_session.php
require_once 'config.php';

if (isset($_SESSION["user_id"])) {
    respond(["logged" => true, "user_id" => $_SESSION["user_id"]]);
} else {
    respond(["logged" => false]);
}
?>