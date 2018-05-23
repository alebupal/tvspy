<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="description" content="">
	<meta name="author" content="">
	<title>Configuración - TVSPY</title>
	<?php include "include/estilo.php"; ?>
</head>

<body class="fixed-nav sticky-footer bg-dark pagina-configuracion" id="page-top">
	<?php include "include/menu.php"; ?>
	<!-- Navigation-->

	<div class="content-wrapper">
		<div class="container-fluid">
			<!-- Breadcrumbs-->
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a href="index.php">Inicio</a>
				</li>
				<li class="breadcrumb-item active">Configuración</li>
			</ol>
			<div class="row">
				<div class="col-lg-12">
					<div class="alert alert-success configuracionGuardada oculto" role="alert">
					  Configuración cargada correctamente
					</div>
				</div>
				<div class="col-lg-12">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-cog"></i> Configuración general</div>
						<div class="col-md-12 mb-2 mt-2">
							<form id="formConfiguracion" method="post">
								<div class="form-row">
									<div class="form-group col-md-6">
										<label for="ip">IP</label>
										<input type="text" class="form-control" id="ip" name="ip" placeholder="192.168.1.1" required>
							   		</div>
							    	<div class="form-group col-md-6">
								 		<label for="puerto">Puerto</label>
									 	<input type="text" class="form-control" id="puerto" name="puerto" placeholder="9981" required>
							   		</div>
						   		</div>
								<div class="form-row">
									<div class="form-group col-md-6">
										<label for="usuario">Usuario</label>
										<input type="text" class="form-control" id="usuario" name="usuario" placeholder="Usuario" required>
							   		</div>
							    	<div class="form-group col-md-6">
								 		<label for="pass">Contraseña</label>
									 	<input type="password" class="form-control" id="pass" name="pass" placeholder="Contraseña" required>
							   		</div>
						   		</div>
								<div class="form-row">
									<div class="form-group col-md-12">
										<label for="refresco">Tiempo de refresco (segundos) live página de inicio</label>
										<input type="number" class="form-control" id="refresco" name="refresco" placeholder="1" required>
									</div>
								</div>
								<div class="form-row">
									<div class="form-group col-md-12">
										<div class="form-check">
											<input class="form-check-input" type="checkbox" value="true" name="notificacion_telegram" id="notificacion_telegram">
											<label class="form-check-label" for="notificacion_telegram">Notificaciones Telegram</label>
										</div>
									</div>
						   		</div>
								<div id="configuracionTelegram">									
									<div class="form-row">
										<div class="form-group col-md-6">
											<label for="bot_token">Telegram Bot Token</label>
											<input type="text" class="form-control" id="bot_token" name="bot_token" placeholder="177537537537375252452" required>
										</div>
										<div class="form-group col-md-6">
											<label for="id_chat">Telegram Chat ID, Group ID, or Channel Username</label>
											<input type="text" class="form-control" id="id_chat" name="id_chat" placeholder="177537537537375252452" required>
										</div>
									</div>
									<div class="form-row">
										<div class="form-group col-md-6">
											<label>Texto empieza reprodución</label>
											<label>Variables: %%usuario%%, %%canal%%, %%fecha%%, %%reproductor%%, %%hostname%%</label>											
											<textarea class="form-control" name="texto_empieza" id="texto_empieza" rows="3"></textarea>
										</div>
										<div class="form-group col-md-6">										
											<label>Texto para reprodución</label>
											<label>Variables: %%usuario%%, %%canal%%, %%fecha%%, %%reproductor%%, %%hostname%%</label>
											<textarea class="form-control" name="texto_para" id="texto_para" rows="3"></textarea>
										</div>
									</div>
								</div>
								<button type="submit" class="btn btn-primary btn-block btnGuardar">Guardar</button>
							</form>
						</div>
						<div class="col-md-12 mb-2 mt-2">
							<a class="btn btn-primary btn-block text-white btnBackup" >Backup base de datos</a>
						</div>
					</div>
				</div>
			</div>
		</div>

		<?php include "include/footer.php"; ?>
		<?php include "include/script.php"; ?>
	</div>
</body>

</html>
