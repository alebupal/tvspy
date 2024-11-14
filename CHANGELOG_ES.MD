# Changelog TVSPY

## [3.0.3] - 2024-11-14

- Añadir modo debug

## [3.0.2] - 2024-11-11

- Actualización de dependencias a las últimas versiones, añadir TZ y LOCALE.

## [3.0.1] - 2024-08-26

- Seguridad: Actualización de dependencias a las últimas versiones para mejorar la seguridad y la estabilidad.

## [3.0.0] - 2024-08-26

- Backend: Migración del backend a Node.js.
- Frontend: Reconstrucción del frontend utilizando React.js.
- Base de datos: Implementación de MySQL Lite.
- Conexión: Uso de WebSocket para la conexión con TVHeadend.
- En español e inglés

## [2.0.2] - 2019-01-03

- Añadidos logos de canales a la hora de importarlos.
- Añadidos logos en la página de inicio

## [2.0.1] - 2018-12-29

- Arreglado fallo que no notificaba al empezar una reproducción
- Añadido selector de usuarios a la gráfica Tiempo reproducido por canal (Minutos)

## [2.0.0] - 2018-12-05

- Cambios en la BD, anteriores versiones no son compatibles
- Añadidos colores a registro según este o no esté permitida la conexión.
- En configuración se pueden añadir las ip permitidas
- Localización de ip
- Reestructuración configuración
- Reestructuración menú
- Actualizada plantilla base de Bootstrap
- Añadida posibilidad de backup y restaurar la base de datos.
- Compatibilidad si TvHeadend está en inglés.
- Reestructuración del fichero dockerfile para mejorar compatibilidad
- Comprueba si hay una versión nueva
- Notificación por telegram cuando empieza o para de grabar
- Se registra cuando se graba algo, en la opción de reproductor sale como: "Grabando:"
- Si existe el archivo /var/www/html/bd_backup/backup.sql se importa al principio

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

- Correción, no salía la fecha en el mensaje de Telegram

## [1.2.0] - 2018-06-01

- El tiempo en la base de datos ahora se guarda en segundos
- Posibilidad de seleccionar unidad de tiempo a utilizar en la web
- Añadida la posibilidad de poner un tiempo mínimo para que se añada como registro

## [1.1.0] - 2018-05-31

- Añadir filtro de fechas en las gráficas
- Evitar que se meta en la base de datos cuando TvHeadend esté escaneando
- Corrección para levantar el servicio MySQL y apache

## [1.0.0] - 2018-05-25

- Estable