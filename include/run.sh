#!/bin/bash
#Iniciar crontab
#crontab -u www-data /var/www/html/crontab
#crontab /var/www/html/crontab
#service cron start

/var/www/html/actualizacion.sh & 
echo $! > /var/www/html/pid.file

# start db
/etc/init.d/mysql start
# crear usuario y contraseña
mysql -e "CREATE USER 'tvspy'@'localhost' IDENTIFIED BY 'tvspy'"
mysql < /var/www/html/bd.sql
mysql -e "GRANT ALL PRIVILEGES ON * . * TO 'tvspy'@'localhost'"
mysql -e "FLUSH PRIVILEGES"

exec supervisord -n
