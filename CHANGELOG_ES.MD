# Changelog TVSPY

## [3.2.1] - 2026-11-07

- **Actualizaciones de Seguridad (Dependabot)**:
  - Resueltas todas las alertas y vulnerabilidades reportadas por Dependabot en backend y frontend (alcanzando 0 vulnerabilidades en `npm audit`).
  - Aplicadas reglas seguras de `overrides` en backend para `tar` (^7.5.21), `minimatch` (^11.0.5) y `@tootallnate/once` (^2.0.1).
  - Actualizado `react-router-dom` a v7.18.5, `vite` a v7.3.7, `@babel/core` y `postcss-selector-parser` en frontend, solucionando avisos de inyección y redirección abierta.
- **Corrección en Métricas de Espacio de Disco de TVHeadend**:
  - Optimización de consulta a TVHeadend utilizando peticiones no bloqueantes `/comet/poll?immediate=1` evitando timeouts de conexión.
  - Persistencia inteligente de métricas en memoria para que la capacidad y espacio libre se mantengan siempre visibles en el dashboard sin mostrar estados vacíos incorrectos.
  - Consulta preventiva de almacenamiento automática de forma instantánea al establecerse la conexión WebSocket.

## [3.2.0] - 2026-11-07

- **Guía EPG en Vivo en Emisiones**:
  - Integración de guía EPG en tiempo real en las tarjetas de emisión activa: muestra el título del programa en emisión, minutos restantes y barra de progreso temporal interactiva con descripción detallada en tooltip.
- **Monitor de Espacio en Disco de TVHeadend**:
  - Integración nativa con `/comet/poll` y eventos WebSocket `accessUpdate` de TVHeadend para reflejar en tiempo real la capacidad total, espacio libre y uso por grabaciones DVR.
  - Barra de progreso interactiva con aviso preventivo de espacio bajo (<10%).
- **Modal de Próximas Grabaciones DVR**:
  - Vista modal dedicada para "Próximas Grabaciones DVR" con lista cronológica de temporizadores programados, canales, horarios y estado en tiempo real.
- **Notificaciones Nativas de Escritorio y Timbre Acústico**:
  - Alertas visuales nativas del sistema operativo / navegador mediante Web Notification API al iniciarse nuevas emisiones.
  - Notificación de seguridad prioritaria ante detecciones de reproducciones desde IPs no autorizadas.
  - Timbres sonoros sintetizados nativos con Web Audio API (sin dependencias ni descargas de archivos externos) con botones de prueba en Ajustes.
- **Centro de Notificaciones y Ajustes Unificados**:
  - Pestaña unificada de **Centro de Notificaciones** en Ajustes para avisos de escritorio, Telegram y Webhooks/Discord.
  - Ocultación automática de eventos y plantillas de Telegram cuando las notificaciones están desactivadas.
  - Integración del aviso de caída del servidor TVHeadend dentro del listado de eventos de Telegram.
- **Localización Completa y Limpieza de Código**:
  - 100% de paridad y cobertura en español e inglés en todos los nuevos componentes, modales y widgets.
  - Eliminación de scripts redundantes (`dev.bat`, `dev.ps1`) en favor del comando estándar `npm run dev`.
  - Rediseño sutil e integrado del botón de donación de PayPal en la barra lateral y en la vista de documentación.

## [3.1.0] - 2026-11-07

- **Estadísticas y Vistas Duales para Canales y Usuarios**:
  - Nuevo modal interactivo de estadísticas para Canales (`ChannelProfileModal`) y Usuarios (`UserProfileModal`) con KPIs en tiempo real (reproducciones totales, tiempo acumulado, ancho de banda descargado, usuarios/canales más frecuentes e historial reciente).
  - Selector de vista dual (Cuadrícula vs Tabla Detallada Compacta) tanto en Canales como en Usuarios con persistencia en `localStorage`.
  - Logotipos oficiales de canales integrados en las tarjetas de emisión en directo con caché en sesión y fallback automático.
- **Monitoreo y Control de Reproducciones en Vivo**:
  - Botón de detención forzada ("Kill Stream") para cancelar reproducciones activas directamente a través de la API de TVHeadend.
  - Filtro inteligente de suscripciones internas de TVHeadend: descarta automáticamente tareas de escaneo de listas IPTV/M3U, mapeo de servicios y grabadores EPG.
  - Gráfica sparkline dinámica en tiempo real que refleja las oscilaciones de bitrate de cada emisión activa.
  - Geolocalización con banderas de países y detección automática de conexiones en red local (LAN).
  - Insignia de alerta de degradación de señal y paquetes con errores (`errors > 0`).
  - Formato horizontal unificado y sin saltos de línea para insignias de estado (Directo, Habilitado, Activo).
- **Seguridad y Control de Acceso**:
  - Pantalla de bloqueo por código PIN adaptativa a la longitud configurada, con soporte para teclado físico (numérico y retroceso) y arranque seguro en frame 0 sin parpadeo del panel.
  - Conexiones locales del servidor (`127.0.0.1`, `localhost`, `::1`) marcadas siempre como autorizadas por defecto.
  - Gestor visual de lista blanca de IPs mediante chips/etiquetas con presets rápidos, comodines (`192.168.1.*`) y subredes CIDR (`10.0.0.0/24`).
  - Interruptor para autorizar automáticamente todas las IPs de la red local privada (LAN).
- **Mantenimiento y Resiliencia del Servidor**:
  - Detector Heartbeat de TVHeadend: envía notificaciones automáticas ante pérdidas de conexión (>2 minutos) y avisos de recuperación.
  - Programador en segundo plano para auto-purgado configurable de registros antiguos y ejecución automática de `VACUUM` en SQLite para liberar espacio.
  - Descarga directa de copias de seguridad de la base de datos (`.db`) con un solo clic desde Ajustes.
  - Motor de reconexión en caliente inmediata al modificar credenciales sin reiniciar contenedores.
- **Notificaciones Multiplataforma**:
  - Integración completa con Discord (Rich Embeds), Gotify y Webhooks HTTP genéricos junto a Telegram.
  - Alertas configurables de desconexión del servidor TVHeadend.
- **UI / UX y Sistema**:
  - Botón de modo pantalla completa / Kiosk en la cabecera.
  - Verificador de nuevas versiones de GitHub con avisos en la barra superior, barra lateral y sección de ajustes.
  - Visor integrado de Changelog y documentación README en la propia aplicación.
  - Cobertura completa de traducción al español e inglés en todas las secciones, tablas y ajustes.
  - Arquitectura backend modular optimizada en capas (Controladores, Servicios, Repositorios) con pasarela WebSocket nativa.

## [3.0.5] - 2026-01-02

- Seguridad: Actualización de dependencias a las últimas versiones para mejorar la seguridad y la estabilidad.
- Arreglado bug que impedía el envío de notificaciones de Telegram (problema de tipos y valores por defecto faltantes).
- Frontend: Añadida dependencia faltante `styled-components` que causaba errores en el build.
- Frontend: Solucionado error de Mixed Content usando WSS cuando es apropiado.
- Frontend: Codificadas credenciales de WebSocket para soportar caracteres especiales.

## [3.0.4] - 2025-03-24

- Compatibilidad con arm32/v7

## [3.0.3] - 2024-11-14

- Añadir modo debug

## [3.0.2] - 2024-11-11

- Actualización de dependencias a las últimas versiones, añadir TZ y LOCALE.

## [3.0.1] - 2024-08-26

- Seguridad: Actualización de dependencias a las últimas versiones para mejorar la seguridad y la estabilidad.

## [3.0.0] - 2024-08-26

- Backend: Migración del backend a Node.js.
- Frontend: Reconstrucción del frontend utilizando React.js.
- Base de datos: Implementación de MySQL Lite.
- Conexión: Uso de WebSocket para la conexión con TVHeadend.
- En español e inglés

## [2.0.2] - 2019-01-03

- Añadidos logos de canales a la hora de importarlos.
- Añadidos logos en la página de inicio

## [2.0.1] - 2018-12-29

- Arreglado fallo que no notificaba al empezar una reproducción
- Añadido selector de usuarios a la gráfica Tiempo reproducido por canal (Minutos)

## [2.0.0] - 2018-12-05

- Cambios en la BD, anteriores versiones no son compatibles
- Añadidos colores a registro según este o no esté permitida la conexión.
- En configuración se pueden añadir las ip permitidas
- Localización de ip
- Reestructuración configuración
- Reestructuración menú
- Actualizada plantilla base de Bootstrap
- Añadida posibilidad de backup y restaurar la base de datos.
- Compatibilidad si TvHeadend está en inglés.
- Reestructuración del fichero dockerfile para mejorar compatibilidad
- Comprueba si hay una versión nueva
- Notificación por telegram cuando empieza o para de grabar
- Se registra cuando se graba algo, en la opción de reproductor sale como: "Grabando:"
- Si existe el archivo /var/www/html/bd_backup/backup.sql se importa al principio

## [1.2.4] - 2018-06-21

- La API de TVHeadend repite id, por lo que a partir de ahora para identificar las reproducciones se utiliza el id y el tiempo de Inicio
- Redondeo del tiempo en la tabla Registro
- Cambiado el title del menú Inicio
- Ahora el idReproduccion de la BD es un varchar 200

## [1.2.3] - 2018-06-01

- Correción notificación doble

## [1.2.2] - 2018-06-01

- Correción notificación tiempo de más

## [1.2.1] - 2018-06-01

- Correción, no salía la fecha en el mensaje de Telegram

## [1.2.0] - 2018-06-01

- Duración total en notificaciones al usuario
