<?php
	$array = array(
	    "ip" => $_POST["ip"],
	    "puerto" => $_POST["puerto"],
	    "pass" => $_POST["pass"],
	    "usuario" => $_POST["usuario"],
		"refresco" => $_POST["refresco"],
	    "refrescoCron" => $_POST["refrescoCron"],
		"canales" => $_POST["canales"],
		"usuarios" => $_POST["usuarios"],
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
