<?php
	require_once "../clases/Util.php";

	if ( 0 < $_FILES['file']['error'] ) {
		echo 'ko';
	}
	else {
		$path = $_FILES['basedatos']['name'];
		$ext = pathinfo($path, PATHINFO_EXTENSION);
		move_uploaded_file($_FILES['basedatos']['tmp_name'], '../bd/restaurar.' . $ext);
		echo Util::restaurarBackup();
	}
?>
