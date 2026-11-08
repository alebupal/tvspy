# Guía y Documentación de TVSPY 📺

Bienvenido a la guía rápida de usuario y administración de **TVSPY**, la suite de monitorización, análisis y control en tiempo real para servidores **TVHeadend**.

---

## 📋 Índice
1. [Requisitos Previos](#1-requisitos-previos)
2. [Despliegue Rápido con Docker](#2-despliegue-rápido-con-docker)
3. [Configuración Inicial](#3-configuración-inicial)
4. [Módulos y Pantallas](#4-módulos-y-pantallas)
5. [Seguridad y Control de Acceso](#5-seguridad-y-control-de-acceso)
6. [Notificaciones Multiplataforma](#6-notificaciones-multiplataforma)
7. [Mantenimiento y Respaldo](#7-mantenimiento-y-respaldo)
8. [Preguntas Frecuentes (FAQ)](#8-preguntas-frecuentes-faq)

---

## 1. Requisitos Previos

- Un servidor **TVHeadend** (versión 4.2 o 4.3+) accesible por red.
- Un usuario configurado en TVHeadend con los siguientes derechos de acceso mínimos:
  - **Streaming** (para consultar suscripciones y estados).
  - **Admin** (recomendado si deseas utilizar la función **Kill Stream** para cancelar conexiones activas).
- Un host con **Docker** y **Docker Compose**.

---

## 2. Despliegue Rápido con Docker

La forma recomendada de desplegar TVSPY es mediante `docker-compose.yml`:

```yaml
services:
  tvspy:
    image: alebupal/tvspy:latest
    container_name: tvspy
    restart: unless-stopped
    ports:
      - "80:80" # Puerto web de TVSPY
    volumes:
      - ./tvspy_data:/app/backend/src/database/file # Persistencia de base de datos SQLite
    environment:
      - TZ=Europe/Madrid
      - LOCALE=es-ES
```

Para iniciar el contenedor:
```bash
docker compose up -d
```

Accede al panel desde tu navegador en `http://IP_DE_TU_SERVIDOR`.

---

## 3. Configuración Inicial

Al acceder por primera vez, navega a la sección **Ajustes** (icono de engranaje en el menú lateral):

1. **Pestaña TVHeadend**:
   - **Host / IP**: Dirección IP de tu servidor TVHeadend (ej. `192.168.1.100`).
   - **Puerto HTTP**: Por defecto `9981`.
   - **Puerto HTSP**: Por defecto `9982`.
   - **Usuario y Contraseña**: Credenciales con permisos de TVHeadend.
   - Pulsa **Probar Conexión** para validar los datos y luego **Guardar**.
   *(TVSpy se reconecta inmediatamente sin necesidad de reiniciar el contenedor).*

---

## 4. Módulos y Pantallas

### 🏠 Inicio (Dashboard en Vivo)
- **Métricas Instantáneas**: Ancho de banda total consumido en tiempo real (con gráfica sparkline de pulso), bytes totales descargados, clientes únicos y emisiones activas.
- **Barra de Almacenamiento**: Barra estilizada y compacta que muestra la capacidad total del disco de TVHeadend, espacio usado, espacio libre y uso exclusivo de grabaciones DVR.
- **Tarjetas de Emisiones Activas**:
  - Logotipo del canal y título oficial.
  - **Guía EPG en Vivo**: Nombre del programa actual, barra de progreso temporal y minutos restantes.
  - Usuario cliente, dirección IP (con bandera de geolocalización) y software reproductor (VLC, Kodi, TiviMate, etc.).
  - Bitrate en tiempo real y contador de paquetes con error de señal.
  - **Botón Cancelar Emisión (Kill Stream)**: Expulsa la conexión del cliente directamente desde la interfaz.
- **Grabaciones DVR**: Acceso al modal de **Próximas Grabaciones DVR** para revisar eventos y series programadas con cuenta atrás.

### 📋 Registro
- Histórico completo de sesiones de reproducción finalizadas.
- Filtros rápidos por rango de fechas, canal, usuario o reproductor.
- Registro de duración, volumen de datos transferidos y fecha/hora de inicio y fin.

### 📺 Canales
- Catálogo de todos los canales sintonizados en TVHeadend con visualización de **Categorías** y **Red o Servicio**.
- Filtros dinámicos en cabecera: buscador de texto y menús desplegables para filtrar por **Categoría** y por **Red / Servicio**.
- **Ordenación por Columnas**: Permite ordenar la tabla al hacer clic en los encabezados (Número, Nombre, Categorías, Red/Servicio o Estado) en orden ascendente y descendente.
- Selector de vista dual: **Cuadrícula** (tarjetas visuales con insignias de red y categoría) o **Tabla Detallada Compacta**.
- **Modal de Perfil de Canal**: Muestra horas acumuladas de reproducción, volumen de datos, espectadores únicos, ranking de usuarios más asiduos, servicios vinculados y sus registros recientes.

### 👥 Usuarios
- Vista de todos los clientes configurados en el servidor TVHeadend.
- **Ordenación por Columnas**: Permite ordenar la lista al hacer clic en Nombre de usuario, Comentario o Estado.
- Vista en **Cuadrícula** o **Tabla**.
- **Modal de Perfil de Usuario**: Resumen de consumo, canales más vistos y desglose de sesiones.

### 📊 Estadísticas
- Gráfico de **Evolución Temporal** (horas de consumo diario o número de reproducciones).
- Gráficos interactivos de **Top Canales**, **Distribución de Reproductores** y **Horas Pico** de uso (00:00 a 23:00).
- Selector de rango temporal (7, 14, 30, 90 días o 1 año).

### 📖 Documentación
- Visor integrado de la documentación oficial y registro histórico de cambios (Changelog) en español e inglés.

---

## 5. Seguridad y Control de Acceso

En **Ajustes > Seguridad**:

### 🔒 Bloqueo por Código PIN
- Puedes activar un PIN numérico (de 4 a 8 dígitos) para proteger el acceso a TVSPY.
- **Persistencia de 30 Días**: Una vez introducido el PIN en tu navegador, el dispositivo queda recordado durante 30 días mediante cookies seguras y almacenamiento local, evitando tener que introducirlo en cada recarga.
- **Bloqueo Manual**: En Ajustes dispones del botón **Bloquear ahora** para cerrar la sesión y solicitar el PIN de nuevo de forma inmediata.

### 🛡️ Lista Blanca de IPs Autorizadas
- Limita quién puede acceder al panel mediante una lista blanca interactiva.
- Admite IPs fijas (`192.168.1.50`), comodines (`192.168.1.*`) y rangos CIDR (`10.0.0.0/24`).
- Las conexiones locales del host (`127.0.0.1`, `localhost`) siempre están protegidas para evitar bloqueos accidentales.

---

## 6. Notificaciones Multiplataforma

En **Ajustes > Notificaciones**, puedes configurar avisos ante eventos del servidor:

- **Canales compatibles**:
  - **Avisos de Escritorio**: Notificaciones nativas en el navegador con soporte de audio sintetizado Web Audio (dos tonos acústicos).
  - **Telegram**: Mediante Bot Token y Chat ID.
  - **Discord**: Mediante Webhook con tarjetas de tipo Rich Embed.
  - **Gotify**: Notificaciones push autoalojadas con prioridad configurable.
  - **Webhook Genérico**: Peticiones HTTP POST con payload JSON personalizable.
- **Eventos configurables**:
  - Inicio de emisión.
  - Fin de emisión.
  - Inicio de grabación DVR.
  - Tiempo de emisión excedido (alerta de uso prolongado).
  - Acceso desde IP no autorizada.
  - Caída o desconexión del servidor TVHeadend (Heartbeat > 2 minutos) y su posterior recuperación.

---

## 7. Mantenimiento y Respaldo

En **Ajustes > Sistema & Base de Datos**:

- **Copia de Seguridad**: Descarga directa con un clic del archivo SQLite `.db` con toda la configuración y el histórico.
- **Auto-Purgado de Registros**: Configura la retención de registros históricos (ej. 30, 60 o 90 días) con ejecución automática de `VACUUM` para mantener la base de datos ligera y rápida.
- **Comprobación de Versión**: Comprueba si existe una versión más reciente publicada en GitHub con enlace directo a la release.

---

## 8. Preguntas Frecuentes (FAQ)

### ¿Por qué la opción "Cancelar Emisión" (Kill Stream) da error?
Asegúrate de que el usuario configurado en TVHeadend tiene el permiso **Admin** activo en la interfaz de TVHeadend (`Configuración > Usuarios > Permisos`). La API de TVHeadend requiere privilegios administrativos para cerrar conexiones de red de otros clientes mediante `/api/connections/cancel`.

### ¿Por qué no aparecen los datos de espacio en disco?
TVHeadend solo expone las métricas de espacio libre y total si tiene al menos una ruta de grabación DVR configurada en `Configuración > Grabaciones > Perfiles de Grabación Digital (DVR)`.

### ¿Cómo cambio el idioma de la interfaz?
En cualquier momento puedes cambiar entre Español e Inglés desde el selector de idioma situado en el encabezado superior o desde **Ajustes > General > Idioma**.

