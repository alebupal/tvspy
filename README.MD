# TVSPY 📺

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/alebupal/tvspy/releases)
[![Docker Hub](https://img.shields.io/docker/pulls/alebupal/tvspy.svg)](https://hub.docker.com/r/alebupal/tvspy/)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-orange.svg)](https://www.paypal.me/alebupal)
[![Telegram](https://img.shields.io/badge/Telegram-tvspy__news-2CA5E0.svg)](https://t.me/tvspy_news)

**TVSPY** is a modern, fast, and intuitive web application designed to monitor **TVHeadend** servers in real time. Easily supervise live broadcasts, DVR recordings, bandwidth consumption, connected users, playback history, and advanced analytics.

---

## ✨ Key Features

- 📡 **Real-time Live Monitoring**: See who is online, what channel they are watching, their player client, and instant bitrate metrics via native WebSockets.
- 🔴 **Automatic DVR Recording Detection**: Clear visual distinction between live streaming and scheduled recordings with dynamic badges.
- 🔄 **Automatic & Hot Reconnection (New in v3.1!)**: Auto-reconnects with exponential backoff. Updating credentials or IPs in Settings triggers an immediate hot reconnection **without needing to restart the Docker container**.
- 📺 **Multiple Channel Views**: Switch with one click between **Logo Grid** view and detailed **List / Table** view.
- 📊 **Advanced Analytics & Charts Dashboard**:
  - **Timeline Trend** chart (daily hours or playback counts).
  - **Top Channels** ranking.
  - **Client / Device Distribution** chart (VLC, Kodi, TiviMate, etc.).
  - **Peak Hours** analysis (24-hour usage distribution).
  - Flexible filters by date range (7, 14, 30, 90 days, or full year) and metric (time vs uses).
- 📜 **Historical Registries**: High-performance table with instant debounced search, server-side pagination, and **CSV export**.
- 🔔 **Smart Telegram Notifications**:
  - Playback start and stop.
  - DVR recording start and stop.
  - Excessive playback time warning (customizable minute threshold).
  - Unauthorized IP alert.
  - Dynamic message templates (`%%username%%`, `%%channel%%`, `%%date%%`, `%%client%%`, `%%hostname%%`).
  - One-click test notification button.
- 🌓 **Dark / Light Mode** & multi-language support (**Spanish** and **English**).

---

## 🚀 Docker Deployment

### Option 1: Docker Compose (Recommended)

Create a `docker-compose.yml` file:

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

Start the container:
```bash
docker compose up -d
```

### Option 2: Docker CLI

```bash
docker run -d \
  --name=tvspy \
  --restart=unless-stopped \
  -p 80:80 \
  -v /path/to/data:/app/backend/src/database/file \
  -e TZ=Europe/Madrid \
  -e LOCALE=es-ES \
  alebupal/tvspy:latest
```

Once running, navigate to `http://YOUR_SERVER_IP:80` and head over to the **Settings** section to configure your TVHeadend IP, port, and credentials.

---

## 🛠️ Local Development

TVSPY includes a unified runner to launch both Backend and Frontend concurrently with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/alebupal/tvspy.git
cd tvspy

# 2. Install all dependencies
npm run install:all

# 3. Launch Backend (port 3001) and Frontend (port 5173) concurrently
npm run dev
```

> **On Windows**: You can also double-click `dev.bat` or run `./dev.ps1`.

### Individual commands:
- `npm run dev:backend` - Starts only the backend with nodemon.
- `npm run dev:frontend` - Starts only the frontend with Vite.
- `npm run build` - Builds the frontend for production.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `TZ` | Container timezone | `Europe/Madrid` |
| `LOCALE` | Locale for dates and numbers | `es-ES` |
| `PORT` | Internal Node.js backend port | `3001` |

---

## 🤝 Support & Donations

If TVSPY is useful to you and you wish to support its ongoing development:

- ☕ **Donate via PayPal**: [paypal.me/alebupal](https://www.paypal.me/alebupal)
- 📢 **Telegram News Channel**: [@tvspy_news](https://t.me/tvspy_news)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/alebupal/tvspy/issues)

---

## 📄 License

This project is licensed under the **ISC** License. See the `LICENSE` file for details.
