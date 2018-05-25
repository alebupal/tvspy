<?php
require_once "../clases/Util.php";
$configuracion = Util::cargarConfiguracion();
echo json_encode($configuracion);
?>
