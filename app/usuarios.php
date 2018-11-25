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
	<body id="page-top" class="pagina-usuarios">
		<?php include "include/navbar.php"; ?>
		<div id="wrapper">
			<?php include "include/menu.php"; ?>
			<div id="content-wrapper">
				<div class="container-fluid">
					<ol class="breadcrumb">
						<li class="breadcrumb-item">
							<a href="#">Inicio</a>
						</li>
						<li class="breadcrumb-item active">Usuarios</li>
					</ol>
					<div class="row mb-2">
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
							<div class="alert alert-success usuariosImportados oculto" role="alert">
								Usuarios importados correctamente
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
							<div class="table-responsive">
								<table  class="display dataTable table table-striped table-hover table-bordered" width="100%" id="tablaUsuarios">
									<thead>
										<tr>
											<th>Nombre</th>
										</tr>
									</thead>
									<tfoot>
										<tr>
											<th>Nombre</th>
										</tr>
									</tfoot>
								</table>
							</div>
						</div>
					</div>
					<div class="row mb-2">
						<div class="col-md-12">
							<a class="btn btn-primary btn-block text-white btnImportarUsuarios">Importar usuarios</a>
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
