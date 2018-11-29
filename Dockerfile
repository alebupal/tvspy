FROM mattrayner/lamp:latest-1604-php7

MAINTAINER alebupal <alebupal@gmail.com>

# Zona horaria PHP Europe/Madrid
# RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/7.2/apache2/php.ini
# RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/7.2/cli/php.ini

#Cambiar zona horaria
# RUN apt update && apt install -y tzdata && \
# apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


#Tiempo de actualizacion a la api en segundos
ENV TIME_CRON 15

# copia de la aplicación web
# RUN mkdir -p /app && rm -fr /var/www/html && ln -s /app /var/www/html
# ADD app/ /app
# RUN chmod -R 777 /var/www/html/*

# Script de actualizacion
# ADD include/actualizacion.sh /actualizacion.sh
# ADD include/run.sh /run.sh
# RUN chmod 755 /*.sh

# Puertos
EXPOSE 80 3306

# comando a ejecutar en el inicio
CMD ["/run.sh"]
