<?php
require_once "../clases/Util.php";
$configuracion = Util::cargarConfiguracion();
$fechaInicio = $_POST["fechaInicio"];
$fechaFin = $_POST["fechaFin"];
$usuario = $_POST["usuario"];
echo Util::graficaCanales($usuario, $fechaInicio, $fechaFin, $configuracion);
?>
