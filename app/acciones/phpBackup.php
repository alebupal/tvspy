<?php

$servidor= "localhost";
$usuarioBD= "tvspy";
$contrasenaBD = "tvspy";
$base_datos = "tvspy";


// $server_name   = "localhost";
// $username      = "root";
// $password      = "root";
// $database_name = "world_copy";
$date_string   = date("Ymd");

$cmd = "mysqldump --routines -h {$servidor} -u {$usuarioBD} -p{$contrasenaBD} {$base_datos} > " . "../bd/" . "{$date_string}_{$database_name}.sql";

exec($cmd);

echo "ok";
?>
