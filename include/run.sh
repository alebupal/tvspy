#!/bin/bash
# start apache
/etc/init.d/apache2 stop
/etc/init.d/apache2 start
# start db
/etc/init.d/mysql stop
/etc/init.d/mysql start
#cron
./actualizacion.sh

exec supervisord -n
