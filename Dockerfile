FROM ubuntu:latest
#
MAINTAINER alebupal <alebupal@gmail.com>

# instalar paquetes necesario
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y apache2 python-software-properties mysql-server  && \
    add-apt-repository -y ppa:ondrej/php  && \
    apt-get update -y  && \
    apt-get install -y php7.2 php7.0-cli php7.2-common php7.2-mbstring php7.2-intl php7.2-xml php7.2-mysql php7.2-mcrypt && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf
