<?php
require_once "../clases/Util.php";
$configuracion = Util::cargarConfiguracion();
var_dump(Util::arrayBonito($configuracion));
//$ruta = "/var/www/html/";
/*require_once $ruta."clases/Constantes.php";
$db = new PDO("mysql:dbname=".Constantes::dbname.";host=".Constantes::servername."",
				Constantes::username,
				Constantes::password,
				array(
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		    		PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
		  		)
			);

$config = file_get_contents($ruta."config.json");
$json_config = json_decode($config, true);

$reproducciones = dameReproducciones($json_config);
var_dump($reproducciones);*/
//Logica reproducciones
/*
if($result!="" || $result != null){
	$fp = fopen($ruta.'acciones/resultado.json', 'w');
	if(fwrite($fp, json_encode($result))!=false){
		fclose($fp);
		$reproducciones  = json_decode($result, true);
		//$canales = json_decode(dameCanales($json_config), true);

		$archivoReproducciones2 = file_get_contents($ruta."acciones/resultado2.json");
		$reproducciones2 = json_decode($archivoReproducciones2, true);
		$reproducciones2 = json_decode($reproducciones2, true);

		if(count($reproducciones["entries"])==0 && count($reproducciones2["entries"])==0){
			//No hay nada ni en resultado.json ni en resultado2.json
			//Ninguna reproducción
			echo fechaActual().": No hay ninguna reproducción\n";
		}else if(count($reproducciones["entries"])==0 && count($reproducciones2["entries"])!=0){
			//No hay nada en resultado.json, pero hay datos en resultado2.json de una reproducción anterior
			//Insertar fecha de que ha terminado de ver la tv al usuario que haya en resultado2 y actualizo resultado2 respecto a resultado1\n
			//Se para una reproducción
			for ($r=0; $r < count($reproducciones2["entries"]); $r++) {
				echo fechaActual().": Se ha parado la reproducción1 ".$reproducciones2["entries"][$r]["id"]."\n";
				actualizoReproduccion($db,$reproducciones2["entries"][$r],$json_config);
			}
			actualizarResultado2($result, $ruta);
		}else if(count($reproducciones["entries"])!=0 && count($reproducciones2["entries"])==0){
			//No hay nada en resultado2.json, pero hay datos en resultado.json de una nueva reproducción
			// Insertamos la nueva produccion de reproducciones y actualizo resultado2 respecto a resultado1
			for ($i=0; $i < count($reproducciones["entries"]) ; $i++) {
				echo fechaActual().": Nueva reproducción1 ".$reproducciones["entries"][$i]["id"]."\n";
				insertarReproduccion($db,$reproducciones["entries"][$i],$json_config);
			}
			actualizarResultado2($result, $ruta);
		}else if(count($reproducciones["entries"])!=0 && count($reproducciones2["entries"])!=0){
			$arrayDiferente = array();
			$arrayDiferente2 = array();
			reset($arrayDiferente);
			reset($arrayDiferente2);
			$arrayDiferente = array_values(array_diff(array_column($reproducciones2["entries"], 'id'), array_column($reproducciones["entries"], 'id')));
			$arrayDiferente2 = array_values(array_diff(array_column($reproducciones["entries"], 'id'), array_column($reproducciones2["entries"], 'id')));
			// echo "ambos tienen<br>";

			echo "<pre>".fechaActual().": ";
			var_dump($arrayDiferente);
			echo " ---- \n ";
			var_dump($arrayDiferente2);
			echo "</pre>\n";

			//ids que estan en resultado2 y hay que actualizar la fecha

			if(count($arrayDiferente)>0){
				for ($i=0; $i < count($arrayDiferente); $i++) {
					for ($r=0; $r < count($reproducciones2["entries"]); $r++) {
						if($arrayDiferente[$i]==$reproducciones2["entries"][$r]["id"]){
							echo fechaActual().": Se ha parado la reproducción2 ".$reproducciones2["entries"][$r]["id"]."\n";
							actualizoReproduccion($db,$reproducciones2["entries"][$r],$json_config);
						}
					}
				}
			}
			//ids que estan en resultado.json y hay que insertar en la bd
			if(count($arrayDiferente2)>0){
				for ($i=0; $i < count($arrayDiferente2); $i++) {
					for ($r=0; $r < count($reproducciones["entries"]); $r++) {
						if($arrayDiferente2[$i]==$reproducciones["entries"][$r]["id"]){
							echo fechaActual().": Nueva reproducción2 ".$reproducciones["entries"][$r]["id"]."\n";
							insertarReproduccion($db,$reproducciones["entries"][$r],$json_config);
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

*/
//Logica tiempo
//notificarTiempo($db, $json_config);


function notificarTiempo($db, $json_config){
	$stmt = $db->prepare("SELECT * FROM registro WHERE fin IS NULL ORDER BY inicio DESC LIMIT 5");
	// Especificamos el fetch mode antes de llamar a fetch()
	$stmt->setFetchMode(PDO::FETCH_ASSOC);
	// Ejecutamos
	$stmt->execute();
	// Mostramos los resultados
	$row = $stmt->fetchAll();
	for ($i=0; $i < count($row) ; $i++) {
		$fecha1 = fechaActual();
		$fecha2 = $row[$i]["inicio"];
		$minutos = (strtotime($fecha1) - strtotime($fecha2))/60;
		if($minutos>$json_config["telegram_tiempo_limite"]){
			echo "envia notificacion a ".$row[$i]["usuario"];
			if($json_config["notificacion_telegram"]!= "false"){
				if($json_config["telegram_tiempo"]!= "false"){
					$mensaje = str_replace("%%usuario%%",$usuario,$row[$i]["usuario"]);
					$mensaje = str_replace("%%canal%%",$row[$i]["canal"],$mensaje);
					$mensaje = str_replace("%%fecha%%",$fecha_actual,$mensaje);
					$mensaje = str_replace("%%reproductor%%",$row[$i]["reproductor"],$mensaje);
					$mensaje = str_replace("%%hostname%%",$row[$i]["hostname"],$mensaje);
					$mensaje = str_replace("%%tiempo%%",$minutos,$mensaje);
					enviarTelegram($json_config["bot_token"], $json_config["id_chat"], $mensaje);
				}
			}
		}
	}
}


function insertarReproduccion($db, $reproducciones, $json_config){
	$statement="";
	$fecha_actual = fechaActual();
	$id = (int)$reproducciones["id"];
	$insert = "INSERT INTO registro (usuario, canal, idReproduccion, inicio) VALUES (:usuario, :canal, :idReproduccion, :inicio)";
	$statement = $db->prepare($insert);
	// Bind parameters to statement variables
	if (isset($reproducciones["username"])) {
		$usuario = $reproducciones["username"];
	}else{
		$usuario = "Sin usuario";
	}

	$statement->bindParam(':usuario', $usuario);
	$statement->bindParam(':canal', $reproducciones["channel"]);
	$statement->bindParam(':idReproduccion', $id);
	$statement->bindParam(':inicio', $fecha_actual);
	//var_dump($reproducciones["id"]);
	$statement->execute();
	$statement->closeCursor();

	if($json_config["notificacion_telegram"]!= "false"){
		if($json_config["telegram_empieza"]!= "false"){
			$mensaje = str_replace("%%usuario%%",$usuario,$json_config["texto_empieza"]);
			$mensaje = str_replace("%%canal%%",$reproducciones["channel"],$mensaje);
			$mensaje = str_replace("%%fecha%%",$fecha_actual,$mensaje);
			$mensaje = str_replace("%%reproductor%%",$reproducciones["title"],$mensaje);
			$mensaje = str_replace("%%hostname%%",$reproducciones["hostname"],$mensaje);
			enviarTelegram($json_config["bot_token"], $json_config["id_chat"], $mensaje);
		}
	}
}
function actualizoReproduccion($db, $reproducciones, $json_config){
	$statement="";
	$fecha_actual = fechaActual();
	$update = "UPDATE registro SET fin = :fechaActual WHERE idReproduccion=:idReproduccion";
	$statement = $db->prepare($update);
	// Bind parameters to statement variables
	$statement->bindParam(':idReproduccion', $reproducciones["id"]);
	$statement->bindParam(':fechaActual', $fecha_actual);

	$statement->execute();
	$statement->closeCursor();

	if($json_config["notificacion_telegram"]!= "false"){
		if (isset($reproducciones["username"])) {
			$usuario = $reproducciones["username"];
		}else{
			$usuario = "Sin usuario";
		}

		if($json_config["telegram_para"]!= "false"){
			$mensaje = str_replace("%%usuario%%",$usuario,$json_config["texto_para"]);
			$mensaje = str_replace("%%canal%%",$reproducciones["channel"],$mensaje);
			$mensaje = str_replace("%%fecha%%",$fecha_actual,$mensaje);
			$mensaje = str_replace("%%reproductor%%",$reproducciones["title"],$mensaje);
			$mensaje = str_replace("%%hostname%%",$reproducciones["hostname"],$mensaje);
			enviarTelegram($json_config["bot_token"], $json_config["id_chat"], $mensaje);
		}
	}

}
function actualizarResultado2($result, $ruta){
	$fp = fopen($ruta.'acciones/resultado2.json', 'w');
	if(fwrite($fp, json_encode($result))!=false){
		fclose($fp);
		echo fechaActual().": resultado.json copiado a resultado2.json\n";
	}
}

function dameCanales($json_config){
	$ipuerto =  $json_config["ip"].":".$json_config["puerto"];
	$url = "http://".$ipuerto."/api/channel/grid?limit=100000";
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
		curl_close($ch);
		echo 404;
		exit;
	}else if($httpCode == 401) {
		curl_close($ch);
		echo 401;
		exit;
	}else{
		curl_close($ch);
		return $result;
	}
}
function dameReproducciones($json_config){
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
		curl_close($ch);
		echo 404;
		exit;
	}else if($httpCode == 401) {
		curl_close($ch);
		echo 401;
		exit;
	}else{
		curl_close($ch);
		return $result;
	}

}
function enviarTelegram($TOKEN, $chat_id, $mensaje){
	$TELEGRAM = "https://api.telegram.org:443/bot".$TOKEN;
	$query = http_build_query([
		'chat_id'=> $chat_id,
		'text'=> $mensaje,
		'parse_mode'=> "HTML",
	]);

	$response = file_get_contents($TELEGRAM."/sendMessage?".$query);
	return $response;
}


?>
