#!/bin/bash
#Iniciar crontab
crontab -e
crontab /var/www/html/acciones/crontab
# start db
/etc/init.d/mysql start
# crear usuario y contraseña
mysql -e "CREATE USER 'tvspy'@'localhost' IDENTIFIED BY 'tvspy'"
mysql < /var/www/html/bd.sql
mysql -e "GRANT ALL PRIVILEGES ON * . * TO 'tvspy'@'localhost'"
mysql -e "FLUSH PRIVILEGES"

exec supervisord -n
