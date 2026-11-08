# Changelog TVSPY

## [3.2.4] - 2026-11-08

- **Fix Kill Stream / Disconnect Playback (`/api/connections/cancel`)**:
  - Replaced invalid `/api/status/cancel` call (which caused 404 errors in TVHeadend) with native TVHeadend `/api/connections/cancel` endpoint.
  - Automatically correlates active subscriptions to active client connections by start timestamp and client peer IP for reliable stream termination.

## [3.2.3] - 2026-11-08

- **Dynamic Version Binding in Sidebar Menu**:
  - Dynamically synchronized the version badge in the sidebar menu with the local package configuration and the backend version service, resolving stale version indicators.
  - Synchronized all package lockfiles across root, backend, and frontend packages.

## [3.2.2] - 2026-11-08

- **Mobile Navigation & Sidebar Fixes**:
  - Added full-screen dark backdrop overlay (`bg-black/60 backdrop-blur-xs`) on mobile devices allowing users to tap outside the sidebar to close it easily.
  - Fixed mobile menu toggle behavior by preventing click event propagation (`e.stopPropagation()`) from hamburger button to document.
  - Positioned mobile sidebar with `fixed inset-y-0` and `overflow-y-auto` so the entire menu and footer links remain completely scrollable on short phone screens and landscape orientation.
  - Added automatic background body scroll lock when mobile menu is opened.
  - Added automatic sidebar closure when navigating between routes.
  - Standardized project license to GNU General Public License v3.0 (GPL-3.0) across all configuration files and documentation.

## [3.2.1] - 2026-11-07

- **Security Updates (Dependabot Remediation)**:
  - Resolved all Dependabot vulnerabilities across backend and frontend dependencies (achieving 0 vulnerabilities in `npm audit`).
  - Enforced secure package overrides in backend for `tar` (^7.5.21), `minimatch` (^11.0.5), and `@tootallnate/once` (^2.0.1).
  - Upgraded frontend `react-router-dom` to v7.18.5, `vite` to v7.3.7, `@babel/core`, and `postcss-selector-parser` resolving open redirect and injection advisories.
- **TVHeadend Storage & Disk Metrics Fix**:
  - Enhanced storage polling to use non-blocking `/comet/poll?immediate=1` requests preventing connection timeouts.
  - Persistent disk space cache ensuring TVHeadend storage capacity and free space are reliably displayed on the dashboard without false empty states.
  - Proactive storage metric retrieval immediately upon WebSocket connection establishment.

## [3.2.0] - 2026-11-07

- **Live EPG in Active Stream Cards**:
  - Real-time EPG integration directly in active stream cards: displays current programme title, remaining duration, and progress bar with tooltip descriptions.
- **TVHeadend Storage & Disk Monitor**:
  - Direct integration with TVHeadend native `/comet/poll` and WebSocket `accessUpdate` events to query partition capacity, free space, and DVR recording utilization.
  - Color-coded progress bar with low-space alerts (< 10%).
- **Upcoming DVR Recordings Panel**:
  - Dedicated "Upcoming DVR Recordings" slide-over modal displaying scheduled recordings, channels, time ranges, and active recording badges.
- **Native Browser Desktop Notifications & Web Audio Chimes**:
  - Web Notification API integration for native OS/browser banner alerts when new playbacks or recordings begin.
  - High-priority security desktop notification when a playback is detected from an unauthorized IP.
  - Zero-dependency Web Audio API acoustic chimes (subtle two-tone chime for new streams and warning chime for unauthorized IPs) with test triggers in Settings.
- **Settings Reorganization & Notification Center**:
  - Unified all alert mechanisms (Desktop, Audio, Telegram, Webhooks) into a single cohesive **Notifications Center** tab.
  - Telegram events and templates are automatically hidden when Telegram notifications are toggled off.
  - Integrated TVHeadend Server Down failure alert directly into Telegram events list.
- **Complete Localization & Cleanup**:
  - 100% Spanish and English localization across all newly introduced components, widgets, and modals.
  - Removed redundant root startup scripts (`dev.bat`, `dev.ps1`) in favor of standard `npm run dev`.
  - Discreet, subtle redesign for the PayPal donation button in sidebar and docs.

## [3.1.0] - 2026-11-07

- **Channel & User Analytics & Dual Views**:
  - Interactive statistics modal for Channels (`ChannelProfileModal`) and Users (`UserProfileModal`) with KPIs (total views, accumulated duration, bandwidth consumed, active viewers/channels, and recent logs).
  - Dual view switcher (Grid vs Compact Detailed Table) for both Channels and Users with `localStorage` preference persistence.
  - Channel logos displayed on live stream cards with automatic caching and fallback to stylized icons.
- **Live Stream Monitoring & Control**:
  - Remote stream termination button ("Kill Stream") directly stopping streams via TVHeadend API.
  - Automatic filtering of internal TVHeadend IPTV/M3U mux scans, service mappers, and EPG grabber tasks.
  - Real-time sparkline graph displaying bandwidth fluctuations per active stream.
  - GeoIP country flags and private local area network (LAN) detection.
  - Stream quality warning badge displaying signal degradation and error packet counts.
  - Single-line horizontal formatting for status badges and live indicators.
- **Security & Access Control**:
  - Adaptive PIN code lock screen with dynamic pin length dots, physical keyboard support, and zero-flicker protected boot.
  - Local server connections (`127.0.0.1`, `localhost`, `::1`) always authorized by default.
  - Interactive IP whitelist manager with chips, quick presets, wildcard matching (`192.168.1.*`), and CIDR subnet support (`10.0.0.0/24`).
  - Optional toggle to automatically authorize all private local network IPs (LAN).
- **Server Health & Maintenance**:
  - TVHeadend heartbeat failure detector: sends alerts on server drop (>2 minutes) and automatic recovery notices.
  - Background auto-purge scheduler with configurable retention days and automatic SQLite database `VACUUM`.
  - One-click SQLite database backup (`.db`) download directly from Settings.
  - Hot reconnection engine on settings change without requiring container restarts.
- **Multi-Platform Notifications**:
  - Added support for Discord Rich Embeds, Gotify push notifications, and generic HTTP POST Webhooks alongside Telegram.
  - Configurable server-down notification alerts.
- **UI / UX & System**:
  - Fullscreen / Kiosk mode toggle button in Header.
  - GitHub releases version checker displaying update notices in Header, Sidebar, and Settings.
  - Integrated in-app Changelog and README documentation viewer.
  - Complete Spanish and English localization coverage across all views, tables, and settings.
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
