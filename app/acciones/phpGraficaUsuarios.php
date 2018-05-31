<?php
require_once "../clases/Util.php";
$fechaInicio = $_POST["fechaInicio"];
$fechaFin = $_POST["fechaFin"];
echo Util::graficaUsuarios($fechaInicio, $fechaFin);
?>
