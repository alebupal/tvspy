FROM ubuntu:latest
#
MAINTAINER alebupal <alebupal@gmail.com>

# instalar paquetes necesario
RUN apt-get update && \
	apt-get upgrade -y && \
	apt-get install -y apache2 python-software-properties mysql-server && \
	add-apt-repository -y ppa:ondrej/php && \
	apt-get update -y && \
	apt-get install -y php7.2 php7.0-cli php7.2-common php7.2-mbstring php7.2-intl php7.2-xml php7.2-mysql php7.2-mcrypt && \
	echo "ServerName localhost" >> /etc/apache2/apache2.conf

# necesario para phpMyAdmin
RUN phpenmod mcrypt

# copia de la aplicación web
RUN mkdir -p /app && rm -fr /var/www/html && ln -s /app /var/www/html
ADD app/ /app

# Add image configuration and scripts
ADD supporting_files/start-apache2.sh /start-apache2.sh
ADD supporting_files/start-mysqld.sh /start-mysqld.sh
ADD supporting_files/run.sh /run.sh
RUN chmod 755 /*.sh
ADD supporting_files/supervisord-apache2.conf /etc/supervisor/conf.d/supervisord-apache2.conf
ADD supporting_files/supervisord-mysqld.conf /etc/supervisor/conf.d/supervisord-mysqld.conf

# Zona horaria PHP Europe/Madrid
RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/7.2/apache2/php.ini
RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/7.2/cli/php.ini

# Remove pre-installed database
RUN rm -rf /var/lib/mysql

# Add MySQL utils
ADD supporting_files/create_mysql_users.sh /create_mysql_users.sh
RUN chmod 755 /*.sh

# Add MySQL utils
ADD supporting_files/create_mysql_users.sh /create_mysql_users.sh
RUN chmod 755 /*.sh

# Añadir phpmyadmin
ENV PHPMYADMIN_VERSION=4.8.0.1
RUN wget -O /tmp/phpmyadmin.tar.gz https://files.phpmyadmin.net/phpMyAdmin/${PHPMYADMIN_VERSION}/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz
RUN tar xfvz /tmp/phpmyadmin.tar.gz -C /var/www
RUN ln -s /var/www/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages /var/www/phpmyadmin
RUN mv /var/www/phpmyadmin/config.sample.inc.php /var/www/phpmyadmin/config.inc.php

# config to enable .htaccess
ADD supporting_files/apache_default /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Zona horaria de España y limpieza de la instalación y ficheros temporales
	&& export DEBIAN_FRONTEND=noninteractive \
	&& ln -fs /usr/share/zoneinfo/Europe/Madrid /etc/localtime \
	&& dpkg-reconfigure --frontend noninteractive tzdata \
	&& apt-get clean autoclean \
	&& apt-get autoremove -y \
	&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Puertos
EXPOSE 80 3306

# comando a ejecutar en el inicio
CMD ["/opt/src/run.sh"]
