<?php
	require_once "../clases/Util.php";
	if (!isset($_POST["telegram_empieza"])) {
		$telegram_empieza = 0;
	}else{
		$telegram_empieza = 1;
	}

	if (!isset($_POST["telegram_para"])) {
		$telegram_para = 0;
	}else{
		$telegram_para = 1;
	}

	if (!isset($_POST["telegram_tiempo"])) {
		$telegram_tiempo = 0;
	}else{
		$telegram_tiempo = 1;
	}

	if (!isset($_POST["telegram_notificacion"])) {
		$telegram_notificacion = 0;
	}else{
		$telegram_notificacion = 1;
	}

	if (!isset($_POST["telegram_conexion"])) {
		$telegram_conexion = 0;
	}else{
		$telegram_conexion = 1;
	}
	
	if (!isset($_POST["telegram_empieza_grabacion"])) {
		$telegram_empieza_grabacion = 0;
	}else{
		$telegram_empieza_grabacion = 1;
	}
	
	if (!isset($_POST["telegram_para_grabacion"])) {
		$telegram_para_grabacion = 0;
	}else{
		$telegram_para_grabacion = 1;
	}

	$cont = 0;
	$ips="";
	foreach ($_POST as $key => $value) {
		if (htmlspecialchars($key) == "ip_".$cont){
			//echo "Field ".htmlspecialchars($key)." is ".htmlspecialchars($value)."<br>";
			$cont++;
			if(trim(htmlspecialchars($value))!=""){
				if($ips==""){
					$ips=htmlspecialchars($value);
				}else{
					$ips.=",".htmlspecialchars($value);
				}
			}
		}
	}
	$arrayConfiguracion = array(
		"ip" => $_POST["ip"],
		"puerto" => $_POST["puerto"],
		"contrasena" => $_POST["contrasena"],
		"usuario" => $_POST["usuario"],
		"refresco" => $_POST["refresco"],
		"tiempoMinimo" => $_POST["tiempoMinimo"],
		"texto_empieza" => $_POST["texto_empieza"],
		"texto_para" => $_POST["texto_para"],
		"texto_tiempo" => $_POST["texto_tiempo"],
		"texto_conexion" => $_POST["texto_conexion"],
		"texto_empieza_grabacion" => $_POST["texto_empieza_grabacion"],
		"texto_para_grabacion" => $_POST["texto_para_grabacion"],
		"telegram_empieza" => $telegram_empieza,
		"telegram_para" => $telegram_para,
		"telegram_tiempo" => $telegram_tiempo,
		"telegram_tiempo_limite" => $_POST["telegram_tiempo_limite"],
		"telegram_conexion" => $telegram_conexion,
		"telegram_notificacion" => $telegram_notificacion,
		"telegram_empieza_grabacion" => $telegram_empieza_grabacion,
		"telegram_para_grabacion" => $telegram_para_grabacion,
		"bot_token" => $_POST["bot_token"],
		"id_chat" => $_POST["id_chat"],
		"unidadTiempo" => $_POST["unidadTiempo"],
		"ip_permitida" => $ips
	);
	$configuracion = Util::guardarConfiguracion($arrayConfiguracion);
	echo true;
?>
