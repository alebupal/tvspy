const WebSocket = require('ws');
const { getConfigValues } = require('./configTvheadend');
const db = require('../database/database');
const axios = require('axios');

let configValues = {};
let debugLog;

(async () => {
    try {
        // Obtener el valor de debug_mode
        const isDebugMode = await getDebugMode();

        // Función para mostrar logs solo si debug_mode es true
        debugLog = isDebugMode ? console.log : () => {}; // Si es false, no hace nada

        await refreshConfig(); // Inicializa configValues

        // Validación de que los valores de configValues no estén vacíos o sean null
        if (!configValues || !configValues.username || !configValues.password || !configValues.hostname || !configValues.port) {
            throw new Error("WebSocket - One or more configuration values are invalid or empty, and the connection to tvheadend cannot be established.");
        }

        // Intento de establecer la conexión WebSocket con manejo de errores
        let ws;
        try {
            ws = new WebSocket(`ws://${configValues.username}:${configValues.password}@${configValues.hostname}:${configValues.port}/comet/ws`, ['tvheadend-comet']);
        } catch (err) {
            throw new Error(`WebSocket - Failed to establish the WebSocket connection: ${err}`);
        }

        ws.on('open', () => {
            console.log(`WebSocket - Connected to tvheadend server at ${configValues.hostname}`);
        });

        ws.on('message', (data) => {
            try {
                refreshConfig();
                
                const rawMessage = JSON.parse(data);

                debugLog('rawMessage', rawMessage);

                // Obtener la lista de IDs recibidos en el mensaje
                const receivedIds = rawMessage.messages
                    .filter(message => message.notificationClass === "subscriptions")
                    .map(message => message.start);

                // Actualizar registros que no están en los datos recibidos y que no tienen fecha de finalización
                updateExistingRecords(receivedIds, configValues);

                // Insertar nuevos registros siempre que el tiempo de reproducción sea mayor al configurado
                rawMessage.messages.forEach((message) => {
                    if (message.notificationClass === "subscriptions") {
                        const currentTime = Math.floor(Date.now() / 1000); // Fecha y hora actual en formato Unix
                        const playbackTime = currentTime - message.start; // Diferencia en segundos

                        if (playbackTime > configValues.minimum_time) {
                            insertIntoDatabase(message, configValues);
                        }
                    }
                });

            } catch (e) {
                console.error(`WebSocket - Failed to parse message: ${e}`);
            }
        });

        ws.on('error', (err) => {
            console.error(`WebSocket - error: ${err}`);
        });

        ws.on('close', () => {
            console.log('WebSocket - Connection closed');
        });

    } catch (error) {
        console.error(`WebSocket - error: ${error}`);
    }
})();

function unixToISO(unixTimestamp) {
    return new Date(unixTimestamp * 1000).toISOString();
}

// Función para actualizar registros en la base de datos con fecha fin
function updateExistingRecords(receivedStarts, configValues) {
    const nowISO = new Date().toISOString();

    db.all('SELECT id, title, username, channel, start, client, hostname FROM registries WHERE end IS NULL', [], (err, rows) => {
        if (err) {
            console.error('Error fetching records without end date:', err.message);
            return;
        }

        rows.forEach(row => {
            const { id, title, username, channel, start, client, hostname } = row;

            let replacements = {
                username: username,
                channel: channel,
                date: formatISODate(start),
                client: client, 
                hostname: hostname
            };

            // Si el ID no está en la lista de recibidos, actualizar el registro
            if (!receivedStarts.includes(id)) {
                db.run('UPDATE registries SET end = ? WHERE id = ?', [nowISO, id], (err) => {
                    if (err) {
                        console.error('Error updating record with id:', id, err.message);
                        return;
                    }

                    // Verificar el título para determinar qué notificación enviar
                    if (title && title.includes('DVR:')) {
                        if (configValues.telegram_notification === "1" && configValues.telegram_notification_stop_recording === "1") {
                            sendTelegramMessage(
                                formatMessage(configValues.telegram_notification_stop_recording_text, replacements),
                                configValues
                            );
                        }
                    } else {
                        if (configValues.telegram_notification === "1" && configValues.telegram_notification_stop_playback === "1") {
                            sendTelegramMessage(
                                formatMessage(configValues.telegram_notification_stop_playback_text, replacements),
                                configValues
                            );
                        }
                    }

                    debugLog('Record updated with end date for id:', id);
                });
            }
        });
    });
}

// Función para insertar datos en la base de datos
function insertIntoDatabase(data, configValues) {
    const {
        start, 
        errors = 0, 
        hostname = '', 
        client = '', 
        channel = '', 
        service = '', 
        total_in = 0, 
        username = 'No user',
        title = ''
    } = data;

    if (start) {
        // Comprobar si el registro ya existe
        db.get('SELECT id, start, notification_time, notification_ip, hostname, username, channel FROM registries WHERE id = ?', [start], (err, row) => {
            if (err) {
                console.error('Error checking for existing record:', err.message);
                return;
            }

            if (row) {
                const startDate = new Date(row.start);
                const now = new Date();
                const differenceInMinutes = Math.floor((now - startDate) / (1000 * 60));
                const replacements = {
                    username: row.username,
                    channel: row.channel,
                    date: formatISODate(row.start),
                    client: row.client, 
                    hostname: row.hostname
                };
                
                 //Notificaciones Tiempo
                if (configValues.telegram_notification === "1" && 
                    configValues.telegram_notification_time === "1" && 
                    parseInt(differenceInMinutes) > parseInt(configValues.telegram_time_limit) && 
                    !row.notification_time
                ) {
                    sendTelegramMessage(
                        formatMessage(configValues.telegram_notification_time_text, replacements),
                        configValues
                    );
                    db.run(`
                        UPDATE registries
                        SET notification_time = ?
                        WHERE id = ?
                    `, [true, start], (err) => {
                        if (err) {
                            console.error('Error updating record:', err.message);
                            return;
                        }
                        debugLog('notification_time Record updated successfully with id:', start);
                    });
                }
                
                //Notificaciones IP
                const allowedIPs =  configValues.ip_allowed
                    ? configValues.ip_allowed.split(',').map(ip => ip.trim())
                    : [];
                if (configValues.telegram_notification === "1" && 
                    configValues.telegram_notification_ip_not_allowed === "1" &&
                    !allowedIPs.includes(row.hostname) &&
                    !row.notification_ip
                ) {
                    sendTelegramMessage(                        
                        formatMessage(configValues.telegram_notification_ip_not_allowed_text, replacements),
                        configValues
                    );
                    db.run(`
                        UPDATE registries
                        SET notification_ip = ?
                        WHERE id = ?
                    `, [true, start], (err) => {
                        if (err) {
                            console.error('Error updating record:', err.message);
                            return;
                        }
                        debugLog('notification_time Record updated successfully with id:', start);
                    });
                }

                // Si el registro ya existe, actualizar los campos errors, y total_in
                db.run(`
                    UPDATE registries
                    SET errors = ?, total_in = ?
                    WHERE id = ?
                `, [errors, total_in, start], (err) => {
                    if (err) {
                        console.error('Error updating record:', err.message);
                        return;
                    }
                    debugLog('Record updated successfully with id:', start);
                });
                return;
            }

            // Insertar el nuevo registro si no existe
            db.run(`
                INSERT INTO registries (id, username, channel, hostname, client, service, errors, total_in, start, end, title, notification_time, notification_ip)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [start, username, channel, hostname, client, service, errors, total_in, unixToISO(start), null, title, false, false], (err) => {
                if (err) {
                    console.error('Error inserting record:', err.message);
                    return;
                }

                const replacements = {
                    username: username,
                    channel: channel,
                    date: formatISODate(unixToISO(start)),
                    client: client, 
                    hostname: hostname
                };

                if (title && title.includes('DVR:')) {
                    if (configValues.telegram_notification === "1" && configValues.telegram_notification_start_recording === "1") {
                        sendTelegramMessage(
                            formatMessage(configValues.telegram_notification_start_recording_text, replacements),
                            configValues
                        );
                    }
                } else {
                    if (configValues.telegram_notification === "1" && configValues.telegram_notification_start_playback === "1") {
                        sendTelegramMessage(
                            formatMessage(configValues.telegram_notification_start_playback_text, replacements),
                            configValues
                        );
                    }
                }

                debugLog('Record inserted successfully:', start);
            });
        });
    }
}

function sendTelegramMessage(message, configValues) {
    const url = `https://api.telegram.org/bot${configValues.telegram_bot_token}/sendMessage`;
    axios.post(url, {
        chat_id: configValues.telegram_id,
        text: message,
        parse_mode: 'HTML'
    }).then(response => {
        //console.log('Telegram message sent successfully');
    }).catch(error => {
        console.error('Error sending Telegram message:', error.message);
    });
}

async function refreshConfig() {
    try {
        configValues = await getConfigValues();
        //console.log('Config values refreshed');
    } catch (error) {
        console.error('Error refreshing config values:', error.message);
    }
}

function formatMessage(template, values) {
    return template
        .replace('%%username%%', values.username || '')
        .replace('%%channel%%', values.channel || '')
        .replace('%%date%%', values.date || '')
        .replace('%%client%%', values.client || '')
        .replace('%%hostname%%', values.hostname || '');
}

function formatISODate(isoDateString) {
    const date = new Date(isoDateString);

    // Extraer los componentes de la fecha y hora
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes empieza desde 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Formatear como 'YYYY-MM-DD HH:mm:ss'
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getDebugMode() {
    return new Promise((resolve, reject) => {
        // Consulta SQL corregida para obtener el valor de debug_mode
        db.get('SELECT value FROM config WHERE name = ?', ['debug_mode'], (err, row) => {
            if (err) {
                reject('Error fetching debug_mode: ' + err.message);
            } else {
                // Si el valor es 1, lo interpretamos como true (habilitado), y si es 0 como false (deshabilitado)
                resolve(row ? row.value === '1' : false); // Si no existe, consideramos debug_mode como false
            }
        });
    });
}