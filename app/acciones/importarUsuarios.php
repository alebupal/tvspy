<?php
require_once "../clases/Constantes.php";
$db = new PDO("mysql:dbname=".Constantes::dbname.";host=".Constantes::servername."",
				Constantes::username,
				Constantes::password
			);
try {
	$result = $db->query('TRUNCATE TABLE usuarios');

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

		$array = array(
		    "ip" => $_POST["ip"],
		    "puerto" => $_POST["puerto"],
		    "pass" => $_POST["pass"],
		    "usuario" => $_POST["usuario"],
		    "refresco" => $_POST["refresco"],
		    "refrescoCron" => $_POST["refrescoCron"],
		    "canales" => $_POST["canales"],
		    "usuarios" => "true",
			"bot_token" => $_POST["bot_token"],
			"id_chat" => $_POST["id_chat"]
		);
		$json = json_encode($array);
		$fp = fopen('../config.json', 'w');
		if(fwrite($fp,$json)!=false){
			fclose($fp);
			echo true;
		}else{
			echo false;
		}
	}

} catch(PDOException $e) {
    echo $e->getMessage();
}
