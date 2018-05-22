<!DOCTYPE html>
<html lang="es">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<meta name="description" content="">
	<meta name="author" content="">
	<title>Escritorio - TVSPY</title>
	<?php include "include/estilo.php"; ?>
</head>

<body class="fixed-nav sticky-footer bg-dark pagina-inicio" id="page-top">
	<?php include "include/menu.php"; ?>
	<!-- Navigation-->

	<div class="content-wrapper">
		<div class="container-fluid">
			<!-- Breadcrumbs-->
			<ol class="breadcrumb">
				<li class="breadcrumb-item">
					<a href="#">Inicio</a>
				</li>
				<li class="breadcrumb-item active">Escritorio</li>
			</ol>
			<!-- Icon Cards-->
			<div class="row divReproduccion">

			</div>
			<div class="row">
				<div class="col-xl-4 col-sm-6 mb-3">
					<div class="card text-white bg-primary o-hidden h-100">
						<div class="card-body">
							<div class="card-body-icon">
								<i class="fa fa-fw fa-comments"></i>
							</div>
							<div class="mr-5"><span class="reproduccionesTotales"></span> reproduciones totales</div>
						</div>
						<a class="card-footer text-white clearfix small z-1" href="#">
							<span class="float-left">Ver más</span>
							<span class="float-right">
								<i class="fa fa-angle-right"></i>
							</span>
						</a>
					</div>
				</div>
				<div class="col-xl-4 col-sm-6 mb-3">
					<div class="card text-white bg-warning o-hidden h-100">
						<div class="card-body">
							<div class="card-body-icon">
								<i class="fa fa-fw fa-list"></i>
							</div>
							<div class="mr-5"><span class="usuarioActivo">--</span> es el usuario más activo</div>
						</div>
						<a class="card-footer text-white clearfix small z-1" href="#">
							<span class="float-left">Ver más</span>
							<span class="float-right">
								<i class="fa fa-angle-right"></i>
							</span>
						</a>
					</div>
				</div>
				<div class="col-xl-4 col-sm-6 mb-3">
					<div class="card text-white bg-success o-hidden h-100">
						<div class="card-body">
							<div class="card-body-icon">
								<i class="fa fa-fw fa-shopping-cart"></i>
							</div>
							<div class="mr-5"><span class="canalActivo">--</span> es el canal más activo</div>
						</div>
						<a class="card-footer text-white clearfix small z-1" href="#">
							<span class="float-left">Ver más</span>
							<span class="float-right">
								<i class="fa fa-angle-right"></i>
							</span>
						</a>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-6">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-bell-o"></i> Últimas 5 reproduciones</div>
						<div class="list-group list-group-flush small ultimasReproducciones">

						</div>
					</div>
				</div>
				<div class="col-lg-6">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-bell-o"></i> Últimas 5 finalizaciones</div>
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
