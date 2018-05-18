<?php


$config = file_get_contents("../config.json");
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
		$fp = fopen('resultado.json', 'w');
		if(fwrite($fp, json_encode($result))!=false){
			fclose($fp);
			echo true;
		}else{
			echo false;
		}
	}else{
		echo false;
	}
}





?>
