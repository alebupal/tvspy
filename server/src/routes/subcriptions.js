const WebSocket = require('ws');
const { getConfigValues } = require('./configTvheadend');

const wss = new WebSocket.Server({
    host: "127.0.0.1",
    port: "8080"
});

console.log(`Listening for WebSocket connections on ws://127.0.0.1:8080`);

// Utiliza async/await para resolver configValues
(async () => {
    try {
        const configValues = await getConfigValues();
        const ws = new WebSocket(`ws://${configValues.username}:${configValues.password}@${configValues.hostname}:${configValues.port}/comet/ws`, ['tvheadend-comet']);
        const messages = ["input status", "subscriptions"];

        ws.on('open', () => {
            console.log(`Connected to server tvheadend" at 192.168.5.5`);
        });

        ws.on('message', (data) => {
            const rawMessage = JSON.parse(data);
            rawMessage.messages.forEach((message) => {
                if (messages.includes(message.notificationClass)) {
                    const serverMessage = JSON.stringify({
                        message: message
                    });

                    console.log(`Broadcasting ${serverMessage} to all connected clients`);

                    wss.clients.forEach((client) => {
                        client.send(serverMessage);
                    });
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
})();
