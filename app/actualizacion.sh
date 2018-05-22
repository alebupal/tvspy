#bin/bash
while [ true ]
do
	#do whatever you want, use curl, lynx to your page...
	php /var/www/html/acciones/actualizacion.php &>> /var/www/html/cron_log.log
	sleep 60s
done