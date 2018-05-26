<?php
require_once "../clases/Util.php";
echo Util::testTvheadend($_POST["ip"], $_POST["puerto"], $_POST["usuario"], $_POST["contrasena"]);
?>
