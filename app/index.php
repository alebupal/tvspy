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
	<body id="page-top" class="pagina-inicio">
		<?php include "include/navbar.php"; ?>
		<div id="wrapper">
			<?php
				$menu = "inicio";
			?>
			<?php include "include/menu.php"; ?>
			<div id="content-wrapper">
				<div class="container-fluid">
					<ol class="breadcrumb">
						<li class="breadcrumb-item">
							<a href="#">Inicio</a>
						</li>
						<li class="breadcrumb-item active">Escritorio</li>
					</ol>
					<div class="row">
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
			  		</div>
					<div class="row divReproduccion"></div>
					<div class="row">
			  			<div class="col-xl-4 col-sm-6 mb-3">
			  				<div class="card text-white bg-primary o-hidden h-100">
			  					<div class="card-body">
			  						<div class="card-body-icon">
			  							<i class="fa fa-play-circle-o" aria-hidden="true"></i>
			  						</div>
			  						<div class="mr-5"><span class="reproduccionesTotales"></span> reproduciones totales</div>
			  					</div>
			  				</div>
			  			</div>
			  			<div class="col-xl-4 col-sm-6 mb-3">
			  				<div class="card text-white bg-warning o-hidden h-100">
			  					<div class="card-body">
			  						<div class="card-body-icon">
			  							<i class="fa fa-user-circle-o" aria-hidden="true"></i>
			  						</div>
			  						<div class="mr-5"><span class="usuarioActivo">--</span> es el usuario más activo</div>
			  					</div>
			  				</div>
			  			</div>
			  			<div class="col-xl-4 col-sm-6 mb-3">
			  				<div class="card text-white bg-success o-hidden h-100">
			  					<div class="card-body">
			  						<div class="card-body-icon">
			  							<i class="fa fa-television" aria-hidden="true"></i>
			  						</div>
			  						<div class="mr-5"><span class="canalActivo">--</span> es el canal más visto</div>
			  					</div>
			  				</div>
			  			</div>
			  		</div>
					<div class="row">
			  			<div class="col-lg-6">
			  				<!-- Example Notifications Card-->
			  				<div class="card mb-3">
			  					<div class="card-header">
			  						<i class="fa fa-play-circle-o" aria-hidden="true"></i> Últimas 5 reproduciones</div>
			  					<div class="list-group list-group-flush small ultimasReproducciones">

			  					</div>
			  				</div>
			  			</div>
			  			<div class="col-lg-6">
			  				<!-- Example Notifications Card-->
			  				<div class="card mb-3">
			  					<div class="card-header">
			  						<i class="fa fa-stop-circle-o" aria-hidden="true"></i> Últimas 5 finalizaciones</div>
			  					<div class="list-group list-group-flush small ultimasFinalizaciones">

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
