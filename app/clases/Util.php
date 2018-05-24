<?php
/**
 * @author alebupal
 */
class Util{
	public static $servidor= "localhost";
	public static $usuario= "root";
	public static $contrasena = "";
	public static $base_datos = "tvspy";

	static function arrayBonito($array){
		echo '<pre>';
		print_r($array);
		echo '</pre>';
	}
	/*** Base datos ***/
	static function cargarConfiguracion(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
						self::$usuario,
						self::$contrasena,
						array(
							PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
							PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
						)
					);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * from configuracion where id = 1");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		return $stmt->fetch();
	}
	static function guardarConfiguracion($arrayConfiguracion){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
						self::$usuario,
						self::$contrasena,
						array(
							PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
							PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
						)
					);
		// FETCH_ASSOC
		$update = "UPDATE configuracion SET bot_token = :bot_token,
											contrasena = :contrasena,
											ip = :ip,
											refresco = :refresco,
											notificacion_telegram = :notificacion_telegram,
											puerto = :puerto,
											telegram_empieza = :telegram_empieza,
											telegram_para = :telegram_para,
											telegram_tiempo = :telegram_tiempo,
											telegram_tiempo_limite = :telegram_tiempo_limite,
											texto_empieza = :texto_empieza,
											texto_para = :texto_para,
											texto_tiempo = :texto_tiempo,
											usuario = :usuario
										WHERE id=1";
		$stmt = $db->prepare($update);
		// Bind parameters to statement variables
		$stmt->bindParam(':bot_token', $arrayConfiguracion["bot_token"]);
		$stmt->bindParam(':contrasena', $arrayConfiguracion["contrasena"]);
		$stmt->bindParam(':ip', $arrayConfiguracion["ip"]);
		$stmt->bindParam(':refresco', $arrayConfiguracion["refresco"]);
		$stmt->bindParam(':notificacion_telegram', $arrayConfiguracion["notificacion_telegram"]);
		$stmt->bindParam(':puerto', $arrayConfiguracion["puerto"]);
		$stmt->bindParam(':telegram_empieza', $arrayConfiguracion["telegram_empieza"]);
		$stmt->bindParam(':telegram_para', $arrayConfiguracion["telegram_para"]);
		$stmt->bindParam(':telegram_tiempo', $arrayConfiguracion["telegram_tiempo"]);
		$stmt->bindParam(':telegram_tiempo_limite', $arrayConfiguracion["telegram_tiempo_limite"]);
		$stmt->bindParam(':texto_empieza', $arrayConfiguracion["texto_empieza"]);
		$stmt->bindParam(':texto_para', $arrayConfiguracion["texto_para"]);
		$stmt->bindParam(':texto_tiempo', $arrayConfiguracion["texto_tiempo"]);
		$stmt->bindParam(':usuario', $arrayConfiguracion["usuario"]);

		$stmt->execute();
	}
	static function cargarRegistro(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
						self::$usuario,
						self::$contrasena,
						array(
							PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
							PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
						)
					);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * from registro");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		var_dump($stmt->fetch());
		//return $stmt->fetch();
	}
	static function importarCanales(){
		$array_canales = self::canalesAPI();
		if($array_canales == false){
			return false;
		}else{
			$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
				self::$usuario,
				self::$contrasena,
				array(
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
					PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
				)
			);

			$db->query('TRUNCATE TABLE canales');
			// Prepare INSERT statement to SQLite3 file db
			$insert = "INSERT INTO canales (nombre) VALUES (:nombre)";
			$statement = $db->prepare($insert);

			// Bind parameters to statement variables
			$statement->bindParam(':nombre', $nombre);
			$items = array();
			for ($i=0; $i < count($array_canales["entries"]) ; $i++) {
				$canal = array(
					'nombre' => $array_canales["entries"][$i]["name"]
				);
				array_push($items,$canal);
			}
			//Insert all of the items in the array
			foreach ($items as $item) {
				$nombre = $item['nombre'];
				$statement->execute();
			}
			return true;
		}
	}
	static function importarUsuarios(){
		$array_usuarios = self::usuariosAPI();
		if($array_usuarios == false){
			return false;
		}else{
			$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
				self::$usuario,
				self::$contrasena,
				array(
					PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
					PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
				)
			);
			$db->query('TRUNCATE TABLE usuarios');
			// Prepare INSERT statement to SQLite3 file db
			$insert = "INSERT INTO usuarios (nombre) VALUES (:nombre)";
			$statement = $db->prepare($insert);

			// Bind parameters to statement variables
			$statement->bindParam(':nombre', $nombre);
			$items = array();
			for ($i=0; $i < count($array_usuarios["entries"]) ; $i++) {
				$canal = array(
					'nombre' => $array_usuarios["entries"][$i]["username"]
				);
				array_push($items,$canal);
			}
			//Insert all of the items in the array
			foreach ($items as $item) {
				$nombre = $item['nombre'];
				$statement->execute();
			}
			return true;
		}
	}
	/*** API ***/
	function canalesAPI(){
		$configuracion = self::cargarConfiguracion();
		$ipuerto =  $configuracion["ip"].":".$configuracion["puerto"];

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
		curl_setopt($ch, CURLOPT_USERPWD, $configuracion["usuario"].":".$configuracion["contrasena"]);
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

		$respuesta_json=curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$respuesta ="";
		if($httpCode == 404) {
			$respuesta = false;
		}else if($httpCode == 401) {
			$respuesta = false;
		}else{
			$respuesta = json_decode($respuesta_json, true);
		}
		return $respuesta;
	}
	function usuariosAPI(){
		$configuracion = self::cargarConfiguracion();
		$ipuerto =  $configuracion["ip"].":".$configuracion["puerto"];

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
		curl_setopt($ch, CURLOPT_USERPWD, $configuracion["usuario"].":".$configuracion["contrasena"]);
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

		$respuesta_json=curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$respuesta ="";
		if($httpCode == 404) {
			$respuesta = false;
		}else if($httpCode == 401) {
			$respuesta = false;
		}else{
			$respuesta = json_decode($respuesta_json, true);
		}
		return $respuesta;
	}
	/*** Otros ***/
	static function fechaActual(){
		$tz = 'Europe/Madrid';
		$timestamp = time();
		$dt = new DateTime("now", new DateTimeZone($tz)); //first argument "must" be a string
		$dt->setTimestamp($timestamp); //adjust the object to correct timestamp
		return $dt->format('Y-m-d H:i:s');
	}

}
