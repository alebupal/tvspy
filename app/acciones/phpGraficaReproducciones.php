<?php
require_once "../clases/Util.php";
$fechaInicio = $_POST["fechaInicio"];
$fechaFin = $_POST["fechaFin"];
$usuario = $_POST["usuario"];
echo Util::graficaReproducciones($usuario, $fechaInicio, $fechaFin);
?>
