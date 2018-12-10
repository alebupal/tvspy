<ul class="sidebar navbar-nav">
	<li <?php if($menu == "inicio"){echo "class='nav-item active'";}else {echo "class='nav-item'";}	?> >
		<a class="nav-link" href="index.php">
			<i class="fas fa-fw fa-tachometer-alt"></i>
			<span>Inicio</span>
		</a>
	</li>
	<li <?php if($menu == "registro"){echo "class='nav-item active'";}else {echo "class='nav-item'";} ?> >
		<a class="nav-link" href="registro.php">
			<i class="fas fa-list-ul"></i>
			<span>Registro</span>
		</a>
	</li>
	<li <?php if($menu == "estadisticas"){echo "class='nav-item active'";}else {echo "class='nav-item'";}	?> >
		<a class="nav-link dropdown-toggle" href="#" id="pagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			<i class="fas fa-chart-area"></i>
			<span>Estadísticas</span>
		</a>
		<div class="dropdown-menu" aria-labelledby="pagesDropdown">
			<a class="dropdown-item" href="estadisticas_reproduccion.php">Reproducción</a>
			<a class="dropdown-item" href="estadisticas_conexion.php">Conexiones</a>
		</div>
	</li>
	<li <?php if($menu == "tvheadend"){echo "class='nav-item active'";}else {echo "class='nav-item'";}	?> >
		<a class="nav-link dropdown-toggle" href="#" id="pagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			<i class="fas fa-tv"></i>
			<span>TvHeadend</span>
		</a>
		<div class="dropdown-menu" aria-labelledby="pagesDropdown">
			<a class="dropdown-item" href="usuarios.php">Usuarios</a>
			<a class="dropdown-item" href="canales.php">Canales</a>
		</div>
	</li>
	<li <?php if($menu == "configuracion"){echo "class='nav-item active'";}else {echo "class='nav-item'";}	?> >
		<a class="nav-link" href="configuracion.php">
			<i class="fas fa-cogs"></i>
			<span>Configuración</span>
		</a>
	</li>
</ul>
