<?php
/**
 * @author alebupal
 */
class Util{
	public static $servidor= "localhost";
	public static $usuarioBD= "tvspy";
	public static $contrasenaBD = "tvspy";
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
		$update = "UPDATE configuracion SET bot_token = :bot_token,
											contrasena = :contrasena,
											id_chat = :id_chat,
											ip = :ip,
											refresco = :refresco,
											tiempoMinimo = :tiempoMinimo,
											notificacion_telegram = :notificacion_telegram,
											puerto = :puerto,
											telegram_empieza = :telegram_empieza,
											telegram_para = :telegram_para,
											telegram_tiempo = :telegram_tiempo,
											telegram_tiempo_limite = :telegram_tiempo_limite,
											texto_empieza = :texto_empieza,
											texto_para = :texto_para,
											texto_tiempo = :texto_tiempo,
											usuario = :usuario,
											unidadTiempo = :unidadTiempo
										WHERE id=1";
		$stmt = $db->prepare($update);
		// Bind parameters to statement variables
		$stmt->bindParam(':bot_token', $arrayConfiguracion["bot_token"]);
		$stmt->bindParam(':id_chat', $arrayConfiguracion["id_chat"]);
		$stmt->bindParam(':contrasena', $arrayConfiguracion["contrasena"]);
		$stmt->bindParam(':ip', $arrayConfiguracion["ip"]);
		$stmt->bindParam(':refresco', $arrayConfiguracion["refresco"]);
		$stmt->bindParam(':tiempoMinimo', $arrayConfiguracion["tiempoMinimo"]);
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
		$stmt->bindParam(':unidadTiempo', $arrayConfiguracion["unidadTiempo"]);

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
		$id = (int)$idReproduccion;
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
		$id = (int)$reproduccion["id"];
		$insert = "INSERT INTO registro (usuario, canal, idReproduccion, inicio, hostname, reproductor, errores) VALUES (:usuario, :canal, :idReproduccion, :inicio, :hostname, :reproductor, :errores)";
		$statement = $db->prepare($insert);
		// Bind parameters to statement variables
		if (isset($reproduccion["username"])) {
			$usuario = $reproduccion["username"];
		}else{
			$usuario = "Sin usuario";
		}
		$fechaInicio = date_format(date_timestamp_set(new DateTime(), $reproduccion["start"]), 'Y-m-d H:i:s');
		$statement->bindParam(':usuario', $usuario);
		$statement->bindParam(':canal', $reproduccion["channel"]);
		$statement->bindParam(':idReproduccion', $id);
		$statement->bindParam(':inicio', $fechaInicio);
		$statement->bindParam(':hostname', $reproduccion["hostname"]);
		$statement->bindParam(':reproductor', $reproduccion["title"]);
		$statement->bindParam(':errores', $reproduccion["errors"]);
		$statement->execute();
		$statement->closeCursor();

		if((int)$configuracion["notificacion_telegram"]!= 0){
			if((int)$configuracion["telegram_empieza"]!= 0){
				$mensaje = str_replace("%%usuario%%",$usuario,$configuracion["texto_empieza"]);
				$mensaje = str_replace("%%canal%%",$reproduccion["channel"],$mensaje);
				$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
				$mensaje = str_replace("%%reproductor%%",$reproduccion["title"],$mensaje);
				$mensaje = str_replace("%%hostname%%",$reproduccion["hostname"],$mensaje);
				self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
			}
		}
	}
	static function actualizarTiempoReproduccion($reproduccion, $configuracion){
		$inicio = $reproduccion["inicio"];
		$fechaActual =  self::fechaActual();
		$segundos = (strtotime($fechaActual) - strtotime($inicio));

		$db = new PDO("mysql:dbname=".self::$base_datos.";host=".self::$servidor."",
			self::$usuarioBD,
			self::$contrasenaBD,
			array(
				PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
				PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8;"
			)
		);
		$update = "UPDATE registro SET tiempo=:tiempo WHERE idReproduccion=:idReproduccion";
		$statement = $db->prepare($update);
		// Bind parameters to statement variables
		$statement->bindParam(':idReproduccion', $reproduccion["idReproduccion"]);
		$statement->bindParam(':tiempo', $segundos);

		$statement->execute();
		$statement->closeCursor();
		if((int)$reproduccion["notificacion_tiempo"]== 0){
			if((int)$configuracion["notificacion_telegram"]!= 0){
				if((int)$configuracion["telegram_tiempo"]!= 0){
					if((int)$minutos>$configuracion["telegram_tiempo_limite"]){
						$mensaje = str_replace("%%usuario%%",$reproduccion["usuario"],$configuracion["texto_tiempo"]);
						$mensaje = str_replace("%%canal%%",$reproduccion["canal"],$mensaje);
						$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
						$mensaje = str_replace("%%reproductor%%",$reproduccion["reproductor"],$mensaje);
						$mensaje = str_replace("%%hostname%%",$reproduccion["hostname"],$mensaje);
						$mensaje = str_replace("%%tiempo%%",round($minutos)." minutos",$mensaje);
						var_dump($reproduccion);
						self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
						self::actualizarTelegramTiempoLimite($reproduccion, $configuracion);
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

		if((int)$configuracion["notificacion_telegram"]!= 0){
			if((int)$configuracion["telegram_para"]!= 0){
				$mensaje = str_replace("%%usuario%%",$reproduccion["usuario"],$configuracion["texto_para"]);
				$mensaje = str_replace("%%canal%%",$reproduccion["canal"],$mensaje);
				$mensaje = str_replace("%%fecha%%",$fechaActual,$mensaje);
				$mensaje = str_replace("%%reproductor%%",$reproduccion["reproductor"],$mensaje);
				$mensaje = str_replace("%%hostname%%",$reproduccion["hostname"],$mensaje);
				self::enviarTelegram($configuracion["bot_token"], $configuracion["id_chat"], $mensaje);
			}
		}

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

}
