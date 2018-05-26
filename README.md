# TVSPY

Aplicación web sobre Monitorizacion para tvheadend - Web application about Monitoring for tvheadend.

La aplicación está realizada en PHP, MYSQL y JS. Hay un cron que se ejecuta cada cierto tiempo, el cual va guardando los registros que hay en la API de tvheadend, después con estos datos se elaboran las estadisticas. Permite enviar notificaciones a Telegram.

The application is made in PHP, MYSQL and JS. There is a cron that runs every so often and keeps the records of the tvheadend API in the database. This data is used to make the statistics. Send notifications to Telegram.

## Instalación - Installing
Para utilizarla basta con instalar la imagen de docker https://hub.docker.com/r/alebupal/tvspy/ y configurar la aplicación con la ip y puerto de TvHeadend en la opción configuración.
Para crear la imagen de docker me he basado en https://github.com/mattrayner/docker-lamp .
La imagen tiene PHP 7.2, MYSQL, PHPMyAdmin y apache.
Para acceder a PHPMyAdmin la ruta es: http://IP_DOCKER:PORT_DOCKER/phpmyadmin y para acceder a la aplicación http://IP_DOCKER:PORT_DOCKER

Se puede cambiar el tiempo de actualización de la base de datos con datos de televisión con la variable de entorno: TIME_CRON
Tiempo en segundos.
No garantizo que funcione con menos de 30 segundos.

Siempre que se instala de nuevo es recomendable hacer una copia de la base de datos con phpmyadmin para no perder el registro de datos. Despues con volver a importarla desde phpmyadmin no habrá problemas.

Gracias a @Spufy por sus consejos para montar la imagen.

[Capturas](https://github.com/alebupal/tvspy/tree/master/capturas)

--

To use it, simply install the docker image https://hub.docker.com/r/alebupal/tvspy/ and configure the application with the ip and port of TvHeadend in the configuration option.
To create the docker image I have based on https://github.com/mattrayner/docker-lamp.
The image has PHP 7.2, MYSQL, PHPMyAdmin and apache.
To access PHPMyAdmin the route is: http://IP_DOCKER:PORT_DOCKER/phpmyadmin and to access the application http://IP_DOCKER:PORT_DOCKER

You can change the update time of the database with tvheadend data with the environment variable: TIME_CRON
Time in seconds.
I do not guarantee that it works with less than 30 seconds.

Whenever it is installed again it is advisable to make a copy of the database with phpmyadmin so as not to lose the data record. Then with re-import from phpmyadmin there will be no problems.

Thanks to @Spufy for his advice to assemble the image.

[Screenshots](https://github.com/alebupal/tvspy/tree/master/capturas)

--

USER phpmyadmin: tvspy
PASS phpmyadmin: tvspy
db: tvspy


```
docker create --name=tvspy -p xxxxx:80 -p xxxxx:3306 -e TIME_CRON=30 -e PHPMYADMIN_VERSION=4.8.0.1 -e TZ=Europe/Madrid alebupal/tvspy
```

```
docker create --name=tvspy -p xxxxx:80 -p xxxxx:3306 -e TIME_CRON=30 -e PHPMYADMIN_VERSION=4.8.0.1 -e TZ=Europe/Madrid alebupal/tvspy
```

## Donate - Donación
[![paypal](https://www.paypalobjects.com/es_ES/ES/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7M4FFLM5WMKWQ)

## License
