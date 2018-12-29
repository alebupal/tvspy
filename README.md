# TVSPY 2.0.1

Aplicación web para monitorizar TvHeadend

La aplicación está realizada en PHP, MYSQL y JS. Hay un cron que se ejecuta cada cierto tiempo, el cual va guardando los registros que hay en la API de TvHeadend, después con estos datos se elaboran las estadísticas. Permite enviar notificaciones a Telegram.

Para asegurar un mejor funcionamiento es recomendable tener TvHeadend en español.

## Características
- Ver quien está conectado actualmente
- Registro de todas las reproducciones y grabaciones
- Notificación en Telegram de cuando alguien empieza o para de reproducir o grabar
- Localización de ip (This product includes GeoLite2 data created by MaxMind, available from <a href="http://www.maxmind.com">http://www.maxmind.com</a>.)
- Poner ip permitidas para localizar pirateo de TvHeadend rápidamente
- Estadísticas de uso
- Estadísticas de conexiones
- Notificación por Telegram cuando alguien lleva x tiempo reproduciendo.

## Instalación
Para utilizarla basta con instalar la imagen de docker https://hub.docker.com/r/alebupal/tvspy/ y configurar la aplicación con la ip y puerto de TvHeadend en la opción configuración.

Para crear la imagen de docker me he basado en https://github.com/mattrayner/docker-lamp .
La imagen tiene PHP 7.2, MYSQL, PHPMyAdmin y apache.

Para acceder a PHPMyAdmin la ruta es: http://IP_DOCKER:PORT_DOCKER/phpmyadmin y para acceder a la aplicación http://IP_DOCKER:PORT_DOCKER

Se puede cambiar el tiempo de actualización de la base de datos con datos de televisión con la variable de entorno: TIME_CRON

Tiempo en segundos.

No garantizo que funcione con menos de 15 segundos.

Gracias a @Spufy por sus consejos para montar la imagen.

[Capturas](https://github.com/alebupal/tvspy/tree/master/capturas)

Si no hay conexión entre tvspy y TvHeadend, os sale constantemente login incorrecto o sale algo como "505 HTTP/RTSP Version Not Supported" hay que asegurarse de que en configuración>general>base>HTTP Server Settings>Authentication type debe estar seleccionado "Both plain and digest"


Nombre base datos: tvspy

Usuario base datos: tvspy

Contraseña base datos: tvspy

## Instalación

```
docker create  \
	--name=tvspy \
	-v <path to data>:/var/www/html/bd_backup \
	-p xxxxx:80 \
	-e TIME_CRON=15 \
	alebupal/tvspy:latest \
```

Si hay un archivo backup.sql en la carpeta /var/www/html/bd_backup que se ha mapeado se restaura al crear el contenedor.
Comprobar en el CHANGELOG(https://github.com/alebupal/tvspy/blob/master/CHANGELOG.md) si la nueva versión trae cambios en la BD ya que si la versión .sql que se importa es distinta a la del contenedor este no funcionara.

## Copia de seguridad BD
Cada día se realiza una copia de seguridad de la base de datos en "/var/www/html/bd_backup/backup.sql" es aconsejable mapear esta carpeta para tener acceso a ella en caso de problemas.

Se puede hacer y restaurar una copia de seguridad de la base de datos en la opción configuración.

## Canal telegram (https://t.me/alebupal_tvspy)

## Docker (https://hub.docker.com/r/alebupal/tvspy/)

## Changelog (https://github.com/alebupal/tvspy/blob/master/CHANGELOG.md)

## Donación (https://www.paypal.me/alebupal)
