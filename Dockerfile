# Etapa 1: Construcción del frontend
FROM node:20.16.0-bookworm AS build-frontend

WORKDIR /app/frontend

# Copia los archivos de configuración y el código del frontend
COPY tvspy-frontend/package*.json ./
RUN npm install
COPY tvspy-frontend/ ./
RUN npm run build

# Etapa 2: Configuración del backend
FROM node:20.16.0-bookworm AS build-backend

WORKDIR /app/backend

# Copia los archivos de configuración y el código del backend
COPY tvspy-backend/package*.json ./
RUN npm install
COPY tvspy-backend/ ./

# Etapa 3: Imagen final con Nginx y Node.js
FROM node:20.16.0-bookworm AS final

# Instalar Nginx
RUN apt update && apt install -y nginx && apt clean

# Crear el usuario nginx para evitar errores
RUN useradd -r -u 101 nginx

# Configurar el directorio de trabajo
WORKDIR /app

# Configurar la zona horaria y localización
ENV TZ=Europe/Madrid
ENV LOCALE=es-ES

# Copia el backend al contenedor
COPY --from=build-backend /app/backend /app/backend

# Copia los archivos estáticos generados del frontend al directorio de Nginx
COPY --from=build-frontend /app/frontend/dist /usr/share/nginx/html

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Asignar los permisos correctos a los archivos de Nginx
RUN chown -R nginx:nginx /var/log/nginx /var/lib/nginx /usr/share/nginx/html

# Exponer puertos para Nginx
EXPOSE 80

# Iniciar Nginx y el backend Node.js en el contenedor
CMD ["sh", "-c", "nginx -g 'daemon off;' & node /app/backend/src/app.js"]
