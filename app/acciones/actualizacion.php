<?php
require_once "../clases/Util.php";
$configuracion = Util::cargarConfiguracion();

$reproduccionesActivas = Util::obtenerReproduccionesActivas();
$reproduccionesBD = Util::obtenerReproduccionesBD();
$reproduccionesBDFin = Util::reproduccionesBDFin();


if($reproduccionesBDFin != false){
	for ($i=0; $i < count($reproduccionesBDFin); $i++) {
		if(count($reproduccionesActivas["entries"])==0){
			//Se pone fecha a todas las reproducciones que no tengan fecha fin
			echo Util::fechaActual().": Se finaliza una reproducción (todas)";
			Util::actualizarFechaFinReproduccion($reproduccionesBDFin[$i]);
		}else{			
			//Se pone fecha a todas las reproducciones que no tengan fecha fin y no esten en activas
			for ($r=0; $r < count($reproduccionesActivas["entries"]); $r++) {
				echo $reproduccionesBDFin[$i]["id"];
				echo $reproduccionesActivas["entries"][$r]["id"];
				//Mal
				if($reproduccionesBDFin[$i]["id"]!=$reproduccionesActivas["entries"][$r]["id"]){
					echo Util::fechaActual().": Se finaliza una reproducción (no activas)";
					Util::actualizarFechaFinReproduccion($reproduccionesBDFin[$i]);
				}
			}
		}
	}
}

if(count($reproduccionesActivas["entries"])>0){	
	for ($i=0; $i < count($reproduccionesActivas["entries"]); $i++) {
		$obtenerReproduccion = Util::obtenerReproduccion($reproduccionesActivas["entries"][$i]["id"]);
		if($obtenerReproduccion == false){
			//El id de la reproducción no aparece en la bd, por lo que se inserta una nueva
			echo Util::fechaActual().": Se inserta una reproducción nueva";
			Util::insertarReproduccion($reproduccionesActivas["entries"][$i], $configuracion);
		}else{
			//El id de la reproducción aparece en la bd, sigue reproduciendo, actualizamos tiempo de visionado
			echo Util::fechaActual().": Se actualiza tiempo de una reproducción";
			Util::actualizarTiempoReproduccion($obtenerReproduccion, $configuracion);
		}
	}
}else{
	echo Util::fechaActual().": Ninguna reproducción";
}



?>
