<?php
require_once "../clases/Util.php";
$configuracion = Util::cargarConfiguracion();
$fechaInicio = $_POST["fechaInicio"];
$fechaFin = $_POST["fechaFin"];
echo Util::graficaConexion($fechaInicio, $fechaFin, $configuracion);
?>
