const WebSocket = require('ws');
const tvheadendService = require('../services/tvheadendService');

class WsServer {
    constructor() {
        this.wss = null;
        this.clients = new Set();
        this.pingInterval = null;
    }

    init(server) {
        this.wss = new WebSocket.Server({ server, path: '/ws' });

        this.wss.on('connection', (ws, req) => {
            this.clients.add(ws);
            ws.isAlive = true;

            // Heartbeat
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // Enviar estado inicial inmediato al cliente
            const initialPayload = {
                type: 'INIT',
                data: {
                    status: tvheadendService.status,
                    error: tvheadendService.lastError,
                    subscriptions: tvheadendService.activeSubscriptions,
                    metrics: {
                        totalBandwidth: tvheadendService.totalBandwidth,
                        totalConsumed: tvheadendService.totalConsumed,
                        count: tvheadendService.activeSubscriptions.length
                    }
                }
            };
            ws.send(JSON.stringify(initialPayload));

            ws.on('close', () => {
                this.clients.delete(ws);
            });

            ws.on('error', (err) => {
                console.error('WsServer: Client error:', err.message);
                this.clients.delete(ws);
            });
        });

        // Escuchar eventos de TvheadendService y retransmitir a clientes
        tvheadendService.on('status', (statusData) => {
            this.broadcast({
                type: 'STATUS',
                data: statusData
            });
        });

        tvheadendService.on('subscriptions', (subData) => {
            this.broadcast({
                type: 'SUBSCRIPTIONS',
                data: subData
            });
        });

        // Intervalo de ping para mantener conexiones vivas
        this.pingInterval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);

        console.log('WsServer: WebSocket Gateway activo en /ws');
    }

    broadcast(payload) {
        if (!this.wss) return;
        const msg = JSON.stringify(payload);
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(msg);
                } catch (e) {
                    console.error('WsServer: Error sending to client:', e.message);
                }
            }
        }
    }

    destroy() {
        if (this.pingInterval) clearInterval(this.pingInterval);
        if (this.wss) this.wss.close();
    }
}

module.exports = new WsServer();

