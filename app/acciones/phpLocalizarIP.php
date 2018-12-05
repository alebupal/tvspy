<?php 
require '../vendor/GeoIP2-php/geoip2.phar';
$reader = new GeoIp2\Database\Reader('../vendor/GeoIP2-php/GeoLite2-City.mmdb');

$arrayDatos = array();
try {
	$record = $reader->city($_POST["ip"]);	
	$item  = array(
		"codigoPais" => $record->country->isoCode,
		"pais" => $record->country->name,
		
		"codigoSubdivision" => $record->mostSpecificSubdivision->isoCode,
		"subdivision" => $record->mostSpecificSubdivision->name,
		
		"codigoCiudad" => $record->postal->code,
		"ciudad" => $record->city->name,
		
		"radio" => $record->location->accuracyRadius,
		
		"latitud" => $record->location->latitude,
		"longitud" => $record->location->longitude
	);
	array_push($arrayDatos, $item);
	echo json_encode($arrayDatos);
} catch (Exception $e) {
	echo "ko";
}
?>