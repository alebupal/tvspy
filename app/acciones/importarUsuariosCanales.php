<?php
require_once "../clases/Constantes.php";
$db = new PDO("mysql:dbname=".Constantes::dbname.";host=".Constantes::servername."",
				Constantes::username,
				Constantes::password,
				array(
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		    		PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
		  		)
			);
try {
	$result = $db->query('TRUNCATE TABLE canales');

	$config = file_get_contents("../config.json");
	$json_config = json_decode($config, true);

	$ipuerto =  $json_config["ip"].":".$json_config["puerto"];

	$urlCanales = "http://".$ipuerto."/api/channel/grid?limit=100000";
	//  Initiate curl
	$chCanales = curl_init();
	// Disable SSL verification
	curl_setopt($chCanales, CURLOPT_SSL_VERIFYPEER, false);
	// Will return the response, if false it print the response
	curl_setopt($chCanales, CURLOPT_RETURNTRANSFER, true);
	// Set the url
	curl_setopt($chCanales, CURLOPT_URL,$urlCanales);


	curl_setopt($chCanales, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($chCanales, CURLOPT_USERPWD, $json_config["usuario"].":".$json_config["pass"]);
	curl_setopt($chCanales, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

	$canales_json=curl_exec($chCanales);

	/* Check for 404 (file not found). */
	$httpCodeCanales = curl_getinfo($chCanales, CURLINFO_HTTP_CODE);
	if($httpCodeCanales == 404) {
		echo 404;
	}else if($httpCodeCanales == 401) {
		echo 401;
	}else{
		// Execute
		// Closing
		curl_close($chCanales);
		$array_canales = json_decode($canales_json, true);
		//var_dump($array_canales["entries"]);
		$itemsCanales = array();
		for ($i=0; $i < count($array_canales["entries"]) ; $i++) {
			$canal = array(
				'nombre' => $array_canales["entries"][$i]["name"],
				'logo' => $array_canales["entries"][$i]["icon_public_url"]
			);
			array_push($itemsCanales,$canal);

		}
		// Prepare INSERT statement to SQLite3 file db
		$insertCanales = "INSERT INTO canales (nombre, logo) VALUES (:nombre, :logo)";
		$statementCanales = $db->prepare($insertCanales);

		// Bind parameters to statement variables
		$statementCanales->bindParam(':nombre', $nombre);
		$statementCanales->bindParam(':logo', $logo);

		//Insert all of the items in the array
		foreach ($itemsCanales as $item) {
			$nombre = $item['nombre'];
			$logo = $item['logo'];
			$statementCanales->execute();
		}

		//Canales insertados ahora usuarios
		$urlUsuarios = "http://".$ipuerto."/api/access/entry/grid";
		//  Initiate curl
		$chUsuarios = curl_init();
		// Disable SSL verification
		curl_setopt($chUsuarios, CURLOPT_SSL_VERIFYPEER, false);
		// Will return the response, if false it print the response
		curl_setopt($chUsuarios, CURLOPT_RETURNTRANSFER, true);
		// Set the url
		curl_setopt($chUsuarios, CURLOPT_URL,$urlUsuarios);


		curl_setopt($chUsuarios, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($chUsuarios, CURLOPT_USERPWD, $json_config["usuario"].":".$json_config["pass"]);
		curl_setopt($chUsuarios, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

		$usuarios_json=curl_exec($chUsuarios);


		$httpCodeUsuarios = curl_getinfo($chUsuarios, CURLINFO_HTTP_CODE);
		if($httpCodeUsuarios == 404) {
			echo 404;
		}else if($httpCodeUsuarios == 401) {
			echo 401;
		}else{
			// Execute
			// Closing
			curl_close($chUsuarios);
			$array_usuarios = json_decode($usuarios_json, true);
			//var_dump($array_canales["entries"]);
			$itemsUsuarios = array();
			for ($i=0; $i < count($array_usuarios["entries"]) ; $i++) {
				$usuario = array(
					'nombre' => $array_usuarios["entries"][$i]["username"]
				);
				array_push($itemsUsuarios,$usuario);

			}
			// Prepare INSERT statement to SQLite3 file db
			$insertUsuarios = "INSERT INTO usuarios (nombre) VALUES (:nombre)";
			$statementUsuarios = $db->prepare($insertUsuarios);

			// Bind parameters to statement variables
			$statementUsuarios->bindParam(':nombre', $nombre);

			//Insert all of the items in the array
			foreach ($itemsUsuarios as $item) {
				$nombre = $item['nombre'];
				$statementUsuarios->execute();
			}
			echo true;
		}
	}

} catch(PDOException $e) {
    echo $e->getMessage();
}
