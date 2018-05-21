# TVSPY

Aplicación web sobre Monitorizacion para tvheadend - Web application about Monitoring for tvheadend.

La aplicación está realizada en PHP, MYSQL y JS. Hay un cron que se ejecuta cada cierto tiempo, el cual va guardando los registros que hay en la API de tvheadend, después con estos datos se elaboran las estadisticas.

The application is made in PHP, MYSQL and JS. There is a cron that runs every so often and keeps the records of the tvheadend API in the database. This data is used to make the statistics.

## Instalación - Installing
Para utilizarla basta con instalar la imagen de docker https://hub.docker.com/r/alebupal/tvspy/ , para crear la imagen de docker me he basado en  https://github.com/mattrayner/docker-lamp . La imagen tiene PHP 7.2, MYSQL, PHPMyAdmin y apache.
Para acceder a PHPMyAdmin la ruta es: http://IP_DOCKER:PORT_DOCKER/phpmyadmin y para acceder a la aplicación http://IP_DOCKER:PORT_DOCKER

To use it just install the docker image https://hub.docker.com/r/alebupal/tvspy/, to create the image of docker I have based on https://github.com/mattrayner/docker-lamp . The image has PHP 7.2, MYSQL, PHPMyAdmin and apache
To access PHPMyAdmin the route is: http://IP_DOCKER:PORT_DOCKER/phpmyadmin and to access the application http://IP_DOCKER:PORT_DOCKER

USER phpmyadmin: tvspy
PASS phpmyadmin: tvspy
db: tvspy

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
