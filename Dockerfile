FROM phusion/baseimage:jammy-1.0.1

MAINTAINER alebupal <alebupal@gmail.com>

# based mattrayner/lamp
# MAINTAINER Matthew Rayner <matt@mattrayner.co.uk>

ENV DOCKER_USER_ID 501
ENV DOCKER_USER_GID 20

ENV BOOT2DOCKER_ID 1000
ENV BOOT2DOCKER_GID 50

# Tweaks to give Apache/PHP write permissions to the app
RUN usermod -u ${BOOT2DOCKER_ID} www-data && \
	usermod -G staff www-data && \
	useradd -r mysql && \
	usermod -G staff mysql

RUN groupmod -g $(($BOOT2DOCKER_GID + 10000)) $(getent group $BOOT2DOCKER_GID | cut -d: -f1)
RUN groupmod -g ${BOOT2DOCKER_GID} staff

# Install packages
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
	apt-get upgrade -y && \
	add-apt-repository -y ppa:ondrej/php && \
	apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 4F4EA0AAE5267A6C && \
	apt-get update && \
	apt-get -y upgrade && \
	apt-get -y install nano supervisor wget git apache2 php-xdebug libapache2-mod-php mysql-server php-mysql pwgen php-apcu php7.0-mcrypt php-gd php-xml php-mbstring php-gettext zip unzip php-zip curl php-curl && \
	apt-get -y autoremove && \
	echo "ServerName localhost" >> /etc/apache2/apache2.conf

# needed for phpMyAdmin
RUN phpenmod mcrypt

# Add image configuration and scripts
ADD supporting_files/start-apache2.sh /start-apache2.sh
ADD supporting_files/start-mysqld.sh /start-mysqld.sh
ADD supporting_files/actualizacion.sh /actualizacion.sh
ADD supporting_files/backup.sh /backup.sh
ADD supporting_files/run.sh /run.sh
RUN chmod 755 /*.sh
ADD supporting_files/supervisord-apache2.conf /etc/supervisor/conf.d/supervisord-apache2.conf
ADD supporting_files/supervisord-mysqld.conf /etc/supervisor/conf.d/supervisord-mysqld.conf
ADD supporting_files/supervisord-actualizacion.conf /etc/supervisor/conf.d/supervisord-actualizacion.conf
ADD supporting_files/supervisord-backup.conf /etc/supervisor/conf.d/supervisord-backup.conf
ADD supporting_files/mysqld_innodb.cnf /etc/mysql/conf.d/mysqld_innodb.cnf

# Allow mysql to bind on 0.0.0.0
RUN sed -i "s/.*bind-address.*/bind-address = 0.0.0.0/" /etc/mysql/my.cnf

# Set PHP timezones to Europe/Madrid
RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/8.2/apache2/php.ini
RUN sed -i "s/;date.timezone =/date.timezone = Europe\/Madrid/g" /etc/php/8.2/cli/php.ini

#Cambiar zona horaria
RUN apt update && apt install -y tzdata && \
apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Remove pre-installed database
RUN rm -rf /var/lib/mysql

# Add MySQL utils
ADD supporting_files/create_mysql_users.sh /create_mysql_users.sh
RUN chmod 755 /*.sh

# Add phpmyadmin
ENV PHPMYADMIN_VERSION=4.8.3
RUN wget -O /tmp/phpmyadmin.tar.gz https://files.phpmyadmin.net/phpMyAdmin/${PHPMYADMIN_VERSION}/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz
RUN tar xfvz /tmp/phpmyadmin.tar.gz -C /var/www
RUN ln -s /var/www/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages /var/www/phpmyadmin
RUN mv /var/www/phpmyadmin/config.sample.inc.php /var/www/phpmyadmin/config.inc.php

# Add composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
	php composer-setup.php && \
	php -r "unlink('composer-setup.php');" && \
	mv composer.phar /usr/local/bin/composer

ENV MYSQL_PASS:-$(pwgen -s 12 1)
# config to enable .htaccess
ADD supporting_files/apache_default /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# Configure /app folder with sample app
RUN mkdir -p /app && rm -fr /var/www/html && ln -s /app /var/www/html
ADD app/ /app
RUN chmod -R 777 /var/www/html/*

#Environment variables to configure php
ENV PHP_UPLOAD_MAX_FILESIZE 10M
ENV PHP_POST_MAX_SIZE 10M

#Tiempo de actualización a la api en segundos
ENV TIME_CRON 15

# Puertos
EXPOSE 80

CMD ["/run.sh"]
