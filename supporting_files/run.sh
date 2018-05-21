#!/bin/bash

# start db
sudo service mysql start
# create the default database from the ADDed file.
mysql -e "CREATE USER 'tvspy'@'localhost' IDENTIFIED BY 'tvspy'"
mysql < /var/www/html/bd.sql
mysql -e "GRANT ALL PRIVILEGES ON * . * TO 'tvspy'@'localhost'"
mysql -e "FLUSH PRIVILEGES"

exec supervisord -n
