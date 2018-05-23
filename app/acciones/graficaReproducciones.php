<?php
$ruta = "../";
require_once $ruta."clases/Constantes.php";
$db = new PDO("mysql:dbname=".Constantes::dbname.";host=".Constantes::servername."",
				Constantes::username,
				Constantes::password,
				array(
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		    		PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
		  		)
			);
// FETCH_ASSOC
$fechaInicio = $_POST["fechaInicio"];
$fechaFin = $_POST["fechaFin"];
$usuario = $_POST["usuario"];
if($usuario=="todos"){	
	$stmt = $db->prepare("SELECT DATE(inicio) fecha, COUNT(DISTINCT canal) valor FROM registro WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) GROUP BY DATE(inicio)");
}else{
	$stmt = $db->prepare("SELECT DATE(inicio) fecha, COUNT(DISTINCT canal) valor FROM registro WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) AND usuario=:usuario GROUP BY DATE(inicio)");	
	$stmt->bindParam(':usuario', $usuario);
}
$stmt->bindParam(':fechaInicio', $fechaInicio);
$stmt->bindParam(':fechaFin', $fechaFin);

$stmt->execute();
$stmt->closeCursor();
// Especificamos el fetch mode antes de llamar a fetch()
$stmt->setFetchMode(PDO::FETCH_ASSOC);
// Ejecutamos
$stmt->execute();
// Mostramos los resultados
$row = $stmt->fetchAll();

$canales  = array();

for ($i=0; $i < count($row); $i++) {
	$canal  = array(
		"fecha" => $row[$i]["inicio"],
		"valor" => (int) $row[$i]["valor"]
	);
	array_push($canales, $canal);
}
echo json_encode($canales);
?>
