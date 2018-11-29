#!/bin/bash

#Crear base de datos
mysql -uroot -e "create database tvspy" < /var/www/html/bd.sql

#cron
./actualizacion.sh
