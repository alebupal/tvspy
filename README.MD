# TVSPY 3.0.0

Web application to monitor TVHeadend.
It consists of backend and frontend

- Backend - server in nodejs with MYSQLite
- Frontend - app in reactjs

Websoket is used to save logs and display active connections.

## Features

- See who's online
- Record of all reproductions
- Notification on Telegram when someone starts or stops playing or recording
- Statistics (top views, top channel, etc...)
- Notification via Telegram when someone has been playing for x amount of time.

## Roadmaps

- Charts on statistics

[Screenshoot](https://github.com/alebupal/tvspy/tree/master/screenshoot)

## Installation

To use it, simply install the docker image <https://hub.docker.com/r/alebupal/tvspy/> and configure the application with the TvHeadend IP and port in the configuration option.

```
docker create  \
 --name=tvspy \
 -v <path to data>:/app/backend/database.db \
 -p xxxxx:80 \
 alebupal/tvspy:latest \
```

## Canal telegram (<https://t.me/alebupal_tvspy>)

## Docker (<https://hub.docker.com/r/alebupal/tvspy/>)

## Changelog (<https://github.com/alebupal/tvspy/blob/master/CHANGELOG.md>)

## Donación (<https://www.paypal.me/alebupal>)