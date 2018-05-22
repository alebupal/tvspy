<?php
$ruta = "/var/www/html/";
require_once $ruta."clases/Constantes.php";
$db = new PDO("mysql:dbname=".Constantes::dbname.";host=".Constantes::servername."",
				Constantes::username,
				Constantes::password,
				array(
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		    		PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
		  		)
			);

$config = file_get_contents($ruta."config.json");
$json_config = json_decode($config, true);

$ipuerto =  $json_config["ip"].":".$json_config["puerto"];

$url = "http://".$ipuerto."/api/status/subscriptions";
//  Initiate curl
$ch = curl_init();
// Disable SSL verification
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
// Will return the response, if false it print the response
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// Set the url
curl_setopt($ch, CURLOPT_URL,$url);


curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $json_config["usuario"].":".$json_config["pass"]);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

$result=curl_exec($ch);
/* Check for 404 (file not found). */
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if($httpCode == 404) {
	echo 404;
}else if($httpCode == 401) {
	echo 401;
}else{
	// Execute
	// Closing
	curl_close($ch);
	if($result!="" || $result != null){
		$fp = fopen($ruta.'acciones/resultado.json', 'w');
		if(fwrite($fp, json_encode($result))!=false){
			fclose($fp);
			$reproducciones = json_decode($result, true);
			//var_dump($reproducciones);
			$archivoReproducciones2 = file_get_contents($ruta."acciones/resultado2.json");
			$reproducciones2 = json_decode($archivoReproducciones2, true);
			$reproducciones2 = json_decode($reproducciones2, true);

			// echo '<pre>';
			// print_r($reproducciones2);
			// print_r($reproducciones);
			// echo '</pre>';
			// echo count($reproducciones);

			if(count($reproducciones["entries"])==0 && count($reproducciones2["entries"])==0){
				//No hay nada ni en resultado.json ni en resultado2.json
				echo fechaActual().": No hacemos nada\n";
			}else if(count($reproducciones["entries"])==0 && count($reproducciones2["entries"])!=0){
				//No hay nada en resultado.json, pero hay datos en resultado2.json de una reproducción anterior,
				echo fechaActual().": Insertar fecha de que ha terminado de ver la tv al usuario que haya en resultado2 y actualizo resultado2 respecto a resultado1\n";

				for ($r=0; $r < count($reproducciones2["entries"]); $r++) {
					actualizoReproduccion($db,$reproducciones2["entries"][$r]["id"]);
				}
				actualizarResultado2($result, $ruta);
			}else if(count($reproducciones["entries"])!=0 && count($reproducciones2["entries"])==0){
				//No hay nada en resultado2.json, pero hay datos en resultado.json de una nueva reproducción
				echo fechaActual().": Insertamos la nueva produccion de reproducciones y actualizo resultado2 respecto a resultado1\n";
				for ($i=0; $i < count($reproducciones["entries"]) ; $i++) {
					insertarReproduccion($db,$reproducciones["entries"][$i]);
				}
				actualizarResultado2($result, $ruta);


			}else if(count($reproducciones["entries"])!=0 && count($reproducciones2["entries"])!=0){
				$arrayDiferente = array();
				$arrayDiferente2 = array();
				reset($arrayDiferente);
				reset($arrayDiferente2);
				$arrayDiferente = array_diff(array_column($reproducciones2["entries"], 'id'), array_column($reproducciones["entries"], 'id'));
				$arrayDiferente2 = array_diff(array_column($reproducciones["entries"], 'id'), array_column($reproducciones2["entries"], 'id'));
				// echo "ambos tienen<br>";
				echo fechaActual().": <pre>";
				var_dump($arrayDiferente);
				echo " - ";
				var_dump($arrayDiferente2);
				echo "</pre>\n";
				//ids que estan en resultado2 y hay que actualizar la fecha
				if(count($arrayDiferente)>0){
					for ($i=0; $i < count($arrayDiferente); $i++) {
						for ($r=0; $r < count($reproducciones2["entries"]); $r++) {
							var_dump($arrayDiferente[$i]);
							var_dump($reproducciones2["entries"][$r]["id"]);
							echo"--";
							if($arrayDiferente[$i]==$reproducciones2["entries"][$r]["id"]){
								echo fechaActual().": Igual, updatea\n";
								actualizoReproduccion($db,$reproducciones2["entries"][$r]["id"]);
							}
						}
					}
				}

				//ids que estan en resultado.json y hay que insertar en la bd
				if(count($arrayDiferente2)>0){
					for ($i=0; $i < count($arrayDiferente2); $i++) {
						for ($r=0; $r < count($reproducciones["entries"]); $r++) {
							if($arrayDiferente2[$i]==$reproducciones["entries"][$r]["id"]){
								echo fechaActual().": Igual, inserta\n";
								insertarReproduccion($db,$reproducciones["entries"][$i]);
							}
						}
					}
				}
				actualizarResultado2($result, $ruta);
			}
		}else{
			echo false;
		}
	}else{
		echo false;
	}
}

function insertarReproduccion($db, $reproducciones){
	$statement="";
	$id = (int)$reproducciones["id"];
	$insert = "INSERT INTO registro (usuario, canal, idReproduccion) VALUES (:usuario, :canal, :idReproduccion)";
	$statement = $db->prepare($insert);
	// Bind parameters to statement variables
	$statement->bindParam(':usuario', $reproducciones["username"]);
	$statement->bindParam(':canal', $reproducciones["channel"]);
	$statement->bindParam(':idReproduccion', $id);
	//var_dump($reproducciones["id"]);
	$statement->execute();

}
function actualizoReproduccion($db, $idReproduccion){
	$statement="";

	$update = "UPDATE registro SET fin = now() WHERE idReproduccion=:idReproduccion";
	$statement = $db->prepare($update);
	// Bind parameters to statement variables
	$statement->bindParam(':idReproduccion', $idReproduccion);

	$statement->execute();

}
function actualizarResultado2($result, $ruta){
	$fp = fopen($ruta.'acciones/resultado2.json', 'w');
	if(fwrite($fp, json_encode($result))!=false){
		fclose($fp);
		echo fechaActual().": resultado.json copiado a resultado2.json\n";
	}
}
function fechaActual(){
	$tz = 'Europe/Madrid';
	$timestamp = time();
	$dt = new DateTime("now", new DateTimeZone($tz)); //first argument "must" be a string
	$dt->setTimestamp($timestamp); //adjust the object to correct timestamp
	return $dt->format('Y-m-d H:i:s');
}

?>
