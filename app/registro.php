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
	<body id="page-top" class="pagina-registro">
		<?php include "include/navbar.php"; ?>
		<div id="wrapper">
			<?php include "include/menu.php"; ?>
			<div id="content-wrapper">
				<div class="col-lg-12">
					<div class="alert alert-danger ipNo oculto" role="alert">
						Esta ip no se puede localizar.
					</div>
				</div>
				<div class="container-fluid">
					<ol class="breadcrumb">
						<li class="breadcrumb-item">
							<a href="#">Inicio</a>
						</li>
						<li class="breadcrumb-item active">Registro</li>
					</ol>
					<div class="row mb-2">
						<div class="col-lg-12">
							<div class="table-responsive">
								<table  class="display dataTable table table-striped table-hover table-bordered" width="100%" id="tablaRegistro">
									<thead>
										<tr>
											<th>Usuario</th>
											<th>Canal</th>
											<th>Inicio</th>
											<th>Fin</th>
											<th>Hostname</th>
											<th>Reproductor</th>
											<th>Tiempo (<span class="unidadTiempoEstadisticas"></span>)</th>
											<th>Errores</th>
										</tr>
									</thead>
									<tfoot>
										<tr>
											<th>Usuario</th>
											<th>Canal</th>
											<th>Inicio</th>
											<th>Fin</th>
											<th>Hostname</th>
											<th>Reproductor</th>
											<th>Tiempo (<span class="unidadTiempoEstadisticas"></span>)</th>
											<th>Errores</th>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</div>
				</div>
				<?php include "include/footer.php"; ?>
			</div>
			<div class="modal" id="myModal">
				<div class="modal-dialog">
					<div class="modal-content">
						<!-- Modal Header -->
						<div class="modal-header">
							<h4 class="modal-title">Localización <span class="ipModal"></span></h4>
							<button type="button" class="close" data-dismiss="modal">&times;</button>
						</div>
						<!-- Modal body -->
						<div class="modal-body">
							<div class="row">
								<div class="col-md-6"><span><b>País: </b></span><span class="codigoPais"></span> - <span class="pais"></span></div>
								<div class="col-md-6"><span><b>Región: </b></span><span class="codigoSubdivision"></span> - <span class="subdivision"></span></div>
							</div>
							<div class="row">
								<div class="col-md-6"><span><b>Ciudad: </b></span><span class="codigoCiudad"></span> - <span class="ciudad"></span></div>
								<div class="col-md-6"><span><b>Radio: </b></span><span class="radio"></span></div>
							</div>
							<div class="row">
								<div class="col-md-6"><span><b>Latitud: </b></span><span class="latitud"></span></div>
								<div class="col-md-6"><span><b>Longitud: </b></span><span class="longitud"></span></div>
							</div>
						</div>
						<!-- Modal footer -->
						<div class="modal-footer">
							<button type="button" class="btn btn-danger" data-dismiss="modal">Cerrar</button>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php include "include/scroll.php"; ?>
		<?php include "include/script.php"; ?>
	</body>
</html>
