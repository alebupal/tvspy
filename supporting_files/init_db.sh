#!/bin/bash
#https://stackoverflow.com/questions/29145370/how-can-i-initialize-a-mysql-database-with-schema-in-a-docker-container
# Initialize MySQL database.
# ADD this file into the container via Dockerfile.
# Assuming you specify a VOLUME ["/var/lib/mysql"] or `-v /var/lib/mysql` on the `docker run` command…
# Once built, do e.g. `docker run your_image /path/to/docker-mysql-initialize.sh`
# Again, make sure MySQL is persisting data outside the container for this to have any effect.


# Start the MySQL daemon in the background.
sudo service mysql start
# Permit root login without password from outside container.
mysql -e "GRANT ALL ON *.* TO root@'%' IDENTIFIED BY '' WITH GRANT OPTION"
# create the default database from the ADDed file.
mysql < /var/www/html/bd.sql
