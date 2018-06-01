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

	if (!isset($_POST["notificacion_telegram"])) {
		$notificacion_telegram = 0;
	}else{
		$notificacion_telegram = 1;
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
		"telegram_empieza" => $telegram_empieza,
		"telegram_para" => $telegram_para,
		"telegram_tiempo" => $telegram_tiempo,
		"telegram_tiempo_limite" => $_POST["telegram_tiempo_limite"],
		"notificacion_telegram" => $notificacion_telegram,
		"bot_token" => $_POST["bot_token"],
		"id_chat" => $_POST["id_chat"],
		"unidadTiempo" => $_POST["unidadTiempo"]
	);
	$configuracion = Util::guardarConfiguracion($arrayConfiguracion);
	echo true;
?>
