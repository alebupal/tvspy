<?php
	$array = array(
	    "ip" => $_POST["ip"],
	    "puerto" => $_POST["puerto"],
	    "pass" => $_POST["pass"],
	    "usuario" => $_POST["usuario"],
		"refresco" => $_POST["refresco"],
	    "refrescoCron" => $_POST["refrescoCron"],
		"importar" => $_POST["importar"],
		"bot_token" => $_POST["bot_token"],
		"id_chat" => $_POST["id_chat"]
	);
	$json = json_encode($array);
	$fp = fopen('../config.json', 'w');
	if(fwrite($fp,$json)!=false){
		fclose($fp);
		//Editamos cron
		$plantillaCron = '../actualizacion_template.sh';
		$cron = '../actualizacion.sh';
		$pid = '../pid.file';
		$contenidoPlantillaCron = file_get_contents($plantillaCron);
		$contenidoPlantillaCron = str_replace("%refrescoCron%",$_POST["refrescoCron"], $contenidoPlantillaCron);
		file_put_contents($cron, $contenidoPlantillaCron);
		//exec('crontab /var/www/html/crontab 2>&1');
		echo exec('kill '.$pid);
		echo exec('/var/www/html/actualizacion.sh & 
		echo $! > /var/www/html/pid.file');
		echo true;
	}else{
		echo false;
	}
?>
