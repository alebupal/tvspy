# TVSPY

Aplicación web para monitorear TVHeadend.
Consiste en backend y frontend.

- Backend - servidor en Node.js con MySQLite.
- Frontend - aplicación en React.js.

Se utiliza WebSocket para guardar logs y mostrar conexiones activas.

## Características

- Ver quién está en línea.
- Registro de todas las reproducciones.
- Notificación en Telegram cuando alguien comienza o deja de reproducir o grabar.
- Estadísticas (vistas principales, canal principal, etc.).
- Notificación vía Telegram cuando alguien ha estado reproduciendo durante x cantidad de tiempo.

[Screenshot](https://github.com/alebupal/tvspy/tree/master/screenshoot)

## Hojas de ruta

- Gráficos en las estadísticas.

## Instalación

Para usarlo, simplemente instala la imagen de Docker <https://hub.docker.com/r/alebupal/tvspy/> y configura la aplicación con la IP y el puerto de TvHeadend en la opción de configuración.

```bash
docker create  \
 --name=tvspy \
 -v <ruta a los datos>:/app/backend/src/database/file \
 -p xxxxx:80 \
 -e TZ=Europe/Madrid \
 -e LOCALE=es-ES \
 alebupal/tvspy:latest \
```

- [Lista Timezone] <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>
- [Lista Locale] <https://simplelocalize.io/data/locales/>

 **¡IMPORTANTE! Una vez configurada la conexión a TVHeadend, el contenedor debe reiniciarse para que el socket del servidor se conecte correctamente y pueda registrar datos.**

## Links

- [Telegram](<https://t.me/tvspy_news>)
- [Docker](<https://hub.docker.com/r/alebupal/tvspy/>)
- [Changelog](<https://github.com/alebupal/tvspy/blob/master/CHANGELOG.MD>)
- [Donación](<https://www.paypal.me/alebupal>)