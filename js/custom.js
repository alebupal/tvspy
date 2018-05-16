$(document).ready(function () {

	if ( $(".pagina-canales").length > 0 ) {
		tablaCanales();
	}
	importarCanales();

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
			  setInterval(descargarFichero, (arrayConfig["refresco"]*1000));
			}


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

	function importarCanales(){
		$.ajax({
			type: "POST",
			url: "acciones/importarCanales.php",
			success: function (data) {
				if(data==true){
					console.log("Canales importados correctamente");
				}else if(data=="repedito"){
					console.log("Canales importados anteriormente");
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

});
