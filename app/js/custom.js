$(document).ready(function () {
	var arrayConfiguracion = new Array();

	gestionMenu();
	cargarConfiguracion(arrayConfiguracion);

	function cargarConfiguracion(arrayConfiguracion){
		$.ajax({
			type: "POST",
			url: "acciones/phpCagarConfiguracion.php",
			success: function (data) {
				arrayConfiguracion = $.parseJSON(data);
				if ( $(".pagina-configuracion").length > 0 ) {
					cargarConfiguracionFormulario(arrayConfiguracion);
					guardarConfiguracionFormulario();
					btnTestTelegram();
					btnTestTvheadend();
				}
				if ( $(".pagina-canales").length > 0 ) {
					//importarCanales();
					btnImportarCanales();
					tablaCanales();
				}
				if ( $(".pagina-usuarios").length > 0 ) {
					//importarUsuarios();
					btnImportarUsuarios();
					tablaUsuarios();
				}
				if ( $(".pagina-registro").length > 0 ) {
					$(".unidadTiempoEstadisticas").html(arrayConfiguracion["unidadTiempo"]);
					tablaRegistro(arrayConfiguracion);
				}
				if ( $(".pagina-inicio").length > 0 ) {
					actualizarInicio(arrayConfiguracion)
					setInterval(function() { actualizarInicio(arrayConfiguracion); }, (arrayConfiguracion["refresco"]*1000));
				}
				if ( $(".pagina-estadisticas").length > 0 ) {

					$(".js-example-basic-single").select2({
						language: "es"
					});
					$('.input-daterange').datepicker({
						format: "yyyy-mm-dd",
						todayBtn: "linked",
						clearBtn: true,
						language: "es",
						todayHighlight: true,
						toggleActive: true,
					})

					$(".unidadTiempoEstadisticas").html(arrayConfiguracion["unidadTiempo"]);

					graficaUsuarios();
					btnAplicarGraficaUsuarios();

					graficaCanales();
					btnAplicarGraficaCanales();

					graficaDias();
					btnAplicarGraficaDias();
				}
			}
		});
	}
	function gestionMenu(){
		if(localStorage.getItem("estadoNav")=="cerrado"){
			cerrarNav();
		}else{
			abrirNav();
		}
		// Toggle the side navigation
		$("#sidenavToggler").click(function(e) {
			if(localStorage.getItem("estadoNav")=="cerrado"){
				localStorage.setItem("estadoNav", "abierto");
			}else{
				localStorage.setItem("estadoNav", "cerrado");
			}
		});
	}

	/*** Página inicio ***/
	function actualizarInicio(arrayConfiguracion){
		var formData = new FormData();
		formData.append("ip", arrayConfiguracion["ip"]);
		formData.append("puerto", arrayConfiguracion["puerto"]);
		formData.append("usuario", arrayConfiguracion["usuario"]);
		formData.append("contrasena", arrayConfiguracion["contrasena"]);
		$.ajax({
			type: "POST",
			url: "acciones/phpTestTvheadend.php",
			data : formData,
			contentType : false,
			processData : false,
			success: function (data) {
				if(data == 404){
					console.log("404");
					$(".errorURL").fadeTo(2000, 500).slideUp(500, function(){
						$(".errorURL").slideUp(500);
					});
				}else if (data == 401){
					console.log("401");
					$(".errorLogin").fadeTo(2000, 500).slideUp(500, function(){
						$(".errorLogin").slideUp(500);
					});
				}else if (data == 200){
					reproduccionesActivas();
					usuarioActivo();
					canalActivo();
					reproduccionesTotales();
					ultimasReproducciones();
					ultimasFinalizaciones();
				}
			}
		});

	}
	function reproduccionesActivas(){
		$.ajax({
			type: "POST",
			url: "acciones/phpReproduccionesActivas.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var html="";
					for (var i = 0; i < data["totalCount"]; i++) {
						if(data["entries"][i]["state"]=="Funcionando"){
							usuario = "";
							if(data["entries"][i]["username"]== undefined){
								usuario = "Sin usuario";
							}else{
								usuario = data["entries"][i]["username"];
							}
							fechaInicio=data["entries"][i]["start"];

							html +='<div class="col-xl-4 col-sm-6 mb-3">'+
							'<div class="card">'+
							'<div class="card-body">'+
							'<h6 class="card-title"><b>'+usuario+'</b> está reproduciendo <b>'+data["entries"][i]["channel"]+'</b></h6>'+
							'<h7 class="card-subtitle mb-2 text-muted">'+data["entries"][i]["title"]+'</h7><br>'+
							'<span><b>Inicio</b>: '+unixToDate(fechaInicio)+'</span><br>'+
							'<span><b>State</b>: '+data["entries"][i]["state"]+'</span><br>'+
							'<span><b>IP</b>: '+data["entries"][i]["hostname"]+'</span><br>'+
							'<span><b>Service</b>: '+data["entries"][i]["service"]+'</span><br>'+
							'<span><b>Profile</b>: '+data["entries"][i]["profile"]+'</span><br>'+
							'<span><b>Errors</b>: '+data["entries"][i]["errors"]+'</span>'+
							'</div>'+
							'</div>'+
							'</div>';
						}
					}
					$(".divReproduccion").html(html);
				}else{
					console.log("Error desconocido al importar reproducciones activas");
				}
			}
		});
	}
	function usuarioActivo(){
		$.ajax({
			type: "POST",
			url: "acciones/phpUsuarioActivo.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var texto ="";
					$(".usuarioActivo").html(data["usuario"]);
				}else{
					$(".usuarioActivo").html("--");
				}
			}
		});
	}
	function canalActivo(){
		$.ajax({
			type: "POST",
			url: "acciones/phpCanalActivo.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var texto ="";
					$(".canalActivo").html(data["canal"]);
				}else{
					$(".canalActivo").html("--");
				}
			}
		});
	}
	function reproduccionesTotales(){
		$.ajax({
			type: "POST",
			url: "acciones/phpReproduccionesTotales.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var texto ="";
					$(".reproduccionesTotales").html(data["total"]);
				}else{
					$(".canalActivo").html("--");
				}
			}
		});
	}
	function ultimasReproducciones(){
		$.ajax({
			type: "POST",
			url: "acciones/phpUltimasReproduciones.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var texto ="";
					for (var i = 0; i < data.length; i++) {
						texto+='<a class="list-group-item list-group-item-action">'+
							'<div class="media">'+
								'<div class="media-body">'+
									'<strong>'+data[i]["usuario"]+'</strong> ha empezado a reproducir <strong>'+data[i]["canal"]+'</strong>.'+
									'<div class="text-muted smaller">'+data[i]["inicio"]+'</div>'+
								'</div>'+
							'</div>'+
						'</a>';
					}
					$(".ultimasReproducciones").html(texto);
				}else{
					texto+='<a class="list-group-item list-group-item-action">'+
						'<div class="media">'+
							'<div class="media-body">'+
								'<strong>Sin reproducciones</div>'+
							'</div>'+
						'</div>'+
					'</a>';
					$(".ultimasReproducciones").html(texto);
				}
			}
		});
	}
	function ultimasFinalizaciones(){
		$.ajax({
			type: "POST",
			url: "acciones/phpUltimasFinalizaciones.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var texto ="";
					for (var i = 0; i < data.length; i++) {
						texto+='<a class="list-group-item list-group-item-action">'+
							'<div class="media">'+
								'<div class="media-body">'+
									'<strong>'+data[i]["usuario"]+'</strong> ha parado de reproducir <strong>'+data[i]["canal"]+'</strong>.'+
									'<div class="text-muted smaller">'+data[i]["fin"]+'</div>'+
								'</div>'+
							'</div>'+
						'</a>';
					}

					$(".ultimasFinalizaciones").html(texto);
				}else{
					texto+='<a class="list-group-item list-group-item-action">'+
						'<div class="media">'+
							'<div class="media-body">'+
								'<strong>Sin reproducciones</div>'+
							'</div>'+
						'</div>'+
					'</a>';
					$(".ultimasFinalizaciones").html(texto);
				}
			}
		});
	}

	/*** Página configuración ***/
	function cargarConfiguracionFormulario(arrayConfiguracion){
		$("#ip").val(arrayConfiguracion["ip"]);
		$("#puerto").val(arrayConfiguracion["puerto"]);
		$("#contrasena").val(arrayConfiguracion["contrasena"]);
		$("#usuario").val(arrayConfiguracion["usuario"]);
		$("#refresco").val(arrayConfiguracion["refresco"]);
		$("#tiempoMinimo").val(arrayConfiguracion["tiempoMinimo"]);

		if(arrayConfiguracion["notificacion_telegram"]==1){
			$("#notificacion_telegram").prop('checked', true);
			$("#configuracionTelegram").show();
		}else if(arrayConfiguracion["notificacion_telegram"]==0){
			$("#notificacion_telegram").prop('checked', false);
			$("#configuracionTelegram").hide();
		}

		if(arrayConfiguracion["telegram_para"]==1){
			$("#telegram_para").prop('checked', true);
			$("#div_texto_para").show();
		}else if(arrayConfiguracion["telegram_para"]==0){
			$("#texto_para").prop('checked', false);
			$("#div_texto_para").hide();
		}

		if(arrayConfiguracion["telegram_empieza"]==1){
			$("#telegram_empieza").prop('checked', true);
			$("#div_texto_empieza").show();
		}else if(arrayConfiguracion["telegram_empieza"]==0){
			$("#telegram_empieza").prop('checked', false);
			$("#div_texto_empieza").hide();
		}

		if(arrayConfiguracion["telegram_tiempo"]==1){
			$("#telegram_tiempo").prop('checked', true);
			$("#div_telegram_tiempo").show();
		}else if(arrayConfiguracion["telegram_tiempo"]==0){
			$("#telegram_tiempo").prop('checked', false);
			$("#div_telegram_tiempo").hide();
		}

		if(arrayConfiguracion["unidadTiempo"]=="Horas"){
			$("#unidadTiempo option[value='Horas']").attr('selected',true);
			$("#unidadTiempo option[value='Minutos']").attr('selected',false);
			$("#unidadTiempo option[value='Segundos']").attr('selected',false);
		}else if(arrayConfiguracion["unidadTiempo"]=="Minutos"){
			$("#unidadTiempo option[value='Horas']").attr('selected',false);
			$("#unidadTiempo option[value='Minutos']").attr('selected',true);
			$("#unidadTiempo option[value='Segundos']").attr('selected',false);
		}else if(arrayConfiguracion["unidadTiempo"]=="Segundos"){
			$("#unidadTiempo option[value='Horas']").attr('selected',false);
			$("#unidadTiempo option[value='Minutos']").attr('selected',false);
			$("#unidadTiempo option[value='Segundos']").attr('selected',true);
		}

		$("#texto_empieza").val(arrayConfiguracion["texto_empieza"]);
		$("#texto_para").val(arrayConfiguracion["texto_para"]);
		$("#texto_tiempo").val(arrayConfiguracion["texto_tiempo"]);
		$("#telegram_tiempo_limite").val(arrayConfiguracion["telegram_tiempo_limite"]);
		$("#bot_token").val(arrayConfiguracion["bot_token"]);
		$("#id_chat").val(arrayConfiguracion["id_chat"]);
	}
	function guardarConfiguracionFormulario(){
		$("#notificacion_telegram").click(function() {
			if ($('#notificacion_telegram').is(":checked")){
				$("#configuracionTelegram").show();
			}else{
				$("#configuracionTelegram").hide();
			}
		});

		$("#telegram_para").click(function() {
			if ($('#telegram_para').is(":checked")){
				$("#div_texto_para").show();
			}else{
				$("#div_texto_para").hide();
			}
		});

		$("#telegram_empieza").click(function() {
			if ($('#telegram_empieza').is(":checked")){
				$("#div_texto_empieza").show();
			}else{
				$("#div_texto_empieza").hide();
			}
		});

		$("#telegram_tiempo").click(function() {
			if ($('#telegram_tiempo').is(":checked")){
				$("#div_telegram_tiempo").show();
			}else{
				$("#div_telegram_tiempo").hide();
			}
		});
		$('#formConfiguracion').on('submit', function(e){
			e.preventDefault();
			var form = $('#formConfiguracion')[0];
			var formData = new FormData(form);
			$.ajax({
				type: "POST",
				url: "acciones/phpGuardarConfiguracion.php",
				data : formData,
				contentType : false,
				processData : false,
				success: function(data) {
					irArriba();
					if(data==true){
						console.log("Configuración guardada correctamente");
						$(".configuracionGuardada").fadeTo(2000, 500).slideUp(500, function(){
							$(".configuracionGuardada").slideUp(500);
						});
					}else{
						console.log("Error al guardar configuración");
					}
				}
			});
		});
	}

	function btnTestTelegram(){
		$( ".btnTestTelegram" ).click(function() {
			var formData = new FormData();
			formData.append("bot_token", $("#bot_token").val());
			formData.append("id_chat", $("#id_chat").val());
			$.ajax({
				type: "POST",
				url: "acciones/phpTestTelegram.php",
				data : formData,
				contentType : false,
				processData : false,
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					console.log("Mensaje enviado");
					$(".testEnviado").fadeTo(2000, 500).slideUp(500, function(){
						$(".testEnviado").slideUp(500);
					});
				}
			});
		});
	}
	function btnTestTvheadend(){
		$( ".btnTestTvheadend" ).click(function() {
			var formData = new FormData();
			formData.append("ip", $("#ip").val());
			formData.append("puerto", $("#puerto").val());
			formData.append("usuario", $("#usuario").val());
			formData.append("contrasena", $("#contrasena").val());
			$.ajax({
				type: "POST",
				url: "acciones/phpTestTvheadend.php",
				data : formData,
				contentType : false,
				processData : false,
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					if(data == 404){
						console.log("404");
						$(".errorURL").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorURL").slideUp(500);
						});
					}else if (data == 401){
						console.log("401");
						$(".errorLogin").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorLogin").slideUp(500);
						});
					}else if (data == 200){
						console.log("200");
						$(".urlCorrecta").fadeTo(2000, 500).slideUp(500, function(){
							$(".urlCorrecta").slideUp(500);
						});
					}
				}
			});
		});
	}
	/*** Página Canales ***/
	function btnImportarCanales(){
		$( ".btnImportarCanales" ).click(function() {
			$.ajax({
				type: "POST",
				url: "acciones/phpImportarCanales.php",
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					if(data == 404){
						console.log("404");
						$(".errorURL").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorURL").slideUp(500);
						});
					}else if (data == 401){
						console.log("401");
						$(".errorLogin").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorLogin").slideUp(500);
						});
					}else if(data==true){
						console.log("Canales importados correctamente");
						$(".canalesImportados").fadeTo(2000, 500).slideUp(500, function(){
							$(".canalesImportados").slideUp(500);
						});
						tablaCanales();
					}
				}
			});
		});
	}
	function importarCanales(){
		$.ajax({
			type: "POST",
			url: "acciones/phpImportarCanales.php",
			beforeSend:function(){
				irArriba();
				$(".cargando").toggle();
			},
			success: function (data) {
				$(".cargando").toggle();
				if(data == 404){
					console.log("404");
					$(".errorURL").fadeTo(2000, 500).slideUp(500, function(){
						$(".errorURL").slideUp(500);
					});
				}else if (data == 401){
					console.log("401");
					$(".errorLogin").fadeTo(2000, 500).slideUp(500, function(){
						$(".errorLogin").slideUp(500);
					});
				}else if(data==true){
					console.log("Canales importados correctamente");
					$(".canalesImportados").fadeTo(2000, 500).slideUp(500, function(){
						$(".canalesImportados").slideUp(500);
					});
					tablaCanales();
				}
			}
		});
	}
	function tablaCanales(){
		$('#tablaCanales tfoot th').each( function () {
			var title = $('#tablaCanales thead th').eq( $(this).index() ).text();
			$(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
		});
		var table = $('#tablaCanales').DataTable({
			language: {
				url: "vendor/datatables/i18n/Spanish.json",
				buttons: {
					colvis: 'Filtro'
				}
			},
			ajax: {
				url: "acciones/phpCanalesTabla.php",
				type: 'POST'
			},
			dom: "<'row'<'col-md-3'l><'col-md-6'B><'col-md-3'>>rtip",
			responsive: false,
			destroy: true,
			iDisplayLength: 5,
			lengthMenu: [
				[5, 10, 25, 50, 100, -1],
				[5, 10, 25, 50, 100, "Todo"] // change per page values here
			],
			buttons: [
				'colvis',
			],
			order: [[ 0, "asc" ]],
			columns: [
				{data: "1"}
			],
			initComplete: function() {
				table.columns().every( function (){
					var that = this;
					$('input', this.footer()).on('keyup change', function (){
						if ( that.search() !== this.value ) {
							that.search(this.value).draw();
						}
					});
				});
			}
		});
		table.select();
	}

	/*** Página Usuarios ***/
	function btnImportarUsuarios(){
		$(".btnImportarUsuarios").click(function() {
			$.ajax({
				type: "POST",
				url: "acciones/phpImportarUsuarios.php",
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					if(data == 404){
						console.log("404");
						$(".errorURL").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorURL").slideUp(500);
						});
					}else if (data == 401){
						console.log("401");
						$(".errorLogin").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorLogin").slideUp(500);
						});
					}else if(data==true){
						console.log("Usuarios importados correctamente");
						$(".usuariosImportados").fadeTo(2000, 500).slideUp(500, function(){
							$(".usuariosImportados").slideUp(500);
						});
						tablaUsuarios();
					}
				}
			});
		});
	}
	function importarUsuarios(){
		$.ajax({
			type: "POST",
			url: "acciones/phpImportarUsuarios.php",
			beforeSend:function(){
				irArriba();
				$(".cargando").toggle();
			},
			success: function (data) {
				$(".cargando").toggle();
				tablaUsuarios();
				if(data==true){
					console.log("Usuarios importados correctamente");
					$(".usuariosImportados").fadeTo(2000, 500).slideUp(500, function(){
						$(".usuariosImportados").slideUp(500);
					});
					tablaUsuarios();
				}else{
					console.log("Error al importar usuarios");
				}
			}
		});
	}
	function tablaUsuarios(){
		$('#tablaUsuarios tfoot th').each( function () {
			var title = $('#tablaUsuarios thead th').eq( $(this).index() ).text();
			$(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
		});
		var table = $('#tablaUsuarios').DataTable({
			language: {
				url: "vendor/datatables/i18n/Spanish.json",
				buttons: {
					colvis: 'Filtro'
				}
			},
			ajax: {
				url: "acciones/phpUsuariosTabla.php",
				type: 'POST'
			},
			dom: "<'row'<'col-md-3'l><'col-md-6'B><'col-md-3'>>rtip",
			responsive: false,
			destroy: true,
			iDisplayLength: 5,
			lengthMenu: [
				[5, 10, 25, 50, 100, -1],
				[5, 10, 25, 50, 100, "Todo"] // change per page values here
			],
			buttons: [
				'colvis',
			],
			order: [[ 0, "asc" ]],
			columns: [
				{data: "1"}
			],
			initComplete: function() {
				table.columns().every( function (){
					var that = this;
					$('input', this.footer()).on('keyup change', function (){
						if ( that.search() !== this.value ) {
							that.search(this.value).draw();
						}
					});
				});
			}
		});
		table.select();
	}

	/*** Página Registro ***/
	function tablaRegistro(arrayConfiguracion){
		$('#tablaRegistro tfoot th').each( function () {
			var title = $('#tablaRegistro thead th').eq( $(this).index() ).text();
			$(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
		} );
		var table = $('#tablaRegistro').DataTable({
			language: {
				url: "vendor/datatables/i18n/Spanish.json",
				buttons: {
					colvis: 'Filtro'
				}
			},
			ajax: {
				url: "acciones/phpRegistroTabla.php",
				type: 'POST'
			},
			dom: "<'row'<'col-md-3'l><'col-md-6'B><'col-md-3'>>rtip",
			responsive: false,
			/*destroy: true,
			processing: true,*/
			destroy: true,
			iDisplayLength: 5,
			lengthMenu: [
				[5, 10, 25, 50, 100, -1],
				[5, 10, 25, 50, 100, "Todo"] // change per page values here
			],
			buttons: [
				'colvis',
			],
			order: [[ 2, "desc" ]],
			columns: [
				{data: "1"},
				{data: "2"},
				{data: "3"},
				{data: "4"},
				{data: "5"},
				{data: "6"},
				{data: null,
					render: function (data, type, row) {
						divisionTiempo=1;
						abr="h";
						if(arrayConfiguracion["unidadTiempo"]=="Horas"){
							divisionTiempo = 3600;
							abr="h";
						}else if(arrayConfiguracion["unidadTiempo"]=="Minutos"){
							divisionTiempo = 60;
							abr="min";
						}else if(arrayConfiguracion["unidadTiempo"]=="Segundos"){
							divisionTiempo = 1;
							abr="seg";
						}
						tiempo = data[7]/divisionTiempo;
						redondeo = Math.round(tiempo * 100) / 100;
						return redondeo + " " +abr;
					}
				},
				{data: "8"},
			],
			initComplete: function() {
				table.columns().every( function (){
					var that = this;
					$('input', this.footer()).on('keyup change', function (){
						if ( that.search() !== this.value ) {
							that.search(this.value).draw();
						}
					});
				});
			}
		});
		table.select();
	}

	/*** Página Estadisticas ***/
	function graficaCanales(){
		var semanaAnterior = new Date();
		semanaAnterior.setDate(semanaAnterior.getDate()-7);
		$("#fechaInicioCanal").datepicker("update", semanaAnterior);
		$("#fechaFinCanal").datepicker("update", new Date());
		fechaInicioCanal = moment($('#fechaInicioCanal').datepicker("getDate")).format('YYYY-MM-DD');
		fechaFinCanal = moment($('#fechaFinCanal').datepicker("getDate")).format('YYYY-MM-DD');
		obtenerGraficaCanales(fechaInicioCanal,fechaFinCanal);
	}
	function btnAplicarGraficaCanales(){
		$(".btnAplicarGraficaCanal" ).click(function() {
			fechaInicioCanal = moment($('#fechaInicioCanal').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFinCanal = moment($('#fechaFinCanal').datepicker("getDate")).format('YYYY-MM-DD');
			obtenerGraficaCanales(fechaInicioCanal,fechaFinCanal);
		});
	}
	function obtenerGraficaCanales(fechaInicioCanal,fechaFinCanal){
		var formData = new FormData();
		formData.append("fechaInicio", fechaInicioCanal);
		formData.append("fechaFin", fechaFinCanal);
		$.ajax({
			type: "POST",
			url: "acciones/phpGraficaCanales.php",
			data : formData,
			contentType : false,
			processData : false,
			beforeSend:function(){
				$(".cargando").toggle();
			},
			success: function (data) {
				var chart = AmCharts.makeChart( "graficaCanales", {
					"type": "serial",
					"theme": "light",
					"dataProvider":  JSON.parse(data),
					"valueAxes": [{
						"gridColor": "#FFFFFF",
						"gridAlpha": 0.2,
						"dashLength": 0
					}],
					"gridAboveGraphs": true,
					"startDuration": 1,
					"graphs": [ {
						"balloonText": "[[category]]: <b>[[value]]</b>",
						"fillAlphas": 0.8,
						"lineAlpha": 0.2,
						"type": "column",
						"valueField": "valor"
					}],
					"chartCursor": {
						"categoryBalloonEnabled": false,
						"cursorAlpha": 0,
						"zoomable": false
					},
					"categoryField": "canal",
					"categoryAxis": {
						"gridPosition": "start",
						"gridAlpha": 0,
						"labelRotation": 70,
						"fontSize": 10,
						"tickPosition": "start",
						"tickLength": 20
					},
					"export": {
						"enabled": true
					}
				});
			}
		});

	}

	function graficaUsuarios(){
		var semanaAnterior = new Date();
		semanaAnterior.setDate(semanaAnterior.getDate()-7);
		$("#fechaInicioUsuarios").datepicker("update", semanaAnterior);
		$("#fechaFinUsuarios").datepicker("update", new Date());
		fechaInicioUsuarios = moment($('#fechaInicioUsuarios').datepicker("getDate")).format('YYYY-MM-DD');
		fechaFinUsuarios = moment($('#fechaFinUsuarios').datepicker("getDate")).format('YYYY-MM-DD');
		obtenerGraficaUsuarios(fechaInicioUsuarios,fechaFinUsuarios);

	}
	function btnAplicarGraficaUsuarios(){
		$(".btnAplicarGraficaDias" ).click(function() {
			fechaInicioUsuarios = moment($('#fechaInicioUsuarios').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFinUsuarios = moment($('#fechaFinUsuarios').datepicker("getDate")).format('YYYY-MM-DD');
			obtenerGraficaUsuarios(fechaInicioUsuarios,fechaFinUsuarios);
		});
	}
	function obtenerGraficaUsuarios(fechaInicioUsuarios,fechaFinUsuarios){
		var formData = new FormData();
		formData.append("fechaInicio", fechaInicioUsuarios);
		formData.append("fechaFin", fechaFinUsuarios);
		$.ajax({
			type: "POST",
			url: "acciones/phpGraficaUsuarios.php",
			data : formData,
			contentType : false,
			processData : false,
			beforeSend:function(){+
				$(".cargando").toggle();
			},
			success: function (data) {
				var chart = AmCharts.makeChart( "graficaUsuarios", {
					"type": "serial",
					"theme": "light",
					"dataProvider":  JSON.parse(data),
					"valueAxes": [{
						"gridColor": "#FFFFFF",
						"gridAlpha": 0.2,
						"dashLength": 0
					}],
					"gridAboveGraphs": true,
					"startDuration": 1,
					"graphs": [ {
						"balloonText": "[[category]]: <b>[[value]]</b>",
						"fillAlphas": 0.8,
						"lineAlpha": 0.2,
						"type": "column",
						"valueField": "valor"
					}],
					"chartCursor": {
						"categoryBalloonEnabled": false,
						"cursorAlpha": 0,
						"zoomable": false
					},
					"categoryField": "usuario",
					"categoryAxis": {
						"gridPosition": "start",
						"gridAlpha": 0,
						"tickPosition": "start",
						"tickLength": 20,
						"labelRotation": 70,
						"fontSize": 10
					},
					"export": {
						"enabled": true
					}
				});
			}
		});

	}

	function graficaDias(){
		getUsuariosSelect();
		var semanaAnterior = new Date();
		semanaAnterior.setDate(semanaAnterior.getDate()-7);
		$("#fechaInicioDias").datepicker("update", semanaAnterior);
		$("#fechaFinDias").datepicker("update", new Date());
		fechaInicioDias = moment($('#fechaInicioDias').datepicker("getDate")).format('YYYY-MM-DD');
		fechaFinDias = moment($('#fechaFinDias').datepicker("getDate")).format('YYYY-MM-DD');
		usuario = $("#usuario").val();
		obtenerGraficaDias(fechaInicioDias,fechaFinDias,usuario);

	}
	function btnAplicarGraficaDias(){
		$(".btnAplicarGraficaDias" ).click(function() {
			fechaInicioDias = moment($('#fechaInicioDias').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFinDias = moment($('#fechaFinDias').datepicker("getDate")).format('YYYY-MM-DD');
			usuario = $("#usuario").val();
			obtenerGraficaDias(fechaInicioDias,fechaFinDias,usuario);
		});
	}
	function obtenerGraficaDias(fechaInicioDias,fechaFinDias,usuario){
		var formData = new FormData();
		formData.append("fechaInicio", fechaInicioDias);
		formData.append("fechaFin", fechaFinDias);
		formData.append("usuario",usuario);
		$.ajax({
			type: "POST",
			url: "acciones/phpGraficaReproducciones.php",
			data : formData,
			contentType : false,
			processData : false,
			//async: false,
			beforeSend:function(){
				$(".cargando").toggle();
			},
			success: function (data) {
				data = $.parseJSON(data);
				var chart = AmCharts.makeChart("graficaReproducciones", {
					"type": "serial",
					"theme": "light",
					"marginRight": 40,
					"marginLeft": 40,
					"autoMarginOffset": 20,
					"mouseWheelZoomEnabled":true,
					"dataDateFormat": "YYYY-MM-DD",
					"valueAxes": [{
						"id": "v1",
						"axisAlpha": 0,
						"position": "left",
						"ignoreAxisWidth":true
					}],
					"balloon": {
						"borderThickness": 1,
						"shadowAlpha": 0
					},
					"graphs": [{
						"id": "g1",
						"balloon":{
							"drop":true,
							"adjustBorderColor":false,
							"color":"#ffffff"
						},
						"bullet": "round",
						"bulletBorderAlpha": 1,
						"bulletColor": "#FFFFFF",
						"bulletSize": 5,
						"hideBulletsCount": 50,
						"lineThickness": 2,
						"title": "red line",
						"useLineColorForBulletBorder": true,
						"valueField": "valor",
						"balloonText": "<span style='font-size:18px;'>[[valor]]</span>"
					}],
					"chartScrollbar": {
						"graph": "g1",
						"oppositeAxis":false,
						"offset":30,
						"scrollbarHeight": 80,
						"backgroundAlpha": 0,
						"selectedBackgroundAlpha": 0.1,
						"selectedBackgroundColor": "#888888",
						"graphFillAlpha": 0,
						"graphLineAlpha": 0.5,
						"selectedGraphFillAlpha": 0,
						"selectedGraphLineAlpha": 1,
						"autoGridCount":true,
						"color":"#AAAAAA"
					},
					"chartCursor": {
						"pan": true,
						"valueLineEnabled": true,
						"valueLineBalloonEnabled": true,
						"cursorAlpha":1,
						"cursorColor":"#258cbb",
						"limitToGraph":"g1",
						"valueLineAlpha":0.2,
						"valueZoomable":true
					},
					"valueScrollbar":{
						"oppositeAxis":false,
					  "offset":50,
					  "scrollbarHeight":10
				  },
					"categoryField": "fecha",
					"categoryAxis": {
						"parseDates": true,
						"dashLength": 1,
 						"minorGridEnabled": true
					},
					"export": {
						"enabled": true
					},
					"dataProvider":data
				});
			}
		});
	}

	function getUsuariosSelect(){
		$.ajax({
			type: "POST",
			url: "acciones/phpUsuariosSelect.php",
			success: function (data) {
				data = $.parseJSON(data);
				opciones ="";
				for (var i = 0; i < data.length; i++) {
					opciones += '<option value="'+data[i]["nombre"]+'">'+data[i]["nombre"]+'</option>'
				}
				$("#usuario").append(opciones);
			}
		});
	}

	/*** Otros ***/
	function unixToDate(unixTimeStamp){
		var timestampInMilliSeconds = unixTimeStamp*1000; //as JavaScript uses milliseconds; convert the UNIX timestamp(which is in seconds) to milliseconds.
		var date = new Date(timestampInMilliSeconds); //create the date object

		var day = (date.getDate() < 10 ? '0' : '') + date.getDate(); //adding leading 0 if date less than 10 for the required dd format
		var month = (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1); //adding leading 0 if month less than 10 for mm format. Used less than 9 because javascriptmonths are 0 based.
		var year = date.getFullYear(); //full year in yyyy format

		//var hours = ((date.getHours() % 12 || 12) < 10 ? '0' : '') + (date.getHours() % 12 || 12); //converting 24h to 12h and using 12 instead of 0. also appending 0 if hour less than 10 for the required hh format
		var hours = date.getHours(); //converting 24h to 12h and using 12 instead of 0. also appending 0 if hour less than 10 for the required hh format
		var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(); //adding 0 if minute less than 10 for the required mm format
		var seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds(); //adding 0 if second less than 10 for the required mm format
		var meridiem = (date.getHours() >= 12) ? 'pm' : 'am'; //setting meridiem if hours24 greater than 12

		var formattedDate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
		;
		return formattedDate;
	}
	function abrirNav(){
		$("body").removeClass("sidenav-toggled");
	}
	function cerrarNav(){
		$("body").toggleClass("sidenav-toggled");
		$(".navbar-sidenav .nav-link-collapse").addClass("collapsed");
		$(".navbar-sidenav .sidenav-second-level, .navbar-sidenav .sidenav-third-level").removeClass("show");
	}
	function irArriba(){
		$('body,html').animate({scrollTop : 0}, 500);
	}
});
