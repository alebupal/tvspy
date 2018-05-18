FROM ubuntu:latest
#
MAINTAINER alebupal <alebupal@gmail.com>
#
# instalar paquetes necesario
#
RUN apt-get update && apt-get upgrade -y && apt-get -y install mysql-server php apache2
#
# copia tus programas que estén en directorio a donde deben estar si son varios te creas un
# carpeta
#
COPY app/* /var/www/html/   # esto copia el contenido de la carpeta app a la carpeta del servidor web
#
#
RUN chmod +x /etc/my_init.d/20_inicioDocker.sh \
#
EXPOSE 500/udp 4500/udp # configuración de los puertos
#
VOLUME ["/lib/modules"] # si necesitas acceder al host
#
# zona horaria de España y limpieza de la instalación y ficheros temporales
#
    && export DEBIAN_FRONTEND=noninteractive \
    && ln -fs /usr/share/zoneinfo/Europe/Madrid /etc/localtime \
	&& dpkg-reconfigure --frontend noninteractive tzdata \
#
    && apt-get clean autoclean \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# comando a ejecutar en el inicio
CMD ["/opt/src/run.sh"]
#
