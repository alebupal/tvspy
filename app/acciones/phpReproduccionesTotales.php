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
$stmt = $db->prepare("SELECT COUNT(*) as total FROM registro");
// Especificamos el fetch mode antes de llamar a fetch()
$stmt->setFetchMode(PDO::FETCH_ASSOC);
// Ejecutamos
$stmt->execute();
// Mostramos los resultados
$row = $stmt->fetch();

echo json_encode($row);
?>
