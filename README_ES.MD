# TVSPY 📺

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/alebupal/tvspy/releases)
[![Docker Hub](https://img.shields.io/docker/pulls/alebupal/tvspy.svg)](https://hub.docker.com/r/alebupal/tvspy/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-orange.svg)](https://www.paypal.me/alebupal)
[![Telegram](https://img.shields.io/badge/Telegram-tvspy__news-2CA5E0.svg)](https://t.me/tvspy_news)

**TVSPY** es una suite moderna, rápida e intuitiva para monitorizar servidores **TVHeadend** en tiempo real. Permite supervisar transmisiones en vivo, grabaciones DVR, tráfico de red, usuarios conectados, histórico de sesiones y métricas analíticas avanzadas.

---

## ✨ Características Principales

- 📡 **Monitoreo en Tiempo Real**: Visualiza qué usuarios están conectados, qué canal ven, el reproductor que usan y el bitrate consumido al instante gracias a WebSockets nativos.
- 🔴 **Detección Automática de Grabaciones (DVR)**: Diferenciación clara entre streaming en directo y grabaciones programadas con badges dinámicos.
- 🔄 **Reconexión Automática y en Caliente (¡Novedad v3.1!)**: Se reconecta automáticamente con backoff exponencial. Si cambias credenciales o IPs en Ajustes, se reconecta en caliente **sin reiniciar el contenedor**.
- 📺 **Vistas Múltiples de Canales**: Alterna con un solo clic entre vista en **Cuadrícula con logotipos** y vista en **Lista / Tabla detallada**.
- 📊 **Panel Analítico y Estadísticas Avanzadas**:
  - Gráfico de **Evolución Temporal** (consumo diario de horas/reproducciones).
  - Ranking de **Top Canales más vistos**.
  - Distribución de **Clientes y Reproductores** (VLC, Kodi, TiviMate, etc.).
  - Análisis de **Horas Pico** (actividad de 00:00 a 23:00).
  - Filtros flexibles por rango de fechas (7, 14, 30, 90 días o 1 año) y métrica (tiempo vs usos).
- 📜 **Histórico de Registros**: Tabla de alto rendimiento con búsqueda instantánea, paginación server-side y **exportación a CSV**.
- 🔔 **Notificaciones Inteligentes de Telegram**:
  - Inicio y fin de reproducción.
  - Inicio y fin de grabación DVR.
  - Alerta por reproducción prolongada (límite de minutos excedido).
  - Alerta por acceso desde IP no autorizada.
  - Plantillas de mensajes dinámicas (`%%username%%`, `%%channel%%`, `%%date%%`, `%%client%%`, `%%hostname%%`).
  - Botón de envío de prueba con un solo clic.
- 🌓 **Modo Oscuro / Claro** y soporte multi-idioma (**Español** e **Inglés**).

---

## 🚀 Despliegue con Docker

### Opción 1: Docker Compose (Recomendado)

Crea un archivo `docker-compose.yml`:

```yaml
services:
  tvspy:
    image: alebupal/tvspy:latest
    container_name: tvspy
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./tvspy_data:/app/backend/src/database/file
    environment:
      - TZ=Europe/Madrid
      - LOCALE=es-ES
```

Inicia el servicio:
```bash
docker compose up -d
```

### Opción 2: Docker CLI

```bash
docker run -d \
  --name=tvspy \
  --restart=unless-stopped \
  -p 80:80 \
  -v /ruta/a/datos:/app/backend/src/database/file \
  -e TZ=Europe/Madrid \
  -e LOCALE=es-ES \
  alebupal/tvspy:latest
```

Una vez desplegado, accede a `http://TU_IP:80` y dirígete al menú de **Ajustes** para configurar la IP, puerto y credenciales de tu TVHeadend.

---

## 🛠️ Desarrollo Local

TVSPY incluye un ejecutor unificado para arrancar tanto el Backend como el Frontend con un solo comando:

```bash
# 1. Clonar el repositorio
git clone https://github.com/alebupal/tvspy.git
cd tvspy

# 2. Instalar todas las dependencias
npm run install:all

# 3. Iniciar Backend (3001) y Frontend (5173) en simultáneo
npm run dev
```

> **En Windows**: También puedes hacer doble clic directamente en `dev.bat` o ejecutar `./dev.ps1`.

### Comandos individuales:
- `npm run dev:backend` - Inicia sólo el backend con nodemon.
- `npm run dev:frontend` - Inicia sólo el frontend con Vite.
- `npm run build` - Compila el frontend para producción.

---

## ⚙️ Variables de Entorno

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `TZ` | Zona horaria del contenedor | `Europe/Madrid` |
| `LOCALE` | Configuración regional para fechas y horas | `es-ES` |
| `PORT` | Puerto interno del backend Node.js | `3001` |

---

## 🤝 Soporte y Donaciones

Si TVSPY te resulta útil y quieres apoyar su mantenimiento y desarrollo continuo:

- ☕ **Donación en PayPal**: [paypal.me/alebupal](https://www.paypal.me/alebupal)
- 📢 **Canal de Noticias en Telegram**: [@tvspy_news](https://t.me/tvspy_news)
- 🐛 **Reportar problemas**: [GitHub Issues](https://github.com/alebupal/tvspy/issues)

---

## 📄 Licencia

Este proyecto está bajo la Licencia **ISC**. Consulta el archivo `LICENSE` para más detalles.
