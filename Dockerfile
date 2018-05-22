FROM ubuntu:latest

MAINTAINER alebupal <alebupal@gmail.com>

#Para evitar ventanas de pedir datos
ARG DEBIAN_FRONTEND=noninteractive

# instalar paquetes necesario
RUN apt-get update && \
	apt-get upgrade -y && \
	apt-get install -y --no-install-recommends apt-utils && \
	apt-get install -y apache2 software-properties-common mysql-server && \
	add-apt-repository -y ppa:ondrej/php && \
	apt-get update -y && \
	apt-get install -y nano supervisor wget php7.2 php7.0-cli php7.2-common php7.2-mbstring php7.2-curl php7.2-intl php7.2-xml php7.2-mysql && \
	echo "ServerName localhost" >> /etc/apache2/apache2.conf && \
	ln -fs /usr/share/zoneinfo/Europe/Madrid /etc/localtime && \
	dpkg-reconfigure --frontend noninteractive tzdata && \
	apt-get clean autoclean && \
	apt-get autoremove -y && \
	rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# copia de la aplicación web
RUN mkdir -p /app && rm -fr /var/www/html && ln -s /app /var/www/html
ADD app/ /app
RUN chmod -R 777 /var/www/html/*

# Add image configuration and scripts
ADD include/start-apache2.sh /start-apache2.sh
ADD include/start-mysqld.sh /start-mysqld.sh
ADD include/run.sh /run.sh
RUN chmod 755 /*.sh
ADD include/supervisord-apache2.conf /etc/supervisor/conf.d/supervisord-apache2.conf
ADD include/supervisord-mysqld.conf /etc/supervisor/conf.d/supervisord-mysqld.conf

# Zona horaria PHP Europe/Madrid
RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/7.2/apache2/php.ini
RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/7.2/cli/php.ini

# Añadir phpmyadmin
ENV PHPMYADMIN_VERSION=4.8.0.1
RUN wget -O /tmp/phpmyadmin.tar.gz https://files.phpmyadmin.net/phpMyAdmin/${PHPMYADMIN_VERSION}/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz
RUN tar xfvz /tmp/phpmyadmin.tar.gz -C /var/www
RUN ln -s /var/www/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages /var/www/phpmyadmin
RUN mv /var/www/phpmyadmin/config.sample.inc.php /var/www/phpmyadmin/config.inc.php

# config to enable .htaccess
ADD include/apache_default /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Puertos
EXPOSE 80 3306

# comando a ejecutar en el inicio
CMD ["/run.sh"]
