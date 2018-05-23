<?php
	if (!isset($_POST["notificacion_telegram"])) {
		$notificacion_telegram = "false";
	}else{
		$notificacion_telegram = "true";		
	}
	$array = array(
	    "ip" => $_POST["ip"],
	    "puerto" => $_POST["puerto"],
	    "pass" => $_POST["pass"],
	    "usuario" => $_POST["usuario"],
		"refresco" => $_POST["refresco"],
	    "texto_empieza" => $_POST["texto_empieza"],
	    "texto_para" => $_POST["texto_para"],
	    "notificacion_telegram" => $notificacion_telegram,
		//"importar" => $_POST["importar"],
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
?>
