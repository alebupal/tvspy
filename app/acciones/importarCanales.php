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

	$canales_json=curl_exec($ch);
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
		$array_canales = json_decode($canales_json, true);
		//var_dump($array_canales["entries"]);
		$items = array();
		for ($i=0; $i < count($array_canales["entries"]) ; $i++) {
			$canal = array(
				'nombre' => $array_canales["entries"][$i]["name"]
			);
			array_push($items,$canal);

		}
		// Prepare INSERT statement to SQLite3 file db
		$insert = "INSERT INTO canales (nombre) VALUES (:nombre)";
		$statement = $db->prepare($insert);

		// Bind parameters to statement variables
		$statement->bindParam(':nombre', $nombre);

		//Insert all of the items in the array
		foreach ($items as $item) {
			$nombre = $item['nombre'];
			$statement->execute();
		}
		echo true;
	}

} catch(PDOException $e) {
    echo $e->getMessage();
}
