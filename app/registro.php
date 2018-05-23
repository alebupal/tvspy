<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="description" content="">
	<meta name="author" content="">
	<title>Registro - TVSPY</title>
	<?php include "include/estilo.php"; ?>
</head>

<body class="fixed-nav sticky-footer bg-dark pagina-registro" id="page-top">
	<?php include "include/menu.php"; ?>
	<!-- Navigation-->

	<div class="content-wrapper">
		<div class="container-fluid">
			<!-- Breadcrumbs-->
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a href="#">Inicio</a>
				</li>
				<li class="breadcrumb-item active">Registro</li>
			</ol>
			<div class="row mb-2">
				<div class="col-lg-12">					
					<p>Si las imágenes no cargan ve a TVHeadend <a class="enlaceLogueo" href="" target="_blank"></a> y logeate.</p>
					<div class="table-responsive">
						<table  class="display dataTable table table-striped table-hover table-bordered" width="100%" id="tablaRegistro">
							<thead>
								<tr>
									<th>Usuario</th>
									<th>Canal</th>
									<th>Inicio</th>
									<th>Fin</th>
								</tr>
							</thead>
							<tfoot>
								<tr>
									<th>Usuario</th>
									<th>Canal</th>
									<th>Inicio</th>
									<th>Fin</th>
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</div>
		</div>

		<?php include "include/footer.php"; ?>
		<?php include "include/script.php"; ?>
	</div>
</body>

</html>
