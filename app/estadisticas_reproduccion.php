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
	<body id="page-top" class="pagina-estadisticas-reproduccion">
		<?php include "include/navbar.php"; ?>
		<div id="wrapper">
			<?php include "include/menu.php"; ?>
			<div id="content-wrapper">
				<div class="container-fluid">
					<ol class="breadcrumb">
						<li class="breadcrumb-item">
							<a href="#">Inicio</a>
						</li>
						<li class="breadcrumb-item active">Estadisticas</li>
					</ol>
					<div class="row">
						<div class="col-lg-12">
							<div class="card mb-3">
								<div class="card-header">
									<i class="fa fa-television" aria-hidden="true"></i> Tiempo reproducido por canal (<span class="unidadTiempoEstadisticas"></span>)
								</div>
								<div class="list-group list-group-flush small">
									<div class="col-12 mt-2">
										<div class="input-daterange" id="datepicker">
											<div class="input-group">
												<input type="text" class="form-control campo" id="fechaInicioCanal" name="fechaInicioCanal" >
												<div class="input-group-append">
													<span class="input-group-text">hasta</span>
												</div>
												<input type="text" class="form-control campo" id="fechaFinCanal" name="fechaFinCanal">
											</div>
										</div>
									</div>
									<div class="col-12 mt-2">
										<a class="btn btn-primary btn-block btnAplicarGraficaCanal text-white">Aplicar</a>
									</div>
									<div id="graficaCanales"></div>
								</div>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-lg-12">
							<div class="card mb-3">
								<div class="card-header">
									<i class="fa fa-user-circle-o" aria-hidden="true"></i> Tiempo reproducido por usuarios (<span class="unidadTiempoEstadisticas"></span>)
								</div>
								<div class="list-group list-group-flush small">
									<div class="col-12 mt-2">
										<div class="input-daterange" id="datepicker">
											<div class="input-group">
												<input type="text" class="form-control campo" id="fechaInicioUsuarios" name="fechaInicioUsuarios" >
												<div class="input-group-append">
													<span class="input-group-text">hasta</span>
												</div>
												<input type="text" class="form-control campo" id="fechaFinUsuarios" name="fechaFinUsuarios"   >
											</div>
										</div>
									</div>
									<div class="col-12 mt-2">
										<a class="btn btn-primary btn-block btnAplicarGraficaUsuario text-white">Aplicar</a>
									</div>
									<div id="graficaUsuarios"></div>
								</div>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-lg-12">
							<div class="card mb-3">
								<div class="card-header">
									<i class="fa fa-television" aria-hidden="true"></i> Tiempo reproducido por días (<span class="unidadTiempoEstadisticas"></span>)
								</div>
								<div class="list-group list-group-flush small">
									<div class="col-12 mt-2">
										<div class="input-daterange" id="datepicker">
											<div class="input-group">
												<input type="text" class="form-control campo" id="fechaInicioDias" name="fechaInicioDias" >
												<div class="input-group-append">
													<span class="input-group-text">hasta</span>
												</div>
												<input type="text" class="form-control campo" id="fechaFinDias" name="fechaFinDias"   >
												<select class="js-example-basic-single custom-select" name="usuario" id="usuario">
													<option value="todos">Todos</option>
												</select>
											</div>
										</div>
									</div>
									<div class="col-12 mt-2">
										<a class="btn btn-primary btn-block btnAplicarGraficaDias text-white">Aplicar</a>
									</div>
									<div id="graficaReproducciones"></div>
								</div>
							</div>
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
