## [1.2.5.1] - dev - 2018-11-24
- Añadida opción del registro de conexiones para ver facilmente conexiones no deseadas.
- Reestructuración configuración
- Reestructuración menú
- Actulizada plantilla base de bootstrap

## [1.2.4] - 2018-06-21
- La API de TVHeadend repite id, por lo que a partir de ahora para identificar las reproducciones se utiliza el id y el tiempo de Inicio
- Redondeo del tiempo en la tabla Registro
- Cambiado el title del menú Inicio
- Ahora el idReproduccion de la BD es un varchar 200

## [1.2.3] - 2018-06-01
- Correción notificación doble

## [1.2.2] - 2018-06-01
- Correción notificación tiempo de más

## [1.2.1] - 2018-06-01
- Correción, no salía la fecha en el mensaje de telegram

## [1.2.0] - 2018-06-01
- El tiempo en la base de datos ahora se guarda en segundos
- Posibilidad de seleccionar unidad de tiempo a utilizar en la web
- Añadida la posibilidad de poner un tiempo mínimo para que se añada como registro

## [1.1.0] - 2018-05-31
- Añadir filtro de fechas en las gráficas
- Evitar que se meta en la base de datos cuando TvHeadend esté escaneando
- Correción para levantar el servicio mysql y apache

## [1.0.0] - 2018-05-25
- Estable
