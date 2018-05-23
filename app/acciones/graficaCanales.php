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
$stmt = $db->prepare("SELECT canal, COUNT(1) as valor FROM registro GROUP BY canal");
// Especificamos el fetch mode antes de llamar a fetch()
$stmt->setFetchMode(PDO::FETCH_ASSOC);
// Ejecutamos
$stmt->execute();
// Mostramos los resultados
$row = $stmt->fetchAll();

$canales  = array();

for ($i=0; $i < count($row); $i++) {
	$canal  = array(
		"canal" => $row[$i]["canal"],
		"valor" => (int) $row[$i]["valor"]
	);
	array_push($canales, $canal);
}
echo json_encode($canales);
?>
