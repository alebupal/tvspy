# Use an official Node.js runtime as a parent image
FROM node:14

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json e package-lock.json para instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el contenido de la carpeta src en el contenedor
COPY ./src ./src

# Exponer el puerto en el que la aplicación Express escuchará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD [ "node", "src/app.js" ]