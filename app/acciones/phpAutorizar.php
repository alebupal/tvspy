<?php
$ruta = "../";
$config = file_get_contents($ruta."config.json");
$json_config = json_decode($config, true);
dameReproducciones($json_config);
function dameReproducciones($json_config){
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
		echo "true";
		exit;
	}
}


?>
