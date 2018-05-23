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
				<div class="col-lg-12">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-television" aria-hidden="true"></i> Canales
						</div>
						<div class="list-group list-group-flush small">
							<div id="graficaCanales"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-lg-12">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-user-circle-o" aria-hidden="true"></i> Usuarios
						</div>
						<div class="list-group list-group-flush small">
							<div id="graficaUsuarios"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-lg-12">
					<!-- Example Notifications Card-->
					<div class="card mb-3">
						<div class="card-header">
							<i class="fa fa-television" aria-hidden="true"></i> Reproducciones totales
						</div>
						<div class="list-group list-group-flush small">
							<div class="col-12 mt-2">
		                        <div class="input-daterange" id="datepicker">
		                            <div class="input-group">
		                                <input type="text" class="form-control campo" id="fechaInicio" name="fechaInicio" >
		                                <div class="input-group-append">
		                                    <span class="input-group-text">hasta</span>
		                                </div>
		                                <input type="text" class="form-control campo" id="fechaFin" name="fechaFin"   >
										<select class="js-example-basic-single custom-select" name="usuario" id="usuario">
					                    	<option value="todos">Todos</option>
					                    </select>
		                            </div>
		                        </div>
		                    </div>
							<div class="col-12 mt-2">
								<a class="btn btn-primary btn-block btnAplicarGrafica text-white">Aplicar</a>
							</div>
							<div id="graficaReproducciones"></div>
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
