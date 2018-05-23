$(document).ready(function () {
	var arrayConfig = new Array();

	leerConfig('config.json');

	function leerConfig(fileLocation){
		$.ajaxSetup({
		  cache:false
		});
		$.getJSON(fileLocation).done(function( json ) {
			arrayConfig = json;
		 	console.log("Configuración leida");

			if ( $(".pagina-configuracion").length > 0 ) {
				cargarConfiguracion();
				guardarConfiguracion();
				btnBackup();
			}
			if ( $(".pagina-estadisticas").length > 0 ) {
				graficaCanales();
				graficaUsuarios();
				btnAplicarGrafica();
			}
			if ( $(".pagina-inicio").length > 0 ) {
				descargarFichero();
				setInterval(descargarFichero, (arrayConfig["refresco"]*1000));
				usuarioActivo();
				canalActivo();
				reproduccionesTotales();
				ultimasReproducciones();
				ultimasFinalizaciones();
			}

			/*if(arrayConfig["importar"]=="false"){
				importarUsuariosCanales();

			}*/

			if ( $(".pagina-canales").length > 0 ) {
				importarCanales();
				tablaCanales();
				btnImportarCanales();
				$(".enlaceLogueo").attr("href","http://"+arrayConfig["ip"]+":"+arrayConfig["puerto"]+"/extjs.html");
				$(".enlaceLogueo").html("https://"+arrayConfig["ip"]+":"+arrayConfig["puerto"]);
			}
			if ( $(".pagina-usuarios").length > 0 ) {
				tablaUsuarios();
				importarUsuarios();
				btnImportarUsuarios();
			}
			if ( $(".pagina-registro").length > 0 ) {
				tablaRegistro();
				$(".enlaceLogueo").attr("href","http://"+arrayConfig["ip"]+":"+arrayConfig["puerto"]+"/extjs.html");
				$(".enlaceLogueo").html("https://"+arrayConfig["ip"]+":"+arrayConfig["puerto"]);
			}
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	}

	function leerConfigBasica(fileLocation){
		$.getJSON(fileLocation).done(function( json ) {
			arrayConfig = json;
			console.log("Configuración basica leida");
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	}

	function cargarConfiguracion(){
		$("#ip").val(arrayConfig["ip"]);
		$("#puerto").val(arrayConfig["puerto"]);
		$("#pass").val(arrayConfig["pass"]);
		$("#usuario").val(arrayConfig["usuario"]);
		$("#refresco").val(arrayConfig["refresco"]);
		$("#refresco").val(arrayConfig["refresco"]);
		if(arrayConfig["notificacion_telegram"]=="true"){
			$("#notificacion_telegram").prop('checked', true);
			$("#configuracionTelegram").show();
		}else if(arrayConfig["notificacion_telegram"]=="false"){
			$("#notificacion_telegram").prop('checked', false);
			$("#configuracionTelegram").hide();
		}
		$("#texto_empieza").val(arrayConfig["texto_empieza"]);
		$("#texto_para").val(arrayConfig["texto_para"]);

		//$("#importar").val(arrayConfig["importar"]);
		$("#bot_token").val(arrayConfig["bot_token"]);
		$("#id_chat").val(arrayConfig["id_chat"]);
	}

	function guardarConfiguracion(){
		$("#notificacion_telegram").click(function() {
			if ($('#notificacion_telegram').is(":checked")){
				$("#configuracionTelegram").show();
			}else{
				$("#configuracionTelegram").hide();
			}
		});
		$('#formConfiguracion').on('submit', function(e){
			e.preventDefault();
			var form = $('#formConfiguracion')[0];
			var formData = new FormData(form);
			$.ajax({
				type: "POST",
				url: "acciones/guardarConfiguracion.php",
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
	//Con el cron se quitará este método para no descargalo varias veces
	function descargarFichero(){
		$.ajax({
			type: "POST",
			url: "acciones/descargar.php",
			success: function (data) {
				if(data==true){
					console.log("Descargado con exito");
					leerResultadoJson();
				}else if(data=="404"){
					console.log("error, url no existe");
				}else if(data=="401"){
					console.log("error, usuario o contraseña incorrecta");
				}else{
					console.log("Error desconocido al descargar");
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
					usuarioMas = $.parseJSON(data);
					$(".usuarioActivo").html(usuarioMas["usuario"]);
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
					canalMas = $.parseJSON(data);
					$(".canalActivo").html(canalMas["canal"]);
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
					reproduccionesTotales = $.parseJSON(data);
					$(".reproduccionesTotales").html(reproduccionesTotales["total"]);
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
					ultimasReproducciones = $.parseJSON(data);
					var texto ="";
					for (var i = 0; i < ultimasReproducciones.length; i++) {
						texto+='<a class="list-group-item list-group-item-action">'+
							'<div class="media">'+
								'<div class="media-body">'+
									'<strong>'+ultimasReproducciones[i]["usuario"]+'</strong> ha empezado a reproducir <strong>'+ultimasReproducciones[i]["canal"]+'</strong>.'+
									'<div class="text-muted smaller">'+ultimasReproducciones[i]["inicio"]+'</div>'+
								'</div>'+
							'</div>'+
						'</a>';
					}

					$(".ultimasReproducciones").html(texto);
				}else{
					$(".canalActivo").html("--");
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
					ultimasFinalizaciones = $.parseJSON(data);
					var texto ="";
					for (var i = 0; i < ultimasFinalizaciones.length; i++) {
						texto+='<a class="list-group-item list-group-item-action">'+
							'<div class="media">'+
								'<div class="media-body">'+
									'<strong>'+ultimasFinalizaciones[i]["usuario"]+'</strong> ha parado de reproducir <strong>'+ultimasFinalizaciones[i]["canal"]+'</strong>.'+
									'<div class="text-muted smaller">'+ultimasFinalizaciones[i]["fin"]+'</div>'+
								'</div>'+
							'</div>'+
						'</a>';
					}

					$(".ultimasFinalizaciones").html(texto);
				}else{
					$(".canalActivo").html("--");
				}
			}
		});
	}

	function leerResultadoJson(){
		$.getJSON("acciones/resultado.json").done(function( json ) {
			var resultadoJson = new Array();
			resultadoJson = $.parseJSON(json);
			console.log("Resultado Json leido");
			//console.log(resultadoJson);
			var html="";
			for (var i = 0; i < resultadoJson["totalCount"]; i++) {
				html +='<div class="col-xl-4 col-sm-6 mb-3">'+
					'<div class="card">'+
						'<div class="card-body">'+
							'<h6 class="card-title"><b>'+resultadoJson["entries"][i]["username"]+'</b> está reproduciendo <b>'+resultadoJson["entries"][i]["channel"]+'</b></h6>'+
							'<h7 class="card-subtitle mb-2 text-muted">'+resultadoJson["entries"][i]["title"]+'</h7><br>'+
							'<span><b>State</b>: '+resultadoJson["entries"][i]["state"]+'</span><br>'+
							'<span><b>IP</b>: '+resultadoJson["entries"][i]["hostname"]+'</span><br>'+
							'<span><b>Service</b>: '+resultadoJson["entries"][i]["service"]+'</span><br>'+
							'<span><b>Profile</b>: '+resultadoJson["entries"][i]["profile"]+'</span>'+
							'</div>'+
					'</div>'+
				'</div>';
			}
			$(".divReproduccion").html(html);
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	}

	function btnImportarCanales(){
		$( ".btnImportarCanales" ).click(function() {
			$.ajax({
				type: "POST",
				url: "acciones/importarCanales.php",
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();
					tablaCanales();
					if(data==true){
						console.log("Canales importados correctamente");
						$(".canalesImportados").fadeTo(2000, 500).slideUp(500, function(){
							$(".canalesImportados").slideUp(500);
						});
					}else if(data=="404"){
						console.log("error, url no existe");
					}else if(data=="401"){
						console.log("error, usuario o contraseña incorrecta");
					}else{
						console.log("Error al importar usuarios");
					}
				}
			});
		});
	}

	function importarCanales(){
		$.ajax({
			type: "POST",
			url: "acciones/importarCanales.php",
			//async: false,
			success: function (data) {
				if(data==true){
					console.log("Canales importados correctamente");
				}else if(data=="404"){
					console.log("error, url no existe");
				}else if(data=="401"){
					console.log("error, usuario o contraseña incorrecta");
				}else{
					console.log("Error al importar canales");
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
				url: "vendor/datatables/i18n/Spanish.json"
			},
			ajax: {
				url: "acciones/phpCanales.php",
				type: 'POST'
			},
			responsive: true,
			/*destroy: true,
			processing: true,*/
			destroy: true,
			iDisplayLength: 5,
			lengthMenu: [
				[5, 10, 25, 50, 100, -1],
				[5, 10, 25, 50, 100, "Todo"] // change per page values here
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

	function btnImportarUsuarios(){
		$(".btnImportarUsuarios").click(function() {
			$.ajax({
				type: "POST",
				url: "acciones/importarUsuarios.php",
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
					}else if(data=="404"){
						console.log("error, url no existe");
					}else if(data=="401"){
						console.log("error, usuario o contraseña incorrecta");
					}else{
						console.log("Error al importar usuarios");
					}
				}
			});
		});
	}
	function importarUsuarios(){
		$.ajax({
			type: "POST",
			url: "acciones/importarUsuarios.php",
			success: function (data) {
				if(data==true){
					console.log("Usuarios importados correctamente");
				}else if(data=="404"){
					console.log("error, url no existe");
				}else if(data=="401"){
					console.log("error, usuario o contraseña incorrecta");
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
				url: "vendor/datatables/i18n/Spanish.json"
			},
			ajax: {
				url: "acciones/phpUsuarios.php",
				type: 'POST'
			},
			responsive: true,
			/*destroy: true,
			processing: true,*/
			destroy: true,
			iDisplayLength: 5,
			lengthMenu: [
				[5, 10, 25, 50, 100, -1],
				[5, 10, 25, 50, 100, "Todo"] // change per page values here
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
	/*function importarUsuariosCanales(){
		var formData = new FormData();
		formData.append("ip", arrayConfig["ip"]);
		formData.append("puerto", arrayConfig["puerto"]);
		formData.append("pass", arrayConfig["pass"]);
		formData.append("usuario", arrayConfig["usuario"]);
		formData.append("refresco", arrayConfig["refresco"]);
		formData.append("refrescoCron", arrayConfig["refrescoCron"]);
		formData.append("bot_token", arrayConfig["bot_token"]);
		formData.append("id_chat", arrayConfig["id_chat"]);
		$.ajax({
			type: "POST",
			url: "acciones/importarUsuariosCanales.php",
			data : formData,
			contentType : false,
			processData : false,
			//async: false,
			success: function (data) {
				if(data==true){
					console.log("Usuarios y canales importados correctamente");
					//leerConfigBasica('config.json');
					arrayConfig["importar"]= "true";
				}else if(data=="404"){
					console.log("error, url no existe");
				}else if(data=="401"){
					console.log("error, usuario o contraseña incorrecta");
				}else{
					console.log("Error al importar usuarios y canales");
				}
			}
		});
	}*/

	function tablaRegistro(){
		$('#tablaRegistro tfoot th').each( function () {
			var title = $('#tablaRegistro thead th').eq( $(this).index() ).text();
			$(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
		} );
		var table = $('#tablaRegistro').DataTable({
			language: {
				url: "vendor/datatables/i18n/Spanish.json"
			},
			ajax: {
				url: "acciones/phpRegistro.php",
				type: 'POST'
			},
			responsive: true,
			/*destroy: true,
			processing: true,*/
			destroy: true,
			iDisplayLength: 5,
			lengthMenu: [
				[5, 10, 25, 50, 100, -1],
				[5, 10, 25, 50, 100, "Todo"] // change per page values here
			],
			order: [[ 0, "asc" ]],
			columns: [
				{data: "1"},
				{data: "2"},
				{data: "3"},
				{data: "4"}
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
	function btnBackup(){
		$(".btnBackup").click(function() {
			$.ajax({
				type: "POST",
				url: "acciones/backup.php",
				beforeSend:function(){
					irArriba();
					$(".cargando").toggle();
				},
				success: function (data) {
					$(".cargando").toggle();

					if(data==true){
						console.log("Backup realizado correctamente");
						window.location.href = "backup.sql";
					}else{
						console.log("Error al realizar backup");
					}
				}
			});
		});
	}
	function graficaCanales(){
		$.ajax({
			type: "POST",
			url: "acciones/graficaCanales.php",
			beforeSend:function(){
				irArriba();
				$(".cargando").toggle();
			},
			success: function (data) {
				console.log(data);
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
		$.ajax({
			type: "POST",
			url: "acciones/graficaUsuarios.php",
			beforeSend:function(){
				irArriba();
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
						"tickLength": 20
					},
					"export": {
						"enabled": true
					}
				});
			}
		});

	}
	function btnAplicarGrafica(){
		getUsuariosSelect();
		$("#graficaReproducciones").hide();
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
		$("#fechaInicio").datepicker("update", new Date());
		$("#fechaFin").datepicker("update", new Date());
		$(".btnAplicarGrafica" ).click(function() {
			fechaInicio = moment($('#fechaInicio').datepicker("getDate")).format('YYYY-MM-DD');
			fechaFin = moment($('#fechaFin').datepicker("getDate")).format('YYYY-MM-DD');
			usuario = $("#usuario").val();
			$("#graficaReproducciones").show();
			graficaReproducciones(fechaInicio,fechaFin,usuario);
		});
	}
	function getUsuariosSelect(){
		$.ajax({
			type: "POST",
			url: "acciones/phpUsuariosSelect.php",
			success: function (data) {
				var obj = JSON.parse(data);
				opciones ="";
				for (var i = 0; i < obj.length; i++) {
					opciones += '<option value="'+obj[i]["nombre"]+'">'+obj[i]["nombre"]+'</option>'
				}

				$("#usuario").append(opciones);
			}
		});
	}
	function graficaReproducciones(fechaInicio,fechaFin,usuario){
		var formData = new FormData();
		formData.append("fechaInicio", fechaInicio);
		formData.append("fechaFin", fechaFin);
		formData.append("usuario",usuario);
		$.ajax({
			type: "POST",
			url: "acciones/graficaReproducciones.php",
			data : formData,
			contentType : false,
			processData : false,
			//async: false,
			beforeSend:function(){
				irArriba();
				$(".cargando").toggle();
			},
			success: function (data) {
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
				    "dataProvider": JSON.parse(data)
				});
			}
		});
	}

	function irArriba(){
		$('body,html').animate({scrollTop : 0}, 500);
	}
});
