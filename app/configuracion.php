<!DOCTYPE html>
<html lang="es">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<meta name="description" content="">
		<meta name="author" content="alebupal">
		<title>Escritorio - TVSPY</title>
		<?php include "include/estilo.php"; ?>
	</head>
	<body id="page-top" class="pagina-configuracion">
		<?php
			$menu = "configuracion";
		?>
		<?php include "include/navbar.php"; ?>
		<div id="wrapper">
			<?php include "include/menu.php"; ?>
			<div id="content-wrapper">
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
							<div class="alert alert-success configuracionBackup oculto" role="alert">
								Backup realizado correctamente
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-success configuracionRestaurar oculto" role="alert">
								Backup restaurado correctamente. La página se actualizará automaticamente.
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-success configuracionGuardada oculto" role="alert">
								Configuración cargada correctamente
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-success testEnviado oculto" role="alert">
								Mensaje enviado correctamente
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-success urlCorrecta oculto" role="alert">
								URL y login TvHeadend correcta
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-danger errorURL oculto" role="alert">
								URL o puerto de TvHeadend incorrecta
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-danger errorLogin oculto" role="alert">
								Login incorrecto en tvhedend
							</div>
						</div>
						<div class="col-lg-12">
							<div class="alert alert-danger errorGeneral oculto" role="alert">
								Ha ocurrido algún error
							</div>
						</div>
						<div class="col-lg-12">
							<div class="text-center mt-5 oculto cargando">
								<div class="progress">
									<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
								</div>
								<br>
								<a class="text-white"><i class="fas fa-spinner fa-pulse"></i> Cargando</a>
							</div>
						</div>
						<div class="col-lg-12">
							<form id="formConfiguracion" method="post">
								<div class="card mb-3">
									<div class="card-header">
										<i class="fa fa-cog"></i> Configuración TvHeadend
									</div>
									<div class="col-md-12 mb-2 mt-2">
										<div class="form-row">
											<div class="form-group col-md-6">
												<label for="ip">IP TvHeadend</label>
												<input type="text" class="form-control" id="ip" name="ip" placeholder="192.168.1.1" required>
											</div>
											<div class="form-group col-md-6">
										 		<label for="puerto">Puerto TvHeadend</label>
											 	<input type="number" class="form-control" id="puerto" name="puerto" placeholder="9981" required>
											</div>
										</div>
										<div class="form-row">
											<div class="form-group col-md-6">
												<label for="usuario">Usuario TvHeadend</label>
												<input type="text" class="form-control" id="usuario" name="usuario" placeholder="Usuario" required>
											</div>
											<div class="form-group col-md-6">
												<label for="contrasena">Contraseña TvHeadend</label>
											 	<input type="password" class="form-control" id="contrasena" name="contrasena" placeholder="Contraseña" required>
											</div>
										</div>
										<div class="mb-4 mt-2">
											<a class="btn btn-info btn-block text-white btn-sm btnTestTvheadend">Comprobar conexion</a>
											<small>Para asegurar un mejor funcionamiento es recomendable tener TvHeadend en español</small>
											<small>Hay que guardar abajo para aplicar los cambios</small>
										</div>
									</div>
								</div>
								<div class="card mb-3">
									<div class="card-header">
										<i class="fas fa-chart-area"></i> Configuración Gráfica
									</div>
									<div class="col-md-12 mb-2 mt-2">
										<div class="form-row">
											<div class="form-group col-md-12">
												<label for="unidadTiempo">Unidad de tiempo visualización</label>
												<select class="form-control" id="unidadTiempo" name="unidadTiempo">
													<option value="Horas">Horas</option>
													<option value="Minutos">Minutos</option>
													<option value="Segundos">Segundos</option>
												</select>
												<small>Hay que guardar abajo para aplicar los cambios</small>
											</div>
										</div>
									</div>
								</div>
								<div class="card mb-3">
									<div class="card-header">
										<i class="fas fa-cogs"></i> Configuración General
									</div>
									<div class="col-md-12 mb-2 mt-2">
										<div class="form-row">
											<div class="form-group col-md-6">
												<label for="refresco">Tiempo de refresco (segundos) página de inicio</label>
												<input type="number" class="form-control" id="refresco" name="refresco" placeholder="1" required>
											</div>
											<div class="form-group col-md-6">
												<label for="tiempoMinimo">Tiempo mínimo para registro (segundos)</label>
												<input type="number" class="form-control" id="tiempoMinimo" name="tiempoMinimo" placeholder="1" required>
											</div>
											<div class="form-group col-md-12">
												<small>Hay que guardar abajo para aplicar los cambios</small>
											</div>
										</div>
									</div>
								</div>
								<div class="card mb-3">
									<div class="card-header">
										<i class="fab fa-telegram"></i> Configuración Telegram
									</div>
									<div class="col-md-12 mb-2 mt-2">
										<div class="form-row">
											<div class="form-group col-md-12">
												<div class="form-check">
													<input class="form-check-input" type="checkbox" value="true" name="telegram_notificacion" id="telegram_notificacion">
													<label class="form-check-label" for="telegram_notificacion">Notificaciones Telegram</label>
												</div>
											</div>
										</div>
									</div>
									<div class="col-md-12 mb-2 mt-2" id="configuracionTelegram">
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
										<div class="mb-4 mt-2">
											<a class="btn btn-info btn-block text-white btn-sm btnTestTelegram">Enviar mensaje de prueba</a>
											<small>Hay que guardar para aplicar los cambios</small>
										</div>
										<div class="form-row">
											<div class="form-group col-md-6">
												<div class="form-row">
													<div class="form-group col-md-12">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" value="true" name="telegram_empieza" id="telegram_empieza">
															<label class="form-check-label" for="telegram_empieza">Notificaciones empezar reprodución Telegram</label>
														</div>
													</div>
												</div>
												<div id="div_texto_empieza">
													<label>%%usuario%%, %%canal%%, %%fecha%%, %%reproductor%%, %%hostname%%</label>
													<textarea class="form-control" name="texto_empieza" id="texto_empieza" rows="3"></textarea>
												</div>
											</div>
											<div class="form-group col-md-6">
												<div class="form-row">
													<div class="form-group col-md-12">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" value="true" name="telegram_para" id="telegram_para">
															<label class="form-check-label" for="telegram_para">Notificaciones parar reproducción Telegram</label>
														</div>
													</div>
												</div>
												<div id="div_texto_para">
													<label>%%usuario%%, %%canal%%, %%fecha%%, %%reproductor%%, %%hostname%%</label>
													<textarea class="form-control" name="texto_para" id="texto_para" rows="3"></textarea>
												</div>
											</div>
										</div>
										<div class="form-row">
											<div class="form-group col-md-6">
												<div class="form-row">
													<div class="form-group col-md-12">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" value="true" name="telegram_empieza_grabacion" id="telegram_empieza_grabacion">
															<label class="form-check-label" for="telegram_empieza_grabacion">Notificaciones para empezar grabación Telegram</label>
														</div>
													</div>
												</div>
												<div id="div_telegram_empieza_grabacion">
													<label>%%usuario%%, %%canal%%, %%fecha%%, %%programa%%, %%hostname%%</label>
													<textarea class="form-control" name="texto_empieza_grabacion" id="texto_empieza_grabacion" rows="3"></textarea>
												</div>
											</div>
											<div class="form-group col-md-6">
												<div class="form-row">
													<div class="form-group col-md-12">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" value="true" name="telegram_para_grabacion" id="telegram_para_grabacion">
															<label class="form-check-label" for="telegram_para_grabacion">Notificaciones parar para grabación Telegram</label>
														</div>
													</div>
												</div>
												<div id="div_telegram_para_grabacion">
													<label>%%usuario%%, %%canal%%, %%fecha%%, %%programa%%, %%hostname%%</label>
													<textarea class="form-control" name="texto_para_grabacion" id="texto_para_grabacion" rows="3"></textarea>
												</div>
											</div>
										</div>
										<div class="form-row">
											<div class="form-group col-md-6">
												<div class="form-row">
													<div class="form-group col-md-12">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" value="true" name="telegram_tiempo" id="telegram_tiempo">
															<label class="form-check-label" for="telegram_tiempo">Notificaciones cuando pase x tiempo en Telegram</label>
														</div>
													</div>
												</div>
												<div class="form-row" id="div_telegram_tiempo">
													<div class="form-group col-md-12">
														<label>%%usuario%%, %%canal%%, %%fecha%%, %%reproductor%%, %%hostname%%, %%tiempo%%</label>
														<textarea class="form-control" name="texto_tiempo" id="texto_tiempo" rows="3"></textarea>
													</div>
													<div class="form-group col-md-12">
														<label>Tiempo límite (minutos)</label>
														<input type="number" class="form-control" id="telegram_tiempo_limite" name="telegram_tiempo_limite" placeholder="1" required>
													</div>
												</div>
											</div>
											<div class="form-group col-md-6">
												<div class="form-row">
													<div class="form-group col-md-12">
														<div class="form-check">
															<input class="form-check-input" type="checkbox" value="true" name="telegram_conexion" id="telegram_conexion">
															<label class="form-check-label" for="telegram_conexion">Notificaciones conexiones intrusas</label>
														</div>
													</div>
												</div>
												<div class="form-row" id="div_telegram_conexion">
													<div class="form-group col-md-12">
														<label>%%usuario%%, %%canal%%, %%fecha%%, %%reproductor%%, %%hostname%%</label>
														<textarea class="form-control" name="texto_conexion" id="texto_conexion" rows="3"></textarea>
													</div>
												</div>
											</div>
											<div class="form-group col-md-12">
												<small>Hay que guardar abajo para aplicar los cambios</small>
											</div>
										</div>
									</div>
								</div>
								<div class="card mb-3">
									<div class="card-header">
										<i class="fa fa-desktop"></i> IP conocida
									</div>
									<div class="col-md-12 mb-2 mt-2" id="configuracionTelegram">
										<div class="contenedor_ip form-row"></div>
										<small>Deben ser con el siguiente formato 192.168.1</small>
										<div class="form-group col-md-12 mt-2">
											<a class="btn btn-info btn-block text-white btn-sm btnAnadirIP">Añadir IP</a>
										</div>
									</div>
									<div class="form-group col-md-12">
										<small>Hay que guardar abajo para aplicar los cambios</small>
									</div>
								</div>
								<button type="submit" class="btn btn-primary btn-block btnGuardar">Guardar</button>
								<div class="card mb-3 mt-3">
									<div class="card-header">
										<i class="fas fa-database"></i> Base de datos
									</div>
									<div class="col-md-12">
										<div class="form-row">
											<div class="form-group col-md-12 mb-2 mt-2">
												<a class="btn btn-info btn-block text-white btn-sm btnBackup" >Realizar Backup base de datos</a>
											</div>
										</div>
										<div class="form-row">
											<div class="form-group col-md-6 mb-2 mt-2">
												<input type="file" class="form-control-file" id="basedatos" name="basedatos" accept=".sql">
											</div>
											<div class="form-group col-md-6 mb-2 mt-2">
												<a class="btn btn-info btn-block text-white btn-sm btnRestaurarBackup" >Restaurar base de datos</a>
											</div>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
				<?php include "include/footer.php"; ?>
			</div>
		</div>
		<?php include "include/scroll.php"; ?>
		<?php include "include/script.php"; ?>
	</body>
</html>
