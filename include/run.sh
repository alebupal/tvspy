#!/bin/bash
# start db
/etc/init.d/mysql start
# start apache
/etc/init.d/apache2 start
#cron
./actualizacion.sh

exec supervisord -n
