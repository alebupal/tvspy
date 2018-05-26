<?php
require_once "../clases/Util.php";
$configuracion = Util::cargarConfiguracion();
$mensaje = "Mensaje de prueba tvpsy";
Util::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
?>
