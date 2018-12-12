<?php
/**
 * @author alebupal
 */
class Util{
	public static $servidor= "localhost";
	public static $usuarioBD= "root";
	public static $contrasenaBD = "";
	public static $base_datos = "tvspy";

	static function arrayBonito($array){
		echo '<pre>';
		print_r($array);
		echo '</pre>';
	}
	/*** Base datos ***/
	static function cargarConfiguracion(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
						self::$usuarioBD,
						self::$contrasenaBD,
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
						self::$usuarioBD,
						self::$contrasenaBD,
						array(
							PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
							PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
						)
					);
		// FETCH_ASSOC
		$update = "UPDATE configuracion SET
											ip = :ip,
											puerto = :puerto,
											usuario = :usuario,
											contrasena = :contrasena,
											refresco = :refresco,
											tiempoMinimo = :tiempoMinimo,
											telegram_notificacion = :telegram_notificacion,
											telegram_empieza = :telegram_empieza,
											telegram_para = :telegram_para,
											telegram_tiempo = :telegram_tiempo,
											telegram_tiempo_limite = :telegram_tiempo_limite,
											telegram_conexion = :telegram_conexion,
											telegram_empieza_grabacion = :telegram_empieza_grabacion,
											telegram_para_grabacion = :telegram_para_grabacion,
											texto_empieza = :texto_empieza,
											texto_para = :texto_para,
											texto_tiempo = :texto_tiempo,
											texto_conexion = :texto_conexion,
											texto_empieza_grabacion = :texto_empieza_grabacion,
											texto_para_grabacion = :texto_para_grabacion,
											bot_token = :bot_token,
											id_chat = :id_chat,
											unidadTiempo = :unidadTiempo,
											ip_permitida = :ip_permitida
										WHERE id=1";
		$stmt = $db->prepare($update);
		// Bind parameters to statement variables
		$stmt->bindParam(':ip', $arrayConfiguracion["ip"]);
		$stmt->bindParam(':puerto', $arrayConfiguracion["puerto"]);
		$stmt->bindParam(':usuario', $arrayConfiguracion["usuario"]);
		$stmt->bindParam(':contrasena', $arrayConfiguracion["contrasena"]);
		$stmt->bindParam(':refresco', $arrayConfiguracion["refresco"]);
		$stmt->bindParam(':tiempoMinimo', $arrayConfiguracion["tiempoMinimo"]);
		$stmt->bindParam(':telegram_notificacion', $arrayConfiguracion["telegram_notificacion"]);
		$stmt->bindParam(':telegram_empieza', $arrayConfiguracion["telegram_empieza"]);
		$stmt->bindParam(':telegram_para', $arrayConfiguracion["telegram_para"]);
		$stmt->bindParam(':telegram_tiempo', $arrayConfiguracion["telegram_tiempo"]);
		$stmt->bindParam(':telegram_tiempo_limite', $arrayConfiguracion["telegram_tiempo_limite"]);
		$stmt->bindParam(':telegram_conexion', $arrayConfiguracion["telegram_conexion"]);
		$stmt->bindParam(':telegram_empieza_grabacion', $arrayConfiguracion["telegram_empieza_grabacion"]);
		$stmt->bindParam(':telegram_para_grabacion', $arrayConfiguracion["telegram_para_grabacion"]);
		$stmt->bindParam(':texto_empieza', $arrayConfiguracion["texto_empieza"]);
		$stmt->bindParam(':texto_para', $arrayConfiguracion["texto_para"]);
		$stmt->bindParam(':texto_tiempo', $arrayConfiguracion["texto_tiempo"]);
		$stmt->bindParam(':texto_conexion', $arrayConfiguracion["texto_conexion"]);
		$stmt->bindParam(':texto_empieza_grabacion', $arrayConfiguracion["texto_empieza_grabacion"]);
		$stmt->bindParam(':texto_para_grabacion', $arrayConfiguracion["texto_para_grabacion"]);
		$stmt->bindParam(':bot_token', $arrayConfiguracion["bot_token"]);
		$stmt->bindParam(':id_chat', $arrayConfiguracion["id_chat"]);
		$stmt->bindParam(':unidadTiempo', $arrayConfiguracion["unidadTiempo"]);
		$stmt->bindParam(':ip_permitida', $arrayConfiguracion["ip_permitida"]);

		$stmt->execute();
	}
	static function cargarRegistro(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
						self::$usuarioBD,
						self::$contrasenaBD,
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
		if($array_canales == 404){
			echo $array_canales;
		}else if($array_canales == 401){
			echo $array_canales;
		}else{
			$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
				self::$usuarioBD,
				self::$contrasenaBD,
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
		if($array_usuarios == 404){
			echo $array_usuarios;
		}else if($array_usuarios == 401){
			echo $array_usuarios;
		}else{

			$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
				self::$usuarioBD,
				self::$contrasenaBD,
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

	static function ultimasReproducciones(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * FROM registro ORDER BY inicio DESC LIMIT 5");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();
		echo json_encode($row);

	}
	static function ultimasFinalizaciones(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * FROM registro WHERE fin IS NOT NULL ORDER BY fin DESC LIMIT 5");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();
		echo json_encode($row);
	}
	static function reproduccionesTotales(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT COUNT(*) as total FROM registro");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetch();
		echo json_encode($row);
	}
	static function canalActivo(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT registro.canal, sum(tiempo) as tiempoTotal, COUNT(1) AS total FROM registro GROUP BY registro.canal HAVING COUNT(1) > 1 ORDER BY tiempoTotal DESC LIMIT 1");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetch();
		echo json_encode($row);
	}
	static function usuarioActivo(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT registro.usuario, sum(tiempo) as tiempoTotal, COUNT(1) AS total FROM registro GROUP BY registro.usuario HAVING COUNT(1) > 1 ORDER BY tiempoTotal DESC LIMIT 1");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetch();
		echo json_encode($row);
	}
	static function reproduccionesActivas(){
		echo json_encode(self::reproduccionesActivasAPI());
	}

	static function usuarios(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * from usuarios");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();
		echo json_encode($row);
	}
	static function graficaCanales($fechaInicio, $fechaFin, $configuracion){
		$fechaInicio = $fechaInicio." 00:00:00";
		$fechaFin = $fechaFin." 23:59:59";
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT canal, sum(tiempo) as tiempoTotal, COUNT(*) as totalCanales FROM registro  WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) GROUP BY canal ORDER BY tiempoTotal DESC");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$stmt->bindParam(':fechaInicio', $fechaInicio);
		$stmt->bindParam(':fechaFin', $fechaFin);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();

		$divisionTiempo=1;
		if($configuracion["unidadTiempo"]=="Horas"){
			$divisionTiempo = 3600;
		}else if($configuracion["unidadTiempo"]=="Minutos"){
			$divisionTiempo = 60;
		}else if($configuracion["unidadTiempo"]=="Segundos"){
			$divisionTiempo = 1;
		}

		$array  = array();
		for ($i=0; $i < count($row); $i++) {
			$tiempo = $row[$i]["tiempoTotal"]/$divisionTiempo;
			$item  = array(
				"canal" => $row[$i]["canal"],
				"valor" => (int) $tiempo
			);
			array_push($array, $item);
		}
		echo json_encode($array);
	}
	static function graficaUsuarios($fechaInicio, $fechaFin, $configuracion){
		$fechaInicio = $fechaInicio." 00:00:00";
		$fechaFin = $fechaFin." 23:59:59";
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT usuario, sum(tiempo) as tiempoTotal, COUNT(*) as totalUsuarios FROM registro  WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) GROUP BY usuario ORDER BY tiempoTotal DESC");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$stmt->bindParam(':fechaInicio', $fechaInicio);
		$stmt->bindParam(':fechaFin', $fechaFin);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();

		$divisionTiempo=1;
		if($configuracion["unidadTiempo"]=="Horas"){
			$divisionTiempo = 3600;
		}else if($configuracion["unidadTiempo"]=="Minutos"){
			$divisionTiempo = 60;
		}else if($configuracion["unidadTiempo"]=="Segundos"){
			$divisionTiempo = 1;
		}

		$array  = array();
		for ($i=0; $i < count($row); $i++) {
			$tiempo = $row[$i]["tiempoTotal"]/$divisionTiempo;
			$item  = array(
				"usuario" => $row[$i]["usuario"],
				"valor" => (int) $tiempo
			);
			array_push($array, $item);
		}
		echo json_encode($array);
	}
	static function graficaReproducciones($usuario, $fechaInicio, $fechaFin, $configuracion){
		$fechaInicio = $fechaInicio." 00:00:00";
		$fechaFin = $fechaFin." 23:59:59";
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		if($usuario=="todos"){
			$stmt = $db->prepare("SELECT DATE(inicio) fecha, sum(tiempo) as tiempoTotal, COUNT(DISTINCT canal) valor FROM registro WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) GROUP BY DATE(inicio)");
		}else{
			$stmt = $db->prepare("SELECT DATE(inicio) fecha, sum(tiempo) as tiempoTotal, COUNT(DISTINCT canal) valor FROM registro WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) AND usuario=:usuario GROUP BY DATE(inicio)");
			$stmt->bindParam(':usuario', $usuario);
		}
		$stmt->bindParam(':fechaInicio', $fechaInicio);
		$stmt->bindParam(':fechaFin', $fechaFin);

		$stmt->execute();
		$stmt->closeCursor();
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();

		$divisionTiempo=1;
		if($configuracion["unidadTiempo"]=="Horas"){
			$divisionTiempo = 3600;
		}else if($configuracion["unidadTiempo"]=="Minutos"){
			$divisionTiempo = 60;
		}else if($configuracion["unidadTiempo"]=="Segundos"){
			$divisionTiempo = 1;
		}

		$array  = array();
		for ($i=0; $i < count($row); $i++) {
			$tiempo = $row[$i]["tiempoTotal"]/$divisionTiempo;
			$item  = array(
				"fecha" => $row[$i]["fecha"],
				"valor" => (int) $tiempo
			);
			array_push($array, $item);
		}
		echo json_encode($array);
	}
	static function graficaConexion($fechaInicio, $fechaFin, $configuracion){
		$fechaInicio = $fechaInicio." 00:00:00";
		$fechaFin = $fechaFin." 23:59:59";
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);


		$stmt = $db->prepare("SELECT DATE(inicio) fecha, COUNT(hostname) conexion, hostname FROM registro WHERE (inicio BETWEEN :fechaInicio AND :fechaFin) and hostname GROUP BY DATE(inicio), hostname");
		$stmt->bindParam(':fechaInicio', $fechaInicio);
		$stmt->bindParam(':fechaFin', $fechaFin);
		$stmt->bindParam(':fechaFin', $fechaFin);

		$stmt->execute();
		$stmt->closeCursor();
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row= $stmt->fetchAll();
		//var_dump($row);
		if($configuracion["ip_permitida"]!=""){
			$ips = self::separar_comas($configuracion["ip_permitida"]);

			$arrayPermitidas = array();
			for ($r=0; $r < count($row); $r++) {
				$permitida = "no";
				for ($i = 0; $i < sizeof($ips); $i++) {
					$ip = self::partirIP($row[$r]["hostname"]);
					if($ips[$i]==$ip || $ip==""){
						$permitida = "si";
					}
				}
				if($permitida == "si"){
					$item  = array(
						"fecha" => $row[$r]["fecha"],
						"tipo" => "Permitida",
						"ip" => $row[$r]["hostname"],
						"valor" => (int) $row[$r]["conexion"]
					);
					array_push($arrayPermitidas, $item);
				}
			}

			$arrayNoPermitidas = array();
			for ($r=0; $r < count($row); $r++) {
				$permitida = "no";
				//echo"hola";
				for ($i = 0; $i < sizeof($ips); $i++) {
					$ip = self::partirIP($row[$r]["hostname"]);
					if($ips[$i]==$ip || $ip==""){
						$permitida = "si";
					}
				}
				if ($permitida == "no"){
					$item  = array(
						"fecha" => $row[$r]["fecha"],
						"tipo" => "No permitida",
						"ip" => $row[$r]["hostname"],
						"valor" => (int) $row[$r]["conexion"]
					);
					array_push($arrayNoPermitidas, $item);
				}
			}

			$arrayPermitidas = array_values(self::dameSumaConexionesFecha($arrayPermitidas));
			$arrayNoPermitidas = array_values(self::dameSumaConexionesFecha($arrayNoPermitidas));

			$array_resultante= array_merge($arrayPermitidas,$arrayNoPermitidas);
			usort($array_resultante, function( $a, $b ) {
				return strtotime($a["fecha"]) - strtotime($b["fecha"]);
			});
			echo json_encode($array_resultante);
		}else{
			$arrayPermitidas = array();
			//var_dump($row);
			for ($r=0; $r < count($row); $r++) {
				$item  = array(
					"fecha" => $row[$r]["fecha"],
					"tipo" => "Permitida",
					"ip" => $row[$r]["hostname"],
					"valor" => (int) $row[$r]["conexion"]
				);
				array_push($arrayPermitidas, $item);
			}
			$arrayPermitidas = array_values(self::dameSumaConexionesFecha($arrayPermitidas));
			usort($arrayPermitidas, function( $a, $b ) {
				return strtotime($a["fecha"]) - strtotime($b["fecha"]);
			});
			echo json_encode($arrayPermitidas);
		}
	}
	static function dameSumaConexionesFecha($data) {
		$groups = array();
		foreach ($data as $item) {
			$key = $item['fecha'];
			if (!array_key_exists($key, $groups)) {
				$groups[$key] = array(
					'fecha' => $item['fecha'],
					'tipo' => $item['tipo'],
					'ip' => $item['ip'],
					'valor' => $item['valor']
				);
			}
		}
		return $groups;
	}
	static function obtenerReproduccionesBD(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * FROM registro");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();
		return $row;
	}
	static function reproduccionesBDFin(){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		// FETCH_ASSOC
		$stmt = $db->prepare("SELECT * FROM registro where fin IS NULL");
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetchAll();
		return $row;
	}
	static function obtenerReproduccionesActivas(){
		return self::reproduccionesActivasAPI();
	}
	static function obtenerReproduccion($idReproduccion){
		$id = $idReproduccion;
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		$stmt = $db->prepare("SELECT * FROM registro WHERE idReproduccion = :idReproduccion");

		$stmt->bindParam(':idReproduccion', $id);

		$stmt->execute();
		$stmt->closeCursor();
		// Especificamos el fetch mode antes de llamar a fetch()
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		// Ejecutamos
		$stmt->execute();
		// Mostramos los resultados
		$row = $stmt->fetch();
		return $row;
	}
	static function insertarReproduccion($reproduccion, $configuracion){
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		$id = $reproduccion["id"];
		$insert = "INSERT INTO registro (usuario, canal, idReproduccion, inicio, hostname, reproductor, errores) VALUES (:usuario, :canal, :idReproduccion, :inicio, :hostname, :reproductor, :errores)";
		$statement = $db->prepare($insert);
		// Bind parameters to statement variables
		if (isset($reproduccion["username"])) {
			$usuario = $reproduccion["username"];
		}else{
			$usuario = "Sin usuario";
		}
		if (isset($reproduccion["hostname"])) {
			$hostname = $reproduccion["hostname"];
		}else{
			$hostname = "localhost";
		}
		if(strpos($reproduccion["title"], 'DVR:') !== false) {
			//Es grabación
			$title = str_replace("DVR:","Grabando:",$reproduccion["title"]);
		}else{
			$title = $reproduccion["title"];
		}
		$fechaInicio = date_format(date_timestamp_set(new DateTime(), $reproduccion["start"]), 'Y-m-d H:i:s');
		$statement->bindParam(':usuario', $usuario);
		$statement->bindParam(':canal', $reproduccion["channel"]);
		$statement->bindParam(':idReproduccion', $id);
		$statement->bindParam(':inicio', $fechaInicio);
		$statement->bindParam(':hostname', $hostname);
		$statement->bindParam(':reproductor', $title);
		$statement->bindParam(':errores', $reproduccion["errors"]);
		$statement->execute();
		$statement->closeCursor();
		if((int)$configuracion["telegram_notificacion"]!= 0){
			if((int)$configuracion["telegram_empieza"]!= 0){
				if((int)$configuracion["telegram_conexion"]!= 0){
					if(self::comprobarIP($configuracion["ip_permitida"], $hostname)=="no"){
							echo "empieza reproduccion no permitida";
							$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_conexion"]);
							$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
							$mensaje = str_replace("%%fecha%%",$fechaInicio,$mensaje);
							$mensaje = str_replace("%%reproductor%%",$reproduccion["title"],$mensaje);
							$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
							self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
					}else{
						if(strpos($reproduccion["title"], 'DVR:') !== 0) {
							//No es grabación
							echo "empieza reproduccion";
							$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_empieza"]);
							$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
							$mensaje = str_replace("%%fecha%%",$fechaInicio,$mensaje);
							$mensaje = str_replace("%%reproductor%%",$reproduccion["title"],$mensaje);
							$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
							self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
						}else{
							$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_empieza_grabacion"]);
							$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
							$mensaje = str_replace("%%fecha%%",$fechaInicio,$mensaje);
							$mensaje = str_replace("%%programa%%",str_replace("Grabando:","",$reproduccion["title"]),$mensaje);
							$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
							//echo $configuracion["texto_empieza_grabacion"];
							//var_dump($mensaje);
							self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
						}
					}
				}else{
					if (strpos($reproduccion["title"], 'DVR:') !== false) {
						//No es grabación
						//echo "empieza reproduccion";
						$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_empieza"]);
						$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
						$mensaje = str_replace("%%fecha%%",$fechaInicio,$mensaje);
						$mensaje = str_replace("%%reproductor%%",$reproduccion["title"],$mensaje);
						$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
						self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
					}
				}
			}elseif((int)$configuracion["telegram_conexion"]!= 0){
				if(self::comprobarIP($configuracion["ip_permitida"], $hostname)=="no"){
					//echo "empieza reproduccion no Permitida";
					$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_conexion"]);
					$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
					$mensaje = str_replace("%%fecha%%",$fechaInicio,$mensaje);
					$mensaje = str_replace("%%programa%%",str_replace("Grabando:","",$title),$mensaje);
					$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
					self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
				}
			}elseif((int)$configuracion["telegram_empieza_grabacion"]!= 0){
				//echo"empieza grabacion";
				if(strpos($reproduccion["title"], 'DVR:') !== false) {
					//Es grabación
					$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_empieza_grabacion"]);
					$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
					$mensaje = str_replace("%%fecha%%",$fechaInicio,$mensaje);
					$mensaje = str_replace("%%programa%%",str_replace("Grabando:","",$title),$mensaje);
					$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
					//echo $configuracion["texto_empieza_grabacion"];
					//var_dump($mensaje);
					self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
				}
			}

		}
	}
	static function actualizarTiempoReproduccion($reproduccion, $configuracion, $errores){
		$inicio = $reproduccion["inicio"];
		$fechaActual =  self::fechaActual();
		$segundos = (strtotime($fechaActual) - strtotime($inicio));
		$minutos = (strtotime($fechaActual) - strtotime($inicio))/60;

		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		$update = "UPDATE registro SET tiempo=:tiempo, errores=:errores WHERE idReproduccion=:idReproduccion";
		$statement = $db->prepare($update);
		// Bind parameters to statement variables
		$statement->bindParam(':idReproduccion', $reproduccion["idReproduccion"]);
		$statement->bindParam(':tiempo', $segundos);
		$statement->bindParam(':errores', $errores);

		$statement->execute();
		$statement->closeCursor();
		if(strpos($reproduccion["reproductor"], 'DVR:') === 0) {
			//No es grabación
			if((int)$reproduccion["notificacion_tiempo"]== 0){
				if((int)$configuracion["telegram_notificacion"]!= 0){
					if((int)$configuracion["telegram_tiempo"]!= 0){
						if((int)$minutos>$configuracion["telegram_tiempo_limite"]){
							if (isset($reproduccion["hostname"])) {
								$hostname = $reproduccion["hostname"];
							}else{
								$hostname = "localhost";
							}
							$mensaje = str_replace("%%usuario%%",$reproduccion["usuario"],$configuracion["texto_tiempo"]);
							$mensaje = str_replace("%%canal%%",$reproduccion["canal"],$mensaje);
							$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
							$mensaje = str_replace("%%reproductor%%",$reproduccion["reproductor"],$mensaje);
							$mensaje = str_replace("%%hostname%%",$hostname,$mensaje);
							$mensaje = str_replace("%%tiempo%%",round($minutos)." minutos",$mensaje);
							self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
							self::actualizarTelegramTiempoLimite($reproduccion, $configuracion);
						}
					}
				}
			}
		}

	}
	static function actualizarTelegramTiempoLimite($reproduccion, $configuracion){
		$estado = true;
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		$update = "UPDATE registro SET notificacion_tiempo = :notificacion_tiempo WHERE idReproduccion=:idReproduccion";
		$statement = $db->prepare($update);
		// Bind parameters to statement variables
		$statement->bindParam(':idReproduccion', $reproduccion["idReproduccion"]);
		$statement->bindParam(':notificacion_tiempo', $estado);

		$statement->execute();
		$statement->closeCursor();

	}
	static function actualizarFechaFinReproduccion($reproduccion,$configuracion){
		$inicio = $reproduccion["inicio"];
		$fechaActual =  self::fechaActual();
		$segundos = (strtotime($fechaActual) - strtotime($inicio));

		$fechaActual = self::fechaActual();
		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		$update = "UPDATE registro SET fin = :fin, tiempo = :tiempo WHERE idReproduccion=:idReproduccion";
		$statement = $db->prepare($update);
		// Bind parameters to statement variables
		$statement->bindParam(':idReproduccion',$reproduccion["idReproduccion"]);
		$statement->bindParam(':fin', $fechaActual);
		$statement->bindParam(':tiempo', $segundos);

		$statement->execute();
		$statement->closeCursor();

		if((int)$configuracion["telegram_notificacion"]!= 0){
			if((int)$configuracion["telegram_para"]!= 0){
				if(strpos($reproduccion["reproductor"], 'Grabando:') !== 0) {
					//No es grabacion
					$mensaje = str_replace("%%usuario%%",$reproduccion["usuario"],$configuracion["texto_para"]);
					$mensaje = str_replace("%%canal%%",$reproduccion["canal"],$mensaje);
					$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
					$mensaje = str_replace("%%reproductor%%",$reproduccion["reproductor"],$mensaje);
					$mensaje = str_replace("%%hostname%%",$reproduccion["hostname"],$mensaje);
					self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
				}elseif(strpos($reproduccion["reproductor"], 'Grabando:') !== false){
					//Es grabación
					$mensaje = str_replace("%%usuario%%",$reproduccion["usuario"],$configuracion["texto_para_grabacion"]);
					$mensaje = str_replace("%%canal%%",$reproduccion["canal"],$mensaje);
					$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
					$mensaje = str_replace("%%programa%%",str_replace("Grabando:","",$reproduccion["reproductor"]),$mensaje);
					$mensaje = str_replace("%%hostname%%",$reproduccion["hostname"],$mensaje);
					self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);

				}
			}elseif((int)$configuracion["telegram_empieza_grabacion"]!= 0){
				if(strpos($reproduccion["reproductor"], 'Grabando:') !== false) {
					//Es grabación
					$mensaje = str_replace("%%usuario%%",$reproduccion["usuario"],$configuracion["texto_para_grabacion"]);
					$mensaje = str_replace("%%canal%%",$reproduccion["canal"],$mensaje);
					$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
					$mensaje = str_replace("%%programa%%",str_replace("Grabando:","",$reproduccion["reproductor"]),$mensaje);
					$mensaje = str_replace("%%hostname%%",$reproduccion["hostname"],$mensaje);
					self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
				}
			}
		}

	}

	/*** BD ***/
	static function backup(){
		/*Eliminamos copias anteriores*/
		$files = glob('/var/www/html/bd_backup/*'); // get all file names
		foreach($files as $file){ // iterate files
			if(is_file($file)){
				unlink($file); // delete file
			}
		}
		$fecha  = self::fechaActualBD();
		$base_datos = self::$base_datos;
		$servidor = self::$servidor;
		$usuarioBD = self::$usuarioBD;
		$contrasenaBD = self::$contrasenaBD;
		$archivo_bd = "/var/www/html/bd_backup/" . "{$fecha}_{$base_datos}.sql";
		$cmd = "mysqldump --routines -h {$servidor} -u {$usuarioBD} -p{$contrasenaBD} {$base_datos} > " . $archivo_bd;
		exec($cmd);
		echo "ok";
	}
	static function backupZip(){
		/*Eliminamos copias anteriores*/
		$files = glob('../bd_backup/*'); // get all file names
		foreach($files as $file){ // iterate files
			if(is_file($file)){
				unlink($file); // delete file
			}
		}
		$fecha  = self::fechaActualBD();
		$base_datos = self::$base_datos;
		$servidor = self::$servidor;
		$usuarioBD = self::$usuarioBD;
		$contrasenaBD = self::$contrasenaBD;
		$archivo_bd = "../bd_backup/" . "{$fecha}_{$base_datos}.sql";
		$cmd = "mysqldump --routines -h {$servidor} -u {$usuarioBD} -p{$contrasenaBD} {$base_datos} > " . $archivo_bd;
		exec($cmd);
		$archivo_zip = "../bd_backup/".$fecha."_".$base_datos.".zip";
		if (file_exists($archivo_zip)) {
			//echo "El fichero $nombre_fichero existe";
			unlink($archivo_zip);
		}
		$zip = new ZipArchive();
		if($zip->open($archivo_zip,ZIPARCHIVE::CREATE)===true) {
			$zip->addFile($archivo_bd);
			$zip->close();
			//eliminamos sql
			//unlink($archivo_bd);
			echo $fecha."_".$base_datos.".zip";
		}
	}
	static function restaurarBackup(){
		$fecha  = self::fechaActualBD();
		$archivoMYSQL = "../bd/restaurar.sql";
		$base_datos = self::$base_datos;
		$servidor = self::$servidor;
		$usuarioBD = self::$usuarioBD;
		$contrasenaBD = self::$contrasenaBD;
		$cmd1 = "mysql -h {$servidor} -u {$usuarioBD} -p{$contrasenaBD} -e 'drop database tvspy'";
		$cmd2 = "mysql -h {$servidor} -u {$usuarioBD} -p{$contrasenaBD} -e 'create database tvspy'";
		$cmd3 = "mysql -h {$servidor} -u {$usuarioBD} -p{$contrasenaBD} {$base_datos} < $archivoMYSQL";
		exec($cmd1);
		exec($cmd2);
		exec($cmd3);
		unlink($archivoMYSQL);
		echo "ok";
	}


	/*** API ***/

	static function testTvheadend($ip, $puerto, $usuario, $contrasena){
		$ipuerto =  $ip.":".$puerto;

		$url = "http://".$ipuerto."/api/serverinfo";
		//  Initiate curl
		$ch = curl_init();
		// Disable SSL verification
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
		// Will return the response, if false it print the response
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		// Set the url
		curl_setopt($ch, CURLOPT_URL,$url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERPWD, $usuario.":".$contrasena);
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		$respuesta_json=curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		$respuesta ="";
		if($httpCode == 404) {
			$respuesta = 404;
		}if($httpCode == 0) {
			$respuesta = 404;
		}else if($httpCode == 401) {
			$respuesta = 401;
		}else if($httpCode == 200) {
			$respuesta = 200;
		}
		return $respuesta;

	}

	static function canalesAPI(){
		$configuracion = self::cargarConfiguracion();
		$ipuerto =  $configuracion["ip"].":".$configuracion["puerto"];
		$url = "http://".$ipuerto."/api/channel/grid?limit=100000";
		return self::peticionAPI($url,$configuracion["usuario"],$configuracion["contrasena"]);;
	}
	static function usuariosAPI(){
		$configuracion = self::cargarConfiguracion();
		$ipuerto =  $configuracion["ip"].":".$configuracion["puerto"];
		$url = "http://".$ipuerto."/api/access/entry/grid";
		return self::peticionAPI($url,$configuracion["usuario"],$configuracion["contrasena"]);;
	}
	static function reproduccionesActivasAPI(){
		$configuracion = self::cargarConfiguracion();
		$ipuerto =  $configuracion["ip"].":".$configuracion["puerto"];
		$url = "http://".$ipuerto."/api/status/subscriptions";
		return self::peticionAPI($url,$configuracion["usuario"],$configuracion["contrasena"]);;
	}
	static function peticionAPI($url, $usuario, $contrasena){
		//  Initiate curl
		$ch = curl_init();
		// Disable SSL verification
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
		// Will return the response, if false it print the response
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		// Set the url
		curl_setopt($ch, CURLOPT_URL,$url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_USERPWD, $usuario.":".$contrasena);
		curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
		$respuesta_json=curl_exec($ch);
		$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		$respuesta ="";
		if($httpCode == 404) {
			$respuesta = 404;
		}if($httpCode == 0) {
			$respuesta = 404;
		}else if($httpCode == 401) {
			$respuesta = 401;
		}else if($httpCode == 200) {
			$respuesta = json_decode($respuesta_json, true);
		}
		return $respuesta;

	}
	/*** Otros ***/
	static function enviarTelegram($TOKEN, $chat_id, $mensaje){
		$response = "";
		$TELEGRAM = "https://api.telegram.org:443/bot".$TOKEN;
		$query = http_build_query([
			'chat_id'=> $chat_id,
			'text'=> $mensaje,
			'parse_mode'=> "HTML"
		]);
		$response = file_get_contents($TELEGRAM."/sendMessage?".$query);
		return $response;
	}
	static function fechaActual(){
		$tz = 'Europe/Madrid';
		$timestamp = time();
		$dt = new DateTime("now", new DateTimeZone($tz)); //first argument "must" be a string
		$dt->setTimestamp($timestamp); //adjust the object to correct timestamp
		return $dt->format('Y-m-d H:i:s');
	}
	static function fechaActualBD(){
		$tz = 'Europe/Madrid';
		$timestamp = time();
		$dt = new DateTime("now", new DateTimeZone($tz)); //first argument "must" be a string
		$dt->setTimestamp($timestamp); //adjust the object to correct timestamp
		return $dt->format('Y-m-d-H-i-s');
	}

	static function comprobarIP($ip_permitidas, $data){
		$ips = self::separar_comas($ip_permitidas);
		$ip = self::partirIP($data);
		$resultado = "no";
		//No -> no permitida
		//Si -> permitida
		if($ips == "" || $ip == ""){
			$resultado = "si";
		}else if($ips != null){
			for ($i = 0; $i < sizeof($ips); $i++) {
				if($ips[$i]==$ip){
					$resultado = "si";
				}
			}
		}else {
			$ips=$ip_permitida;
			if($ips==$ip){
				$resultado = "si";
			}else{
				$resultado = "no";
			}
		}
		return $resultado;
	}
	static function partirIP($ip){
		$ipfinal="";
		if($ip != "localhost"){
			$partesIP = explode('.', $ip);
			$ipfinal = $partesIP[0].".".$partesIP[1].".".$partesIP[2];
		}
		return $ipfinal;
	}
	static function separar_comas($commaSepStr) {
		$myArray = explode(',', $commaSepStr);
		return $myArray ;
	}


}
