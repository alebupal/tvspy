const WebSocket = require('ws');
const { getConfigValues } = require('./configTvheadend');

const wss = new WebSocket.Server({
    host: "127.0.0.1",
    port: "8080"
});

console.log(`WebSocket - Listening for WebSocket connections on ws://127.0.0.1:8080`);

// Utiliza async/await para resolver configValues
(async () => {
    try {
        const configValues = await getConfigValues();

        // Validación de que los valores de configValues no estén vacíos o sean null
        if (!configValues || !configValues.username || !configValues.password || !configValues.hostname || !configValues.port) {
            throw new Error("WebSocket - One or more configuration values are invalid or empty, and the connection to tvheadend cannot be established.");
        }

        // Intento de establecer la conexión WebSocket con manejo de errores
        let ws;
        try {
            ws = new WebSocket(`ws://${configValues.username}:${configValues.password}@${configValues.hostname}:${configValues.port}/comet/ws`, ['tvheadend-comet']);
        } catch (err) {
            throw new Error(`WebSocket - Failed to establish the WebSocket connection: ${err.message}`);
        }

        const messages = ["input status", "subscriptions"];

        ws.on('open', () => {
            console.log(`WebSocket - Connected to tvheadend server at ${configValues.hostname}`);
        });

        ws.on('message', (data) => {
            const rawMessage = JSON.parse(data);
            rawMessage.messages.forEach((message) => {
                if (messages.includes(message.notificationClass)) {
                    const serverMessage = JSON.stringify({
                        message: message
                    });

                    console.log(`WebSocket - Broadcasting ${serverMessage} to all connected clients`);

                    wss.clients.forEach((client) => {
                        client.send(serverMessage);
                    });
                }
            });
        });

        ws.on('error', (err) => {
            console.error(`WebSocket - error: ${err.message}`);
        });

    } catch (error) {
        console.error(`WebSocket - error: ${error.message}`);
    }
})();
