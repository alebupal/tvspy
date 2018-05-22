$(document).ready(function () {
	var arrayConfig = new Array();

	leerConfig('config.json');

	function leerConfig(fileLocation){
		$.getJSON(fileLocation).done(function( json ) {
			arrayConfig = json;
			console.log(arrayConfig);
		 	console.log("Configuración leida");

			if ( $(".pagina-configuracion").length > 0 ) {
				cargarConfiguracion();
				guardarConfiguracion();
			}
			if ( $(".pagina-inicio").length > 0 ) {
				descargarFichero();
				setInterval(descargarFichero, (arrayConfig["refresco"]*1000));
			}

			if(arrayConfig["importar"]=="false"){
				importarUsuariosCanales();

			}

			if ( $(".pagina-canales").length > 0 ) {
				tablaCanales();
				btnImportarCanales();
			}
			if ( $(".pagina-usuarios").length > 0 ) {
				tablaUsuarios();
				btnImportarUsuarios();
			}
			if ( $(".pagina-registro").length > 0 ) {
				tablaRegistro();
			}
		}).fail(function( jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	}

	function leerConfigBasica(fileLocation){
		$.getJSON(fileLocation).done(function( json ) {
			arrayConfig = json;
			console.log(arrayConfig);
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
	   $("#importar").val(arrayConfig["importar"]);
	   $("#refrescoCron").val(arrayConfig["refrescoCron"]);
	   $("#bot_token").val(arrayConfig["bot_token"]);
	   $("#id_chat").val(arrayConfig["id_chat"]);
    }

	function guardarConfiguracion(){
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
			var formData = new FormData();
			formData.append("ip", arrayConfig["ip"]);
			formData.append("puerto", arrayConfig["puerto"]);
			formData.append("pass", arrayConfig["pass"]);
			formData.append("usuario", arrayConfig["usuario"]);
			formData.append("refresco", arrayConfig["refresco"]);
			formData.append("importar", arrayConfig["importar"]);
			formData.append("refrescoCron", arrayConfig["refrescoCron"]);
			formData.append("bot_token", arrayConfig["bot_token"]);
			formData.append("id_chat", arrayConfig["id_chat"]);
			$.ajax({
				type: "POST",
				url: "acciones/importarCanales.php",
				data : formData,
				contentType : false,
				processData : false,
				async: false,
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
	function tablaCanales(){
		$('#tablaCanales tfoot th').each( function () {
            var title = $('#tablaCanales thead th').eq( $(this).index() ).text();
            $(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
        } );
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
			var formData = new FormData();
			formData.append("ip", arrayConfig["ip"]);
			formData.append("puerto", arrayConfig["puerto"]);
			formData.append("pass", arrayConfig["pass"]);
			formData.append("usuario", arrayConfig["usuario"]);
			formData.append("refresco", arrayConfig["refresco"]);
			formData.append("importar", arrayConfig["importar"]);
			formData.append("refrescoCron", arrayConfig["refrescoCron"]);
			formData.append("bot_token", arrayConfig["bot_token"]);
			formData.append("id_chat", arrayConfig["id_chat"]);
			$.ajax({
				type: "POST",
				url: "acciones/importarUsuarios.php",
				data : formData,
				contentType : false,
				processData : false,
				async: false,
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
	function tablaUsuarios(){
		$('#tablaUsuarios tfoot th').each( function () {
            var title = $('#tablaUsuarios thead th').eq( $(this).index() ).text();
            $(this).html( '<input type="text" placeholder="Buscar '+title+'" />' );
        } );
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
	function importarUsuariosCanales(){
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
			async: false,
			success: function (data) {
				if(data==true){
					console.log("Usuarios importados correctamente");
					//leerConfigBasica('config.json');
					arrayConfig["importar"]= "true";
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


	function irArriba(){
		$('body,html').animate({scrollTop : 0}, 500);
	}
});
