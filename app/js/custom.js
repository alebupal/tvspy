$(document).ready(function () {
	var arrayConfiguracion = new Array();
	var version = "2.0.1";

	comprobarVersion(version);
	gestionMenu();
	cargarConfiguracion(arrayConfiguracion);

	function comprobarVersion(version){
		$.ajax({
			type: "GET",
			dataType:'json',
			url: "https://raw.githubusercontent.com/alebupal/tvspy/master/version.json",
			success: function (data) {
				//console.log(data["version"]);
				if(data["version"]!=version){
					$(".nuevaVersion").text(" (Nueva versión disponible)")
				}
			}
		});
	}

	function cargarConfiguracion(arrayConfiguracion){
		$.ajax({
			type: "POST",
			url: "acciones/phpCagarConfiguracion.php",
			success: function (data) {
				arrayConfiguracion = $.parseJSON(data);
				//console.log(arrayConfiguracion);
				if ( $(".pagina-configuracion").length > 0 ) {
					cargarConfiguracionFormulario(arrayConfiguracion);
					guardarConfiguracionFormulario();
					btnTestTelegram();
					btnTestTvheadend();
					btnAnadirIP();
					btnQuitarIP();
					btnBackup();
					btnRestaurarBackup();
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
					localizarIP();
				}
				if ( $(".pagina-inicio").length > 0 ) {
					actualizarInicio(arrayConfiguracion);
					setInterval(function() { actualizarInicio(arrayConfiguracion); }, (arrayConfiguracion["refresco"]*1000));
					localizarIP();
				}
				if ( $(".pagina-estadisticas-reproduccion").length > 0 ) {

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

					getUsuariosSelect();

					graficaUsuarios();
					btnAplicarGraficaUsuarios();

					graficaCanales();
					btnAplicarGraficaCanales();

					graficaDias();
					btnAplicarGraficaDias();
				}
				if ( $(".pagina-estadisticas-conexion").length > 0 ) {
					$('.input-daterange').datepicker({
						format: "yyyy-mm-dd",
						todayBtn: "linked",
						clearBtn: true,
						language: "es",
						todayHighlight: true,
						toggleActive: true,
					})
					graficaConexion();
					btnAplicarGraficaConexion();
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
		$("#sidebarToggle").click(function(e) {
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
					reproduccionesActivas(arrayConfiguracion);
					usuarioActivo();
					canalActivo();
					reproduccionesTotales();
					ultimasReproducciones();
					ultimasFinalizaciones();
				}
			}
		});

	}
	function reproduccionesActivas(arrayConfiguracion){
		$.ajax({
			type: "POST",
			url: "acciones/phpReproduccionesActivas.php",
			success: function (data) {
				if(data!=false){
					data = $.parseJSON(data);
					var html="";
					for (var i = 0; i < data["totalCount"]; i++) {
						if(data["entries"][i]["state"]=="Funcionando" || data["entries"][i]["state"]=="Running"){
							usuario = "";
							if(data["entries"][i]["username"]== undefined){
								usuario = "Sin usuario";
							}else{
								usuario = data["entries"][i]["username"];
							}
							if(data["entries"][i]["hostname"]== undefined){
								hostname = "<span class='permitida'>Permitida: <a class='localizarIP'>localhost</a></span>";
							}else{
								hostname = comprobarIPInicio(arrayConfiguracion["ip_permitida"], data["entries"][i]["hostname"]);
							}
							fechaInicio=data["entries"][i]["start"];
							accion = "reproduciendo";
							if(data["entries"][i]["title"].indexOf("DVR:") > -1){
								accion = "grabando";
							}
							var logo="img/sin-logo.png";
							if(data["entries"][i]["idCanal"]!=""){
								logo= "img/canales/"+data["entries"][i]["idCanal"]+".png";
							}
							html +='<div class="col-xl-4 col-sm-6 mb-3">'+
								'<div class="card">'+
									'<div class="card-body">'+
										'<div class="text-center"><img class="logoCanalActivo" src="'+logo+'"></div>'+
										'<h6 class="card-title"><b>'+usuario+'</b> está '+accion+' <b>'+data["entries"][i]["channel"]+'</b></h6>'+
										'<h7 class="card-subtitle mb-2 text-muted">'+data["entries"][i]["title"]+'</h7><br>'+
										'<span><b>Inicio</b>: '+unixToDate(fechaInicio)+'</span><br>'+
										'<span><b>Estado</b>: '+data["entries"][i]["state"]+'</span><br>'+
										'<span><b>IP</b>: '+hostname+'</span><br>'+
										'<span><b>Servicio</b>: '+data["entries"][i]["service"]+'</span><br>'+
										'<span><b>Perfil</b>: '+data["entries"][i]["profile"]+'</span><br>'+
										'<span><b>Descifra</b>: '+data["entries"][i]["descramble"]+'</span><br>'+
										'<span><b>Errores</b>: '+data["entries"][i]["errors"]+'</span>'+
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
					var logo="<img src='img/sin-logo.png'>";
					if(data["idCanal"]!=""){
						logo = "<img src='img/canales/"+data['idCanal']+".png'>";
					}
					$(".logoCanalActivo").html(logo);
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
					var logo="<img class='logoCanal' src='img/sin-logo.png'>";
					for (var i = 0; i < data.length; i++) {
						if(data[i]["idCanal"]!=""){
							logo = "<img class='logoCanal' src='img/canales/"+data[i]["idCanal"]+".png'>";
						}
						texto+='<a class="list-group-item list-group-item-action">'+
							'<div class="media">'+
								'<div class="media-body">'+
									'<div class="row">'+
										'<div class="col-sm-2">'+
											logo+
										'</div>'+
										'<div class="col-sm-10">'+
											'<strong>'+data[i]["usuario"]+'</strong> ha empezado a reproducir <strong>'+data[i]["canal"]+'</strong>.'+
											'<div class="text-muted smaller">'+data[i]["inicio"]+'</div>'+
										'</div>'+
									'</div>'+
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
					var logo="<img class='logoCanal' src='img/sin-logo.png'>";
					for (var i = 0; i < data.length; i++) {
						if(data[i]["idCanal"]!=""){
							logo = "<img class='logoCanal' src='img/canales/"+data[i]["idCanal"]+".png'>";
						}
						texto+='<a class="list-group-item list-group-item-action">'+
							'<div class="media">'+
								'<div class="media-body">'+
									'<div class="row">'+
										'<div class="col-sm-2">'+
											logo+
										'</div>'+
										'<div class="col-sm-10">'+
											'<strong>'+data[i]["usuario"]+'</strong> ha empezado a reproducir <strong>'+data[i]["canal"]+'</strong>.'+
											'<div class="text-muted smaller">'+data[i]["fin"]+'</div>'+
										'</div>'+
									'</div>'+
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
		if(arrayConfiguracion["ip_permitida"]!=""){
			var ips = separar_comas(arrayConfiguracion["ip_permitida"]);
			if(ips==null){
				ips=[arrayConfiguracion["ip_permitida"]];
			}
			var input_ip="";
			if(ips != null){
				for (var i = 0; i < ips.length; i++) {
					input_ip += '<div class="form-group col-md-3">'+
						'<input type="text" class="form-control input_ip" id="ip_'+i+'" name="ip_'+i+'" value="'+ips[i]+'">'+
					'</div>'+
					'<div class="form-group mt-2 col-md-1">'+
						'<a class="btnQuitarIP"><i class="fas fa-trash-alt"></i></a>'+
					'</div>';
				}
				$(".contenedor_ip").html(input_ip);
			}
		}

		if(arrayConfiguracion["telegram_notificacion"]==1){
			$("#telegram_notificacion").prop('checked', true);
			$("#configuracionTelegram").show();
		}else if(arrayConfiguracion["telegram_notificacion"]==0){
			$("#telegram_notificacion").prop('checked', false);
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

		if(arrayConfiguracion["telegram_conexion"]==1){
			$("#telegram_conexion").prop('checked', true);
			$("#div_telegram_conexion").show();
		}else if(arrayConfiguracion["telegram_conexion"]==0){
			$("#telegram_conexion").prop('checked', false);
			$("#div_telegram_conexion").hide();
		}

		if(arrayConfiguracion["telegram_empieza_grabacion"]==1){
			$("#telegram_empieza_grabacion").prop('checked', true);
			$("#div_telegram_empieza_grabacion").show();
		}else if(arrayConfiguracion["telegram_empieza_grabacion"]==0){
			$("#telegram_empieza_grabacion").prop('checked', false);
			$("#div_telegram_empieza_grabacion").hide();
		}

		if(arrayConfiguracion["telegram_para_grabacion"]==1){
			$("#telegram_para_grabacion").prop('checked', true);
			$("#div_telegram_para_grabacion").show();
		}else if(arrayConfiguracion["telegram_para_grabacion"]==0){
			$("#telegram_para_grabacion").prop('checked', false);
			$("#div_telegram_para_grabacion").hide();
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
		$("#texto_conexion").val(arrayConfiguracion["texto_conexion"]);
		$("#texto_empieza_grabacion").val(arrayConfiguracion["texto_empieza_grabacion"]);
		$("#texto_para_grabacion").val(arrayConfiguracion["texto_para_grabacion"]);
		$("#texto_conexion").val(arrayConfiguracion["texto_conexion"]);
		$("#telegram_tiempo_limite").val(arrayConfiguracion["telegram_tiempo_limite"]);
		$("#bot_token").val(arrayConfiguracion["bot_token"]);
		$("#id_chat").val(arrayConfiguracion["id_chat"]);
	}
	function guardarConfiguracionFormulario(){
		$("#telegram_notificacion").click(function() {
			if ($('#telegram_notificacion').is(":checked")){
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

		$("#telegram_conexion").click(function() {
			if ($('#telegram_conexion').is(":checked")){
				$("#div_telegram_conexion").show();
			}else{
				$("#div_telegram_conexion").hide();
			}
		});

		$("#telegram_empieza_grabacion").click(function() {
			if ($('#telegram_empieza_grabacion').is(":checked")){
				$("#div_telegram_empieza_grabacion").show();
			}else{
				$("#div_telegram_empieza_grabacion").hide();
			}
		});

		$("#telegram_para_grabacion").click(function() {
			if ($('#telegram_para_grabacion').is(":checked")){
				$("#div_telegram_para_grabacion").show();
			}else{
				$("#div_telegram_para_grabacion").hide();
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
					//console.log(data);
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
					//console.log("Mensaje enviado");
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
	function btnAnadirIP(){
		$( ".btnAnadirIP" ).click(function() {
			numIP = $(".input_ip").length;
			//console.log(numIP);
			var input_ip = '<div class="form-group col-md-3">'+
							'<input type="text" class="form-control input_ip" id="ip_'+numIP+'" name="ip_'+numIP+'" placeholder="192.168.1">'+
						'</div>'+
						'<div class="form-group mt-2 col-md-1">'+
							'<a class="btnQuitarIP"><i class="fas fa-trash-alt"></i></a>'+
						'</div>';
			$(".contenedor_ip").append(input_ip);
		});
	}
	function btnQuitarIP(){
		$('body').on('click', '.btnQuitarIP', function (){
			(($(this).parent()).prev()).remove();
			($(this).parent()).remove();
		});
	}
	function btnBackup(){
		$( ".btnBackup" ).click(function() {
			$.ajax({
				type: "POST",
				url: "acciones/phpBackupZip.php",
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					if(data != "ko"){
						$(".configuracionBackup").fadeTo(2000, 500).slideUp(500, function(){
							$(".configuracionBackup").slideUp(500);
						});
						document.location.href = "bd_backup/"+data;
					}else{
						$(".errorGeneral").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorGeneral").slideUp(500);
						});
					}
				}
			});
		});
	}
	function btnRestaurarBackup(){
		$( ".btnRestaurarBackup" ).click(function() {
			var basedatos = $('#basedatos').prop('files')[0];
			var form_data = new FormData();
			form_data.append('basedatos', basedatos);
			$.ajax({
				url: "acciones/phpRestaurarBackup.php",
				cache: false,
				contentType: false,
				processData: false,
				data: form_data,
				type: "POST",
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					if(data == "ok"){
						$(".configuracionRestaurar").fadeTo(2000, 500).slideUp(500, function(){
							$(".configuracionRestaurar").slideUp(500);
						});
						setTimeout(function() {
							window.location.reload();
						}, 2000);
					}else{
						$(".errorGeneral").fadeTo(2000, 500).slideUp(500, function(){
							$(".errorGeneral").slideUp(500);
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
			columnDefs: [
				{ className: "divLogo", "targets": [ 1 ] }
			],
			columns: [
				{data: "1"},
				{data: null,
					render: function (data, type, row) {
						var logo = "<img class='logo' width='100' src='img/canales/"+row[0]+".png'>";
						return logo;
					}
				},
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
				{
					extend: 'print',
					text: 'Imprimir',
					autoPrint: false,
					exportOptions: {
						modifier: {
							page: 'current'
						}
					}
				},
				{
					extend: 'csv',
					text: 'CSV',
					exportOptions: {
						modifier: {
							page: 'current'
						}
					}
				},
				{
					extend: 'pdf',
					text: 'PDF',
					exportOptions: {
						modifier: {
							page: 'current'
						}
					}
				},
				{
					extend: 'copy',
					text: 'Copiar',
					exportOptions: {
						modifier: {
							page: 'current'
						}
					}
				},
				'colvis'
			],
			order: [[ 2, "desc" ]],
			columns: [
				{data: "1"},
				{data: "2"},
				{data: "3"},
				{data: "4"},
				{data: null,
					render: function (data, type, row) {
						ip = comprobarIP(arrayConfiguracion["ip_permitida"], data[5]);
						return ip;
					}
				},
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
			createdRow: function (row, data, dataIndex) {
				colorearIP(arrayConfiguracion["ip_permitida"], data[5], row)
			},
			initComplete: function() {
				table.columns().every( function (){
					var that = this;
					$('input', this.footer()).on('keyup change', function (){
						if ( that.search() !== this.value ) {
							that.search(this.value).draw();
						}
					});
				});
			},
			i18n: {
				create: {
					button: "print",
					title:  "Imprimir",
				},
			}
		});
		table.select();
	}
	function localizarIP(){
		$('body').on('click', '.localizarIP', function (){
			var ip = $(this).text();
			var form_data = new FormData();
			form_data.append('ip', ip);
			$.ajax({
				url: "acciones/phpLocalizarIP.php",
				cache: false,
				contentType: false,
				processData: false,
				data: form_data,
				type: "POST",
				success: function (data) {
					if(data != "ko"){
						var data = JSON.parse(data);
						$(".ipModal").text(ip);
						$(".codigoPais").text(data[0]["codigoPais"]);
						$(".pais").text(data[0]["pais"]);
						$(".codigoSubdivision").text(data[0]["codigoSubdivision"]);
						$(".subdivision").text(data[0]["subdivision"]);
						$(".codigoCiudad").text(data[0]["codigoCiudad"]);
						$(".ciudad").text(data[0]["ciudad"]);
						$(".radio").text(data[0]["radio"]);
						$(".latitud").text(data[0]["latitud"]);
						$(".longitud").text(data[0]["longitud"]);
						$("#myModal").modal();
					}else{
						$(".ipNo").fadeTo(2000, 500).slideUp(500, function(){
							$(".ipNo").slideUp(500);
						});
					}
				}
			});
		});
	}
	/*** Página Estadisticas ***/
	function graficaCanales(){
		var semanaAnterior = new Date();
		semanaAnterior.setDate(semanaAnterior.getDate()-7);
		$("#fechaInicioCanal").datepicker("update", semanaAnterior);
		$("#fechaFinCanal").datepicker("update", new Date());
		fechaInicioCanal = moment($('#fechaInicioCanal').datepicker("getDate")).format('YYYY-MM-DD');
		fechaFinCanal = moment($('#fechaFinCanal').datepicker("getDate")).format('YYYY-MM-DD');
		usuario = $("#usuarioCanal").val();
		obtenerGraficaCanales(fechaInicioCanal,fechaFinCanal,usuario);
	}
	function btnAplicarGraficaCanales(){
		$(".btnAplicarGraficaCanal" ).click(function() {
			fechaInicioCanal = moment($('#fechaInicioCanal').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFinCanal = moment($('#fechaFinCanal').datepicker("getDate")).format('YYYY-MM-DD');
			usuario = $("#usuarioCanal").val();
			obtenerGraficaCanales(fechaInicioCanal,fechaFinCanal,usuario);
		});
	}
	function obtenerGraficaCanales(fechaInicioCanal,fechaFinCanal,usuario){
		var formData = new FormData();
		formData.append("fechaInicio", fechaInicioCanal);
		formData.append("fechaFin", fechaFinCanal);
		formData.append("usuario",usuario);
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
		var semanaAnterior = new Date();
		semanaAnterior.setDate(semanaAnterior.getDate()-7);
		$("#fechaInicioDias").datepicker("update", semanaAnterior);
		$("#fechaFinDias").datepicker("update", new Date());
		fechaInicioDias = moment($('#fechaInicioDias').datepicker("getDate")).format('YYYY-MM-DD');
		fechaFinDias = moment($('#fechaFinDias').datepicker("getDate")).format('YYYY-MM-DD');
		usuario = $("#usuarioDias").val();
		obtenerGraficaDias(fechaInicioDias,fechaFinDias,usuario);
	}
	function btnAplicarGraficaDias(){
		$(".btnAplicarGraficaDias" ).click(function() {
			fechaInicioDias = moment($('#fechaInicioDias').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFinDias = moment($('#fechaFinDias').datepicker("getDate")).format('YYYY-MM-DD');
			usuario = $("#usuarioDias").val();
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
				$("#usuarioDias").append(opciones);
				$("#usuarioCanal").append(opciones);
			}
		});
	}

	/*** Página Estadisticas conexiones ***/
	function graficaConexion(){
		var semanaAnterior = new Date();
		semanaAnterior.setDate(semanaAnterior.getDate()-7);
		$("#fechaInicioConexion").datepicker("update", semanaAnterior);
		$("#fechaFinConexion").datepicker("update", new Date());
		fechaInicioCanal = moment($('#fechaInicioConexion').datepicker("getDate")).format('YYYY-MM-DD');
		fechaFinCanal = moment($('#fechaFinConexion').datepicker("getDate")).format('YYYY-MM-DD');
		obtenerGraficaConexion(fechaInicioCanal,fechaFinCanal);
	}
	function btnAplicarGraficaConexion(){
		$(".btnAplicarGraficaConexion" ).click(function() {
			fechaInicioCanal = moment($('#fechaInicioConexion').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFinCanal = moment($('#fechaFinConexion').datepicker("getDate")).format('YYYY-MM-DD');
			obtenerGraficaConexion(fechaInicioCanal, fechaFinCanal);
		});
	}
	function obtenerGraficaConexion(fechaInicioCanal,fechaFinCanal){
		var formData = new FormData();
		formData.append("fechaInicio", fechaInicioCanal);
		formData.append("fechaFin", fechaFinCanal);
		$.ajax({
			type: "POST",
			url: "acciones/phpGraficaConexion.php",
			data : formData,
			contentType : false,
			processData : false,
			beforeSend:function(){
				$(".cargando").toggle();
			},
			success: function (data) {
				var chart = AmCharts.makeChart("graficaConexion", {
					"type": "serial",
					"theme": "none",
					"legend": {
						"horizontalGap": 10,
						"maxColumns": 1,
						"position": "right",
						"useGraphSettings": true,
						"markerSize": 10
					},
					"dataProvider":  JSON.parse(data),
					"valueAxes": [{
						"stackType": "regular",
						"axisAlpha": 0.3,
						"gridAlpha": 0
					}],
					"graphs": [{
							"balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
							"fillAlphas": 0.8,
							"labelText": "[[value]]",
							"lineAlpha": 0.3,
							"title": "Permitidas",
							"type": "column",
							"fillColors": "#bde3b1",
							"color": "#000000",
							"lineColor": "#38d900",
							"lineThickness": 2,
							"valueField": "permitida"
						},{
							"balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
							"fillAlphas": 0.8,
							"labelText": "[[value]]",
							"lineAlpha": 0.3,
							"title": "No Permitidas",
							"type": "column",
							"fillColors": "#f5bfae",
							"color": "#000000",
							"lineColor": "#ea3200",
							"lineThickness": 2,
							"valueField": "no-permitida"
						}
					],
					"categoryField": "fecha",
					"categoryAxis": {
						"gridPosition": "start",
						"axisAlpha": 0,
						"gridAlpha": 0,
						"position": "left"
					},
					"export": {
						"enabled": true
					}
				});
			}
		});

	}

	// function btnAplicarGraficaConexion(){
	// 	var chart;
	// 	/**
	// 		* amCharts plugin: auto-generate data and graphs from series
	// 		* in specific column.
	// 		* Available parameters:
	// 		* seriesField - specifies which column holds series
	// 		* seriesValueField - sepcifies column for series value
	// 		* seriesGraphTemplate - config to use for auto-generated graphs
	// 	*/
	// 	AmCharts.addInitHandler(function(chart) {
	// 		// do nothing if serisField is not set
	// 		if (chart.seriesField === undefined)
	// 			return;
	// 		// get graphs and dataProvider
	// 		var graphs, dataSet;
	// 		if (chart.type === "stock") {
	// 			// use first panel
	// 			if (chart.panels[0].stockGraphs === undefined)
	// 				chart.panels[0].stockGraphs = [];
	// 			graphs = chart.panels[0].stockGraphs;
	// 			dataSet = chart.dataSets[0];
	// 			// check if data set has fieldMappings set
	// 			if (dataSet.fieldMappings === undefined)
	// 				dataSet.fieldMappings = [];
	// 		} else {
	// 			if (chart.graphs === undefined)
	// 				chart.graphs = [];
	// 			graphs = chart.graphs;
	// 			dataSet = chart;
	// 		}
	// 		// collect value fields for graphs that might already exist
	// 		// in chart config
	// 		var valueFields = {};
	// 		if (graphs.length) {
	// 			for (var i = 0; i < graphs.length; i++) {
	// 				var g = graphs[i];
	// 				if (g.id === undefined)
	// 					g.id = i;
	// 				valueFields[g.id] = g.valueField;
	// 			}
	// 		}
	// 		// process data
	// 		var newData = [];
	// 		var dpoints = {};
	// 		for (var i = 0; i < dataSet.dataProvider.length; i++) {
	// 			// get row data
	// 			var row = dataSet.dataProvider[i];
	// 			var category = row[dataSet.categoryField];
	// 			var series = row[chart.seriesField];
	// 			// create a data point
	// 			if (dpoints[category] === undefined) {
	// 				dpoints[category] = {};
	// 				dpoints[category][dataSet.categoryField] = category;
	// 				newData.push(dpoints[category]);
	// 			}
	// 			// check if we need to generate a graph
	// 			if (valueFields[series] === undefined) {
	// 				// apply template
	// 				var g = {};
	// 				if (chart.seriesGraphTemplate !== undefined) {
	// 					g = cloneObject(chart.seriesGraphTemplate);
	// 				}
	// 				g.id = series;
	// 				g.valueField = series;
	// 				g.title = series;
	// 				// add to chart's graphs
	// 				graphs.push(g);
	// 				valueFields[series] = series;
	// 				// add fieldMapping to data set on Stock Chart
	// 				if (chart.type === "stock") {
	// 					dataSet.fieldMappings.push({
	// 						"fromField": series,
	// 						"toField": series
	// 					});
	// 				}
	// 			}
	// 			// add series value field
	// 			if (row[chart.seriesValueField] !== undefined)
	// 				dpoints[category][series] = row[chart.seriesValueField];
	// 			// add the rest of the value fields (if applicable)
	// 			for (var field in valueFields) {
	// 				if (valueFields.hasOwnProperty(field) && row[field] !== undefined)
	// 					dpoints[category][field] = row[field];
	// 			}
	// 		}
	// 		// set data
	// 		dataSet.dataProvider = newData;
	// 		// function which clones object
	// 		function cloneObject(obj) {
	// 			if (null == obj || "object" != typeof obj) return obj;
	// 			var copy = obj.constructor();
	// 			for (var attr in obj) {
	// 				if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	// 			}
	// 			return copy;
	// 		}
	// 	}, ["serial", "stock"]);
	//
	// 	$(".btnAplicarGraficaConexion" ).click(function() {
	// 		fechaInicioCanal = moment($('#fechaInicioConexion').datepicker("getDate")).format('YYYY-MM-DD');
	// 		fechaFinCanal = moment($('#fechaFinConexion').datepicker("getDate")).format('YYYY-MM-DD');
	// 		obtenerGraficaConexion(fechaInicioCanal, fechaFinCanal, chart);
	// 	});
	// }
	// function obtenerGraficaConexion(fechaInicioCanal,fechaFinCanal, chart){
	// 	var formData = new FormData();
	// 	formData.append("fechaInicio", fechaInicioCanal);
	// 	formData.append("fechaFin", fechaFinCanal);
	// 	$.ajax({
	// 		type: "POST",
	// 		url: "acciones/phpGraficaConexion.php",
	// 		data : formData,
	// 		contentType : false,
	// 		processData : false,
	// 		beforeSend:function(){
	// 			$(".cargando").toggle();
	// 		},
	// 		success: function (data) {
	// 			if (chart) {
	// 				chart.clear();
	// 			}
	// 			chart = AmCharts.makeChart( "graficaConexion", {
	// 				"type": "serial",
	// 				"theme": "light",
	// 				"dataDateFormat": "YYYY-MM-DD",
	// 				"seriesField": "tipo",
	// 				"seriesValueField": "valor",
	// 				"seriesGraphTemplate": {
	// 					"lineThickness": 2,
	// 					"bullet": "round"
	// 				},
	// 				"categoryField": "fecha",
	// 				"categoryAxis": {
	// 					"parseDates": true,
	// 					"dashLength": 1,
	// 					"minorGridEnabled": true
	// 				},
	// 				"valueAxes": [{
	// 					"stackType": "regular"
	// 				}],
	// 				"chartScrollbar": {
	// 					"scrollbarHeight": 12
	// 				},
	// 				"chartCursor": {
	// 					"valueLineEnabled": true,
	// 					"valueLineBalloonEnabled": true,
	// 					"fillColor": "#FFFFFF"
	// 				},
	// 				"legend": {
	// 					"position": "right"
	// 				},
	// 				"dataProvider":  JSON.parse(data),
	// 			});
	// 		}
	// 	});
	//
	// }


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
		$(".navbar-nav").removeClass("toggled");
		$("body").removeClass("sidebar-toggled");
	}
	function cerrarNav(){
		$(".navbar-nav").addClass("toggled");
		$("body").addClass("sidebar-toggled");
	}
	function irArriba(){
		$('body,html').animate({scrollTop : 0}, 500);
	}
	function colorearIP(ip_permitida, data, row){
		var ip = partirIP(data);
		var resultado;
		if(ip_permitida == "" || ip == ""){
			resultado = "Permitida: "+data;
			$(row).css('background-color', '#bde3b1');
		}else{
			var ips = separar_comas(ip_permitida);
			var row = row;
			var permitida = "no";
			if(ips != null){
				for (var i = 0; i < ips.length; i++) {
					if(ips[i]==ip){
						permitida = "si";
					}
				}
				if(permitida == "si"){
					resultado = "Permitida: "+data;
					$(row).css('background-color', '#bde3b1');
				}else if (permitida == "no"){
					resultado = "No permitida: "+data;
					$(row).css('background-color', '#f5bfae');
				}
			}else {
				ips=ip_permitida;
				if(ips==ip){
					resultado = "Permitida: "+data;
					$(row).css('background-color', '#bde3b1');
				}else{
					resultado = "No permitida: "+data;
					$(row).css('background-color', '#f5bfae');
				}
			}
		}
		return resultado;
	}
	function comprobarIPInicio(ip_permitida, data){
		var ips = separar_comas(ip_permitida);
		var ip = partirIP(data);
		var resultado;
		var row = row;
		var permitida = "no";
		if(ip_permitida == ""  || ip == ""){
			resultado = "<span class='permitida'>Permitida: <a class='localizarIP'>"+data+"</a></span>";
		}else if(ips != null){
			for (var i = 0; i < ips.length; i++) {
				if(ips[i]==ip){
					permitida = "si";
				}
			}
			if(permitida == "si"){
				resultado = "<span class='permitida'>Permitida: <a class='localizarIP'>"+data+"</a></span>";
			}else if (permitida == "no"){
				resultado = "<span class='no-permitida'>No permitida: <a class='localizarIP'>"+data+"</a></span>";
			}
		}else {
			ips=ip_permitida;
			if(ips==ip){
				resultado = "<span class='permitida'>Permitida: <a class='localizarIP'>"+data+"</a></span>";
			}else{
				resultado = "<span class='no-permitida'>No permitida: <a class='localizarIP'>"+data+"</a></span>";
			}
		}
		return resultado;
	}
	function comprobarIP(ip_permitida, data){
		var ips = separar_comas(ip_permitida);
		var ip = partirIP(data);
		var resultado;
		var row = row;
		var permitida = "no";
		if(ip_permitida == ""  || ip == ""){
			resultado = "<span>Permitida: <a class='localizarIP'>"+data+"</a></span>";
		}else if(ips != null){
			for (var i = 0; i < ips.length; i++) {
				if(ips[i]==ip){
					permitida = "si";
				}
			}
			if(permitida == "si"){
				resultado = "<span>Permitida: <a class='localizarIP'>"+data+"</a></span>";
			}else if (permitida == "no"){
				resultado = "<span>No permitida: <a class='localizarIP'>"+data+"</a></span>";
			}
		}else {
			ips=ip_permitida;
			if(ips==ip){
				resultado = "<span>Permitida: <a class='localizarIP'>"+data+"</a></span>";
			}else{
				resultado = "<span>No permitida: <a class='localizarIP'>"+data+"</a></span>";
			}
		}
		return resultado;
	}
	function partirIP(ip){
		ipfinal="";
		if(ip != "localhost"){
			partesIP = ip.split(".");
			ipfinal = partesIP[0]+"."+partesIP[1]+"."+partesIP[2];
		}
		return ipfinal;
	}
	function separar_comas(CommaSepStr) {
		var ResultArray = null;
		if (CommaSepStr!= null) {
			var SplitChars = ',';
			if (CommaSepStr.indexOf(SplitChars) >= 0) {
				ResultArray = CommaSepStr.split(SplitChars);
			}
		}
		return ResultArray ;
	}
});
