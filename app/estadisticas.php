<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="description" content="">
	<meta name="author" content="">
	<title>Estadisticas - TVSPY</title>
	<?php include "include/estilo.php"; ?>
</head>

<body class="fixed-nav sticky-footer bg-dark pagina-estadisticas" id="page-top">
	<?php include "include/menu.php"; ?>
	<!-- Navigation-->

	<div class="content-wrapper">
		<div class="container-fluid">
			<!-- Breadcrumbs-->
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a href="#">Inicio</a>
				</li>
				<li class="breadcrumb-item active">Estadisticas</li>
			</ol>
			<div class="row">
				<div class="col-lg-6">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-play-circle-o" aria-hidden="true"></i> Canales</div>
						<div class="list-group list-group-flush small ultimasReproducciones">

						</div>
					</div>
				</div>
				<div class="col-lg-6">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-stop-circle-o" aria-hidden="true"></i> Usuarios</div>
						<div class="list-group list-group-flush small ultimasFinalizaciones">

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
