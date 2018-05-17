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
			$reproducciones = json_decode($result, true);
			//var_dump($reproducciones);
			$archivoReproducciones2 = file_get_contents("resultado2.json");
			$reproducciones2 = json_decode($archivoReproducciones2, true);
			$reproducciones2 = json_decode($reproducciones2, true);

			// echo '<pre>';
			// print_r($reproducciones2);
			// print_r($reproducciones);
			// echo '</pre>';
			// echo count($reproducciones);

			if(count($reproducciones["entries"])==0 && count($reproducciones2["entries"])==0){
				//No hay nada ni en resultado.json ni en resultado2.json
				echo "No hacemos nada";
			}else if(count($reproducciones["entries"])==0 && count($reproducciones2["entries"])!=0){
				//No hay nada en resultado.json, pero hay datos en resultado2.json de una reproducción anterior,
				echo "Insertar fecha de que ha terminado de ver la tv al usuario que haya en resultado2 y actualizo resultado2 respecto a resultado1";
			}else if(count($reproducciones["entries"])!=0 && count($reproducciones2["entries"])==0){
				//No hay nada en resultado2.json, pero hay datos en resultado.json de una nueva reproducción
				echo "Insertamos la nueva produccion de reproducciones y actualizo resultado2 respecto a resultado1";
			}else if(count($reproducciones["entries"])!=0 && count($reproducciones2["entries"])!=0){
				//Hay datos en ambos
				for ($i=0; $i < count($reproducciones["entries"]); $i++) {
					for ($r=0; $r < count($reproducciones2["entries"]); $r++) {
						if ($reproducciones["entries"][$r]["username"] == $reproduciones2["entries"][$i]["username"] &&
							$reproducciones["entries"][$r]["channel"] == $reproduciones2["entries"][$i]["channel"]){
							echo "no hacemos nada, ya que sigue la reproducción del mismo usuario en el mismo canal";
						}else if ($reproducciones["entries"][$r]["username"] == $reproduciones2["entries"][$i]["username"] &&
							$reproducciones["entries"][$r]["channel"] != $reproduciones2["entries"][$i]["channel"]){
							echo "Nuevo registro el usuario en otro canal distinto";
						}else if ($reproducciones["entries"][$r]["username"] != $reproduciones2["entries"][$i]["username"]){
							echo "Insertar fecha de que ha terminado de ver la tv";
						}
						echo $reproducciones["entries"][$i]["username"];
						echo $reproducciones["entries"][$i]["channel"];

						echo $reproducciones2["entries"][$r]["username"];
						echo $reproducciones2["entries"][$r]["channel"];
					}
				}
			}
		}else{
			echo false;
		}
	}else{
		echo false;
	}
}





?>
