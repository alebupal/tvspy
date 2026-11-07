# Changelog TVSPY

## [3.1.0] - 2026-11-07

- **Channel & User Analytics & Dual Views**:
  - Added interactive detailed statistics modal for Channels (`ChannelProfileModal`) and Users (`UserProfileModal`) with KPIs (total views, accumulated duration, bandwidth consumed, active viewers/channels, and recent logs).
  - Dual view switcher (Grid vs Compact Detailed Table) for both Channels and Users with `localStorage` preference persistence.
- **Live Stream Monitoring & Control**:
  - Remote stream termination button ("Kill Stream") directly stopping streams via TVHeadend API.
  - Real-time sparkline graph displaying bandwidth fluctuations per stream.
  - GeoIP country flags and private local area network (LAN) detection.
  - Stream quality warning badge displaying signal degradation and error packet counts.
- **Server Health & Maintenance**:
  - TVHeadend heartbeat failure detector: sends alerts on server drop (>2 minutes) and automatic recovery notices.
  - Background auto-purge scheduler with configurable retention days and automatic SQLite database `VACUUM`.
  - One-click SQLite database backup (`.db`) download directly from Settings.
- **Security & Access Control**:
  - Adaptive PIN code lock screen with dynamic pin length dots, physical keyboard numeric support, and auto-submit.
  - Whitelist IP address filtering with visual status badges in registries.
- **Multi-Platform Notifications**:
  - Added support for Discord Rich Embeds, Gotify push notifications, and generic HTTP POST Webhooks alongside Telegram.
  - Configurable server-down notification alerts.
- **UI / UX & System**:
  - Fullscreen / Kiosk mode toggle button in Header.
  - GitHub releases version checker displaying update notices in Header, Sidebar, and Settings.
  - Integrated in-app Changelog and README documentation viewer.
  - Complete Spanish and English localization coverage.
  - High-performance layered backend architecture (Controllers, Services, Repositories) and native WebSocket gateway.

## [3.0.5] - 2026-01-02

- Updated dependencies to the latest versions for improved security and stability.
- Fixed bug preventing Telegram notifications from sending (issue with types and missing default values).
- Frontend: Added missing dependency `styled-components` which caused build errors.
- Frontend: Fixed Mixed Content error by using WSS when appropriate.
- Frontend: Encoded WebSocket credentials to support special characters.

## [3.0.4] - 2025-03-24

- Support for arm32/v7

## [3.0.3] - 2024-11-14

- Add debug mode

## [3.0.2] - 2024-11-11

- Updated dependencies to the latest versions, add TZ and LOCALE.

## [3.0.1] - 2024-08-26

- Updated dependencies to the latest versions for improved security and stability.

## [3.0.0] - 2024-08-26

- Backend: Migrated the backend to Node.js.
- Frontend: Rebuilt the frontend using React.js.
- Database: Implemented MySQL Lite.
- Connection: Integrated WebSocket for connection in TVHeadend.
- In spanish and english

## [2.0.3] - 2024-08-22

- Update workflows.

## [2.0.2] - 2019-01-03

- Added channel logos during import.
- Added logos on the home page.

## [2.0.1] - 2018-12-29

- Fixed issue where notifications did not appear when playback started.
- Added user selector to the "Playback Time by Channel (Minutes)" graph.

## [2.0.0] - 2018-12-05

- Database changes, previous versions are not compatible.
- Added color indicators in logs depending on whether the connection is allowed or not.
- Allowed IPs can now be added in the configuration.
- IP localization.
- Configuration restructuring.
- Menu restructuring.
- Updated base Bootstrap template.
- Added the ability to backup and restore the database.
- Compatibility with TvHeadend when set to English.
- Restructured Dockerfile for improved compatibility.
- Checks for new versions.
- Telegram notification when recording starts or stops.
- Logs when something is recorded, shown as "Recording:" in the player option.
- If the file /var/www/html/bd_backup/backup.sql exists, it is imported at startup.

## [1.2.4] - 2018-06-21

- The TVHeadend API repeats IDs, so from now on, playback is identified using the ID and the start time.
- Rounded time in the log table.
- Changed the title of the "Home" menu.
- The idReproduccion field in the database is now a varchar(200).

## [1.2.3] - 2018-06-01

- Fixed double notification issue.

## [1.2.2] - 2018-06-01

- Fixed issue with extra notification time.

## [1.2.1] - 2018-06-01

- Fixed issue where date was missing in Telegram messages.

## [1.2.0] - 2018-06-01

- Added total duration to user notifications.
