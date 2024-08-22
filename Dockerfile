# Etapa 1: Construcción del frontend
FROM node:18-alpine AS build-frontend

# Establece el directorio de trabajo en la imagen
WORKDIR /app/frontend

# Copia los archivos del frontend y las dependencias
COPY tvspy-frontend/package*.json ./
RUN npm install

# Copia el resto del código del frontend
COPY tvspy-frontend/ ./

# Compila la aplicación frontend
RUN npm run build

# Etapa 2: Configuración del backend
FROM node:18-alpine AS build-backend

# Establece el directorio de trabajo en la imagen
WORKDIR /app/backend

# Copia los archivos del backend y las dependencias
COPY tvspy-backend/package*.json ./
RUN npm install

# Copia el resto del código del backend
COPY tvspy-backend/ ./

# Etapa 3: Imagen final
FROM node:18-alpine AS final

# Configura el directorio de trabajo
WORKDIR /app

# Copia el backend desde la etapa anterior
COPY --from=build-backend /app/backend /app/backend

# Copia los archivos estáticos generados del frontend
COPY --from=build-frontend /app/frontend/dist /app/backend/public

# Exponer el puerto en el que se ejecutará la aplicación frontend
EXPOSE 80

# Configura la variable de entorno si es necesario
ENV NODE_ENV=production

# Inicia el servidor backend
CMD ["node", "/app/backend/index.js"]
