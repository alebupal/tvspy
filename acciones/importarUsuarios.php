<?php

$db = new PDO('sqlite:../bd.db') or die('Unable to open database');

try {
	$result = $db->query('DELETE from usuarios');
	$result = $db->query('UPDATE sqlite_sequence set seq=0 where name="usuarios"');


	$config = file_get_contents("../config.json");
	$json_config = json_decode($config, true);

	$ipuerto =  $json_config["ip"].":".$json_config["puerto"];

	$url = "http://".$ipuerto."/api/access/entry/grid";
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
			$usuario = array(
				'nombre' => $array_canales["entries"][$i]["username"]
			);
			array_push($items,$usuario);

		}
		// Prepare INSERT statement to SQLite3 file db
		$insert = "INSERT INTO usuarios (nombre) VALUES (:nombre)";
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
