<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="description" content="">
	<meta name="author" content="">
	<title>Usuarios - TVSPY</title>
	<?php include "include/estilo.php"; ?>
</head>

<body class="fixed-nav sticky-footer bg-dark pagina-usuarios" id="page-top">
	<?php include "include/menu.php"; ?>
	<!-- Navigation-->

	<div class="content-wrapper">
		<div class="container-fluid">
			<!-- Breadcrumbs-->
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
					<a class="btn btn-primary btn-block text-white btnImportarUsuarios">Importar usuarios de nuevo</a>
				</div>
			</div>

		</div>

		<?php include "include/footer.php"; ?>
		<?php include "include/script.php"; ?>
	</div>
</body>

</html>
