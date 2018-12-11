<?php
	require_once "../clases/Util.php";

	if ( $_FILES['basedatos']['size'] <= 0) {
		echo 'ko1';
	}else if ( $_FILES['basedatos']['error'] > 0  ) {
		echo 'ko2';
	}elseif ( 	!file_exists($_FILES['basedatos']['tmp_name']) ||
				!is_uploaded_file($_FILES['basedatos']['tmp_name'])
			){
		echo 'ko3';
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
