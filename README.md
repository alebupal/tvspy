# TVSPY 2.0

Aplicación web para monitorizar TvHeadend

La aplicación está realizada en PHP, MYSQL y JS. Hay un cron que se ejecuta cada cierto tiempo, el cual va guardando los registros que hay en la API de TvHeadend, después con estos datos se elaboran las estadísticas. Permite enviar notificaciones a Telegram.

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

--
Nombre base datos: tvspy

Usuario base datos: tvspy

Contraseña base datos: tvspy
--

## Instalación

```
docker create  \
	--name=tvspy \
	-v <path to data>:/var/www/html/bd_backup \
	-p xxxxx:80 \
	-e TIME_CRON=15 \
	alebupal/tvspy \
```

## Copia de seguridad BD
Cada día se realizar una copia de seguridad de la base de datos en "/var/www/html/bd_backup" es aconsejable mapear esta carpeta para tener acceso a ella en caso de problemas.

Se puede hacer y restaurar una copia de seguridad de la base de datos en la opción configuración.

## Docker (https://hub.docker.com/r/alebupal/tvspy/)

## Changelog (https://github.com/alebupal/tvspy/blob/master/CHANGELOG.md)

## Donación (https://www.paypal.me/alebupal)
