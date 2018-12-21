<?php
	require_once "../clases/Util.php";

	if ( 	!file_exists($_FILES['basedatos']['tmp_name']) ||
			!is_uploaded_file($_FILES['basedatos']['tmp_name']) ||
			$_FILES['basedatos']['error'] > 0 ||
			$_FILES['basedatos']['size'] <= 0
		){
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
