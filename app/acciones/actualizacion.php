<?php
//$ruta = "../";
$ruta = "/var/www/html/";
require_once $ruta."clases/Util.php";
$configuracion = Util::cargarConfiguracion();

$reproduccionesActivas = Util::obtenerReproduccionesActivas();
$reproduccionesBD = Util::obtenerReproduccionesBD();
$reproduccionesBDFin = Util::reproduccionesBDFin();


if(count($reproduccionesActivas["entries"])==0 && count($reproduccionesBDFin)==0) {
	//Ninguna reproducción
	echo Util::fechaActual().": No hay ninguna reproducción\n";
}else if(count($reproduccionesActivas["entries"])==0 && count($reproduccionesBDFin)!=0){
	//No hay nada ninguna reprodución activa, pero hay reproducciones sin terminar en la base de datos
	//Insertar fecha de que ha terminado de ver la tv al usuario que haya en la bd
	//Se para una reproducción
	for ($r=0; $r < count($reproduccionesBDFin); $r++) {
		echo Util::fechaActual().": Parada la reproducción1 ".$reproduccionesBDFin[$r]["id"]."\n";
		Util::actualizarFechaFinReproduccion($reproduccionesBDFin[$r], $configuracion);
	}
}else if(count($reproduccionesActivas["entries"])!=0 && count($reproduccionesBDFin)==0){
	// No hay nada en la bd, pero hay una reprodución activa
	// Insertamos la nueva produccion de reproducciones
	for ($i=0; $i < count($reproduccionesActivas["entries"]) ; $i++) {
		if($reproduccionesActivas["entries"][$i]["state"]=="Funcionando"){
			$fechaInicio = date_format(date_timestamp_set(new DateTime(), $reproduccionesActivas["entries"][$i]["start"]), 'Y-m-d H:i:s');
			$fechaActual =  self::fechaActual();
			$segundos = (strtotime($fechaActual) - strtotime($fechaInicio));
			if($segundos>$configuracion["tiempoMinimo"]){
				echo Util::fechaActual().": Nueva reproducción1 ".$reproduccionesActivas["entries"][$i]["id"]."\n";
				Util::insertarReproduccion($reproduccionesActivas["entries"][$i], $configuracion);
			}
		}
	}
}else if(count($reproduccionesActivas["entries"])!=0 && count($reproduccionesBDFin)!=0){
	$arrayDiferente = array();
	$arrayDiferente2 = array();
	reset($arrayDiferente);
	reset($arrayDiferente2);
	$arrayDiferente = array_values(array_diff(array_column($reproduccionesBDFin, 'idReproduccion'), array_column($reproduccionesActivas["entries"], 'id')));
	$arrayDiferente2 = array_values(array_diff(array_column($reproduccionesActivas["entries"], 'id'), array_column($reproduccionesBDFin, 'idReproduccion')));

	// echo "<pre>".Util::fechaActual().": ";
	// var_dump($arrayDiferente);
	// echo " ---- \n ";
	// var_dump($arrayDiferente2);
	// echo "</pre>\n";

	if(count($reproduccionesActivas["entries"])>0){
		for ($i=0; $i < count($reproduccionesActivas["entries"]); $i++) {
			$obtenerReproduccion = Util::obtenerReproduccion($reproduccionesActivas["entries"][$i]["id"]);
			if($obtenerReproduccion != false){
				echo Util::fechaActual().": Actualiza tiempo reproducción ".$reproduccionesActivas["entries"][$i]["id"]."\n";
				Util::actualizarTiempoReproduccion($obtenerReproduccion, $configuracion);
			}
		}
	}
	//ids que estan en la bd y hay que actualizar la fecha
	if(count($arrayDiferente)>0){
		for ($i=0; $i < count($arrayDiferente); $i++) {
			for ($r=0; $r < count($reproduccionesBDFin); $r++) {
				if((int)$arrayDiferente[$i]==(int)$reproduccionesBDFin[$r]["idReproduccion"]){
					echo Util::fechaActual().": Parada reproducción2 ".$reproduccionesBDFin[$r]["idReproduccion"]."\n";
					Util::actualizarFechaFinReproduccion($reproduccionesBDFin[$r], $configuracion);
				}
			}
		}
	}
	//ids que estan en activos y hay que insertar en la bd
	if(count($arrayDiferente2)>0){
		for ($i=0; $i < count($arrayDiferente2); $i++) {
			for ($r=0; $r < count($reproduccionesActivas["entries"]); $r++) {
				if((int)$arrayDiferente2[$i]==(int)$reproduccionesActivas["entries"][$r]["id"]){
					if($reproduccionesActivas["entries"][$r]["state"]=="Funcionando"){
						$fechaInicio = date_format(date_timestamp_set(new DateTime(), $reproduccionesActivas["entries"][$r]["start"]), 'Y-m-d H:i:s');
						$fechaActual =  self::fechaActual();
						$segundos = (strtotime($fechaActual) - strtotime($fechaInicio));
						if($segundos>$configuracion["tiempoMinimo"]){
							echo Util::fechaActual().": Nueva reproducción2 ".$reproduccionesActivas["entries"][$r]["id"]."\n";
							Util::insertarReproduccion($reproduccionesActivas["entries"][$r], $configuracion);
						}
					}
				}
			}
		}
	}
}
?>
