# TVSPY 1.2.4

Aplicación web sobre Monitorizacion para tvheadend

La aplicación está realizada en PHP, MYSQL y JS. Hay un cron que se ejecuta cada cierto tiempo, el cual va guardando los registros que hay en la API de tvheadend, después con estos datos se elaboran las estadisticas. Permite enviar notificaciones a Telegram.

## Instalación
Para utilizarla basta con instalar la imagen de docker https://hub.docker.com/r/alebupal/tvspy/ y configurar la aplicación con la ip y puerto de TvHeadend en la opción configuración.
Para crear la imagen de docker me he basado en https://github.com/mattrayner/docker-lamp .
La imagen tiene PHP 7.2, MYSQL, PHPMyAdmin y apache.
Para acceder a PHPMyAdmin la ruta es: http://IP_DOCKER:PORT_DOCKER/phpmyadmin y para acceder a la aplicación http://IP_DOCKER:PORT_DOCKER

Se puede cambiar el tiempo de actualización de la base de datos con datos de televisión con la variable de entorno: TIME_CRON
Tiempo en segundos.
No garantizo que funcione con menos de 15 segundos.

Siempre que se instala de nuevo es recomendable hacer una copia de la base de datos con phpmyadmin para no perder el registro de datos. Despues con volver a importarla desde phpmyadmin no habrá problemas.

Gracias a @Spufy por sus consejos para montar la imagen.

[Capturas](https://github.com/alebupal/tvspy/tree/master/capturas)

Si la configuración sale sin valores, prueba a iniciar apache y mysql dentro del contenedor
```
/etc/init.d/mysql start
```
```
/etc/init.d/apache2 start
```

Si no hay conexión entre tvspy y tvheadend, os sale constatemente login incorrecto o sale algo como "505 HTTP/RTSP Version Not Supported" hay que asegurarse de que en configuración>general>base>HTTP Server Settings>Authentication type debe estar seleccionado "Both plain and digest"

--

USER phpmyadmin: tvspy<br/>
PASS phpmyadmin: tvspy<br/>
db: tvspy

```
docker create --name=tvspy -p xxxxx:80 -p xxxxx:3306 -e TIME_CRON=15 -e PHPMYADMIN_VERSION=4.8.0.1 -e TZ=Europe/Madrid alebupal/tvspy
```

## Docker (https://hub.docker.com/r/alebupal/tvspy/)

## Changelog (https://github.com/alebupal/tvspy/blob/master/CHANGELOG.md)

## Donación (https://www.paypal.me/alebupal)
