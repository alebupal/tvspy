<?php
require_once "../clases/Util.php";
$mensaje = "Mensaje de prueba tvpsy";
Util::enviarTelegram($_POST["bot_token"], $_POST["id_chat"], $mensaje);
?>
