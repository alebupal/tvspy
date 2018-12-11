<?php
	require_once "../clases/Util.php";

	if ( $_FILES['basedatos']['size'] <= 0) {
		echo 'ko';
	}else if ( 0 <= $_FILES['basedatos']['error'] ) {
		echo 'ko';
	}else if (!isset_file('input_name')) {
		echo 'ko';
	}else {
		$path = $_FILES['basedatos']['name'];
		$ext = pathinfo($path, PATHINFO_EXTENSION);
		if ($ext != "sql") {
			echo 'ko';
		}else{
			move_uploaded_file($_FILES['basedatos']['tmp_name'], '../bd/restaurar.' . $ext);
			echo Util::restaurarBackup();
		}
	}
?>
