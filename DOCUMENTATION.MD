# TVSPY Documentation & User Guide 📺

Welcome to the quick user and administrator guide for **TVSPY**, the real-time monitoring, analytics, and playback control suite for **TVHeadend** servers.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Quick Deployment with Docker](#2-quick-deployment-with-docker)
3. [Initial Setup](#3-initial-setup)
4. [Modules & Views](#4-modules--views)
5. [Security & Access Control](#5-security--access-control)
6. [Multi-Platform Notifications](#6-multi-platform-notifications)
7. [Maintenance & Backup](#7-maintenance--backup)
8. [Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. Prerequisites

- A **TVHeadend** server (v4.2 or v4.3+) reachable over your network.
- A user configured in TVHeadend with the following access rights:
  - **Streaming** (to query subscriptions and playback states).
  - **Admin** (recommended if you intend to use the **Kill Stream** feature to terminate active connections).
- A host machine with **Docker** and **Docker Compose**.

---

## 2. Quick Deployment with Docker

The recommended deployment method is via `docker-compose.yml`:

```yaml
services:
  tvspy:
    image: alebupal/tvspy:latest
    container_name: tvspy
    restart: unless-stopped
    ports:
      - "80:80" # TVSpy web interface port
    volumes:
      - ./tvspy_data:/app/backend/src/database/file # SQLite database persistent storage
    environment:
      - TZ=Europe/Madrid
      - LOCALE=en-US
```

Start the container:
```bash
docker compose up -d
```

Open your browser and navigate to `http://YOUR_SERVER_IP`.

---

## 3. Initial Setup

On your first access, head to **Settings** (gear icon in the sidebar):

1. **TVHeadend Tab**:
   - **Host / IP**: The network address of your TVHeadend server (e.g., `192.168.1.100`).
   - **HTTP Port**: Defaults to `9981`.
   - **HTSP Port**: Defaults to `9982`.
   - **Username and Password**: Credentials authorized in TVHeadend.
   - Click **Test Connection** to verify settings, then click **Save**.
   *(TVSpy reconnects on the fly without needing a container restart).*

---

## 4. Modules & Views

### 🏠 Home (Live Dashboard)
- **Instant Metrics**: Real-time bandwidth usage with pulse sparklines, total bytes transferred, unique connected clients, and active stream counters.
- **Storage Strip**: Ultra-compact horizontal indicator displaying total capacity, used space, free space, and DVR recording footprint.
- **Active Stream Cards**:
  - Official channel logo and station title.
  - **Live EPG**: Currently airing program title, time progress bar, and remaining minutes.
  - Connected viewer, IP address (with country flag and LAN detection), and player client (VLC, Kodi, TiviMate, etc.).
  - Real-time bitrate and signal error counter.
  - **Kill Stream Button**: Remotely cancels client connections directly from the UI.
- **DVR Recordings**: Open the **Upcoming DVR Recordings** modal to review scheduled timers with countdowns.

### 📋 Registry
- Comprehensive log of past streaming sessions.
- Fast filters by date range, channel name, username, or client player.
- Tracks duration, bandwidth consumed, and exact start/end timestamps.

### 📺 Channels
- Full channel catalog detected from TVHeadend displaying **Categories** and **Network / Services**.
- Dynamic filters in header: full-text search plus dedicated dropdown selectors to filter by **Category** and by **Network / Service**.
- **Interactive Column Sorting**: Click any column header (CH #, Name, Categories, Network/Service, or Status) to sort ascending or descending.
- Dual-view toggle: **Grid view** (visual cards with network badges and category pills) or **Detailed Compact Table**.
- **Channel Profile Modal**: Aggregated playback hours, traffic downloaded, unique viewers, top watchers ranking, linked services, and recent session logs.

### 👥 Users
- List of all client accounts configured in the TVHeadend server.
- **Interactive Column Sorting**: Click column headers to sort by Username, Comment, or Status.
- Grid or Table view options.
- **User Profile Modal**: Total viewing duration, preferred channels, and historical session logs.

### 📊 Statistics
- **Timeline Trend** chart (daily playback hours or session counts).
- Interactive charts for **Top Channels**, **Player Distribution**, and **Peak Hours** (24-hour heat profile).
- Date range selectors (7, 14, 30, 90 days, or 1 year).

### 📖 Documentation
- Built-in viewer for official repository documentation and version Changelogs in Spanish and English.

---

## 5. Security & Access Control

Under **Settings > Security**:

### 🔒 PIN Code Protection
- Restrict dashboard access with a 4 to 8-digit numeric PIN.
- **30-Day Persistence**: After successfully entering the PIN, the browser is remembered for 30 days via cookies and local storage.
- **Manual Lock**: Use the **Lock now** button in Settings to immediately revoke credentials on that browser.

### 🛡️ Interactive IP Whitelist
- Restrict dashboard access to authorized IP addresses.
- Supports single IPs (`192.168.1.50`), wildcards (`192.168.1.*`), and CIDR subnets (`10.0.0.0/24`).
- Loopback addresses (`127.0.0.1`, `localhost`) remain protected to prevent accidental lockouts.

---

## 6. Multi-Platform Notifications

Under **Settings > Notifications**, configure automated alerts:

- **Supported Channels**:
  - **Desktop Banners**: Native browser notifications with synthesized Web Audio chimes.
  - **Telegram**: Via Bot Token and Chat ID.
  - **Discord**: Via Webhook URL with Rich Embed formatting.
  - **Gotify**: Self-hosted push alerts with priority levels.
  - **Generic Webhook**: Custom HTTP POST requests with JSON payload.
- **Alert Events**:
  - Playback started / stopped.
  - DVR recording started.
  - Stream duration limit reached.
  - Access from unauthorized IP.
  - TVHeadend server disconnect (Heartbeat > 2 minutes) and recovery.

---

## 7. Maintenance & Backup

Under **Settings > System & Database**:

- **Database Backup**: One-click download of the active SQLite `.db` file.
- **Auto-Purge**: Set retention rules (e.g., 30, 60, or 90 days) with automated database `VACUUM` defragmentation.
- **Version Check**: Checks GitHub for new releases with one-click links to the latest version.

---

## 8. Frequently Asked Questions (FAQ)

### Why does "Kill Stream" return an error?
Ensure the TVHeadend user account has **Admin** permissions enabled in TVHeadend (`Configuration > Users > Access Entries`). Terminating client connections via `/api/connections/cancel` requires administrative privileges.

### Why is TVHeadend storage information blank?
TVHeadend reports storage metrics only when at least one active DVR recording path is configured under `Configuration > Recording > Digital Video Recorder Profiles`.

### How do I switch languages?
You can toggle between English and Spanish at any time using the language selector in the top navbar or under **Settings > General > Language**.

