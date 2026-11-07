const WebSocket = require('ws');
const axios = require('axios');
const crypto = require('crypto');
const EventEmitter = require('events');
const configRepository = require('../repositories/configRepository');
const registryRepository = require('../repositories/registryRepository');
const telegramService = require('./telegramService');
const webhookService = require('./webhookService');

const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

class TvheadendService extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.status = 'disconnected'; // 'connected' | 'connecting' | 'disconnected' | 'error'
        this.lastError = null;
        this.reconnectTimer = null;
        this.reconnectInterval = 5000;
        this.isReconnecting = false;
        this.activeSubscriptions = [];
        this.cachedConfig = {};
        this.totalBandwidth = 0;
        this.totalConsumed = 0;
        this.downTimer = null;
        this.downNotified = false;
        this.autoPurgeTimer = null;
        this.latestDiskSpace = null;
        this.latestBoxId = null;
    }

    async init() {
        await this.refreshConfig();
        this.connectWs();
        this.setupAutoPurge();
    }

    async refreshConfig() {
        try {
            this.cachedConfig = await configRepository.getAllAsObject();
        } catch (e) {
            console.error('TvheadendService: Error refreshing config:', e.message);
        }
    }

    isDebug() {
        return this.cachedConfig.debug_mode === '1' || this.cachedConfig.debug_mode === 'true' || this.cachedConfig.debug_mode === true;
    }

    debugLog(...args) {
        if (this.isDebug()) {
            console.log('[TVHeadend Debug]', ...args);
        }
    }

    setStatus(status, error = null) {
        this.status = status;
        this.lastError = error ? (error.message || String(error)) : null;
        this.emit('status', {
            status: this.status,
            error: this.lastError,
            timestamp: new Date().toISOString()
        });

        // Manejo de alertas de caída y recuperación
        if (this.status === 'connected') {
            if (this.downTimer) {
                clearTimeout(this.downTimer);
                this.downTimer = null;
            }
            if (this.downNotified) {
                this.downNotified = false;
                this.notifyServerRecovery();
            }
        } else if (this.status === 'error' || this.status === 'disconnected') {
            if (!this.downTimer && !this.downNotified) {
                // Si tras 2 minutos sigue caído, disparar alerta
                this.downTimer = setTimeout(() => {
                    this.downTimer = null;
                    if (this.status !== 'connected') {
                        this.downNotified = true;
                        this.notifyServerDown();
                    }
                }, 120000);
            }
        }
    }

    async notifyServerDown() {
        if (this.cachedConfig.notify_server_down === '0') return;
        const msg = `🚨 *[Alerta TVSPY]*: El servidor TVHeadend no responde desde hace 2 minutos.\nMotivo: \`${this.lastError || 'Desconectado'}\``;
        console.warn('TvheadendService:', msg);

        try {
            await telegramService.sendMessage({
                botToken: this.cachedConfig.telegram_bot_token,
                chatId: this.cachedConfig.telegram_id,
                message: msg
            });
        } catch (e) {}

        try {
            await webhookService.sendAlert({
                webhookUrl: this.cachedConfig.webhook_url,
                webhookType: this.cachedConfig.webhook_type,
                title: '⚠️ Servidor TVHeadend Caído',
                description: `TVSPY ha perdido la conexión con TVHeadend (${this.lastError || 'Desconectado'})`,
                color: 0xE11D48
            });
        } catch (e) {}
    }

    async notifyServerRecovery() {
        if (this.cachedConfig.notify_server_down === '0') return;
        const msg = `✅ *[Alerta TVSPY]*: La conexión con el servidor TVHeadend se ha restablecido correctamente.`;
        console.log('TvheadendService:', msg);

        try {
            await telegramService.sendMessage({
                botToken: this.cachedConfig.telegram_bot_token,
                chatId: this.cachedConfig.telegram_id,
                message: msg
            });
        } catch (e) {}

        try {
            await webhookService.sendAlert({
                webhookUrl: this.cachedConfig.webhook_url,
                webhookType: this.cachedConfig.webhook_type,
                title: '✅ Conexión con TVHeadend Restablecida',
                description: 'TVSPY vuelve a comunicarse con normalidad con TVHeadend',
                color: 0x10B981
            });
        } catch (e) {}
    }

    setupAutoPurge() {
        if (this.autoPurgeTimer) clearInterval(this.autoPurgeTimer);
        // Comprobar cada 12 horas si procede purgar
        this.autoPurgeTimer = setInterval(() => {
            this.runAutoPurge();
        }, 12 * 60 * 60 * 1000);
        // Primera ejecución en segundo plano a los 10 segundos del arranque
        setTimeout(() => this.runAutoPurge(), 10000);
    }

    async runAutoPurge() {
        try {
            const configMap = await configRepository.getAllAsObject();
            if (configMap.auto_purge_enabled === '1' || configMap.auto_purge_enabled === 'true') {
                const days = Math.max(7, parseInt(configMap.auto_purge_days || '90', 10));
                const { runSql, getSql } = require('../database/database');
                const dateParam = `-${days} days`;
                const toDel = await getSql(`SELECT COUNT(*) as count FROM registries WHERE start < datetime('now', ?)`, [dateParam]);
                if (toDel && toDel.count > 0) {
                    await runSql(`DELETE FROM registries WHERE start < datetime('now', ?)`, [dateParam]);
                    await runSql('VACUUM');
                    console.log(`[Auto-Purge] Se han purgado automáticamente ${toDel.count} registros antiguos (> ${days} días) y ejecutado VACUUM.`);
                }
            }
        } catch (err) {
            console.error('[Auto-Purge] Error en la purga automática:', err.message);
        }
    }

    async reconnect() {
        console.log('TvheadendService: Forcing reconnection due to config update...');
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            try {
                this.ws.removeAllListeners();
                this.ws.terminate();
            } catch (err) {
                // ignore
            }
            this.ws = null;
        }
        await this.refreshConfig();
        this.reconnectInterval = 5000;
        this.connectWs();
    }

    connectWs() {
        const { username, password, hostname, port } = this.cachedConfig;

        if (!username || !password || !hostname || !port) {
            this.setStatus('disconnected', 'Faltan credenciales de conexión con TVHeadend');
            this.debugLog('No se puede conectar a WS: Configuración incompleta.');
            return;
        }

        const wsUrl = `ws://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}:${port}/comet/ws`;

        this.setStatus('connecting');
        this.debugLog(`Iniciando conexión WebSocket a: ${hostname}:${port}`);

        try {
            this.ws = new WebSocket(wsUrl, ['tvheadend-comet'], {
                handshakeTimeout: 8000
            });
        } catch (err) {
            console.error('TvheadendService: Error al instanciar WebSocket:', err.message);
            this.handleDisconnect(err);
            return;
        }

        this.ws.on('open', () => {
            console.log(`TvheadendService: Conectado a TVHeadend en ${hostname}:${port}`);
            this.setStatus('connected');
            this.reconnectInterval = 5000; // Resetear intervalo tras éxito
            // Consultar espacio en disco inmediatamente al conectar
            this.fetchDiskSpace().catch(() => {});
        });

        this.ws.on('message', async (data) => {
            try {
                const rawMessage = JSON.parse(data.toString());
                await this.handleWsMessage(rawMessage);
            } catch (e) {
                console.error('TvheadendService: Error procesando mensaje WS:', e.message);
            }
        });

        this.ws.on('error', (err) => {
            console.error('TvheadendService: Error en WebSocket:', err.message);
            this.handleDisconnect(err);
        });

        this.ws.on('close', (code, reason) => {
            console.log(`TvheadendService: Conexión WebSocket cerrada (${code})`);
            this.handleDisconnect(new Error(`Conexión cerrada (${code})`));
        });
    }

    handleDisconnect(error) {
        this.setStatus('error', error);
        if (this.ws) {
            try {
                this.ws.removeAllListeners();
            } catch (e) {}
            this.ws = null;
        }

        // Programar reconexión automática si no está programada
        if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
                this.reconnectTimer = null;
                this.debugLog(`Reintentando conexión con TVHeadend...`);
                this.connectWs();
            }, this.reconnectInterval);

            // Backoff exponencial hasta máx 30s
            this.reconnectInterval = Math.min(this.reconnectInterval * 1.5, 30000);
        }
    }

    isScanOrInternalSubscription(sub) {
        if (!sub) return true;

        // Si es una grabación de DVR, nunca es un escaneo interno
        if (sub.title && sub.title.includes('DVR:')) {
            return false;
        }

        const title = (sub.title || '').toLowerCase().trim();
        const client = (sub.client || '').toLowerCase().trim();
        const channel = (sub.channel || '').trim();
        const hostname = (sub.hostname || '').trim();
        const username = (sub.username || '').toLowerCase().trim();

        // 1. Detección explícita de escaneo o tareas internas en title o client
        const scanKeywords = ['scan', 'epggrab', 'epg', 'service mapper', 'probe', 'mux scan'];
        if (scanKeywords.some(kw => title.includes(kw) || client.includes(kw))) {
            return true;
        }

        // 2. Si no tiene canal, ni usuario real, ni cliente, ni IP/hostname, es un escaneo de mux/servicio interno
        const hasChannel = channel.length > 0;
        const hasUser = username.length > 0 && username !== 'no user' && username !== 'sin usuario';
        const hasClient = client.length > 0 && client !== 'n/a';
        const hasHostname = hostname.length > 0 && hostname !== 'n/a' && hostname !== '127.0.0.1' && hostname !== '::1';

        // Para ser una emisión legítima visible para el usuario, debe tener al menos:
        // (un canal asociado) O (una IP remota y un cliente/usuario que está viendo el servicio en bruto)
        if (!hasChannel && !hasUser && !hasClient && !hasHostname) {
            return true;
        }

        if (!hasChannel && (!hasClient || !hasHostname)) {
            return true;
        }

        return false;
    }

    isLocalOrServerIp(ip) {
        if (!ip) return true;
        const clean = ip.trim().replace(/^::ffff:/, '');
        return (
            clean === '127.0.0.1' ||
            clean === '::1' ||
            clean.toLowerCase() === 'localhost' ||
            clean.startsWith('127.') ||
            clean === '0.0.0.0' ||
            clean.toLowerCase() === 'server' ||
            clean.toLowerCase() === 'n/a'
        );
    }

    isPrivateLanIp(ip) {
        if (!ip) return false;
        const clean = ip.trim().replace(/^::ffff:/, '');
        if (this.isLocalOrServerIp(clean)) return true;

        const parts = clean.split('.').map(Number);
        if (parts.length === 4 && !parts.some(isNaN)) {
            if (parts[0] === 10) return true;
            if (parts[0] === 192 && parts[1] === 168) return true;
            if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
            if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
            if (parts[0] === 169 && parts[1] === 254) return true;
        }
        return false;
    }

    matchIpPattern(ip, pattern) {
        if (!ip || !pattern) return false;
        const cleanIp = ip.trim().replace(/^::ffff:/, '');
        const cleanPattern = pattern.trim().replace(/^::ffff:/, '');

        if (cleanIp === cleanPattern) return true;

        if (cleanPattern.includes('*')) {
            const escaped = cleanPattern
                .split('.')
                .map(part => part === '*' ? '\\d+' : part)
                .join('\\.');
            try {
                return new RegExp(`^${escaped}$`).test(cleanIp);
            } catch {
                return false;
            }
        }

        if (cleanPattern.includes('/')) {
            const [subIp, maskBitsStr] = cleanPattern.split('/');
            const maskBits = parseInt(maskBitsStr, 10);
            if (!isNaN(maskBits) && maskBits >= 0 && maskBits <= 32) {
                const ipToNum = s => s.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
                try {
                    const ipNum = ipToNum(cleanIp);
                    const subNum = ipToNum(subIp);
                    const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
                    return (ipNum & mask) === (subNum & mask);
                } catch {
                    return false;
                }
            }
        }

        return false;
    }

    checkIpAuthorized(ip, allowedConfigString, allowLan = false) {
        if (!ip) return true;
        if (this.isLocalOrServerIp(ip)) return true;
        if (allowLan && this.isPrivateLanIp(ip)) return true;
        if (!allowedConfigString || !allowedConfigString.trim()) return true;

        const patterns = allowedConfigString
            .split(/[,\n;]/)
            .map(p => p.trim())
            .filter(Boolean);

        if (patterns.length === 0) return true;
        return patterns.some(pattern => this.matchIpPattern(ip, pattern));
    }

    async handleWsMessage(rawMessage) {
        if (!rawMessage) return;

        if (rawMessage.boxid) {
            this.latestBoxId = rawMessage.boxid;
        }

        const msgs = Array.isArray(rawMessage.messages)
            ? rawMessage.messages
            : (rawMessage.notificationClass ? [rawMessage] : []);

        // Capturar métricas de espacio en disco de TVHeadend si están presentes en cualquier mensaje (ej. accessUpdate)
        for (const m of msgs) {
            if (m.totaldiskspace !== undefined || m.freediskspace !== undefined) {
                const total = Number(m.totaldiskspace) || 0;
                const free = Number(m.freediskspace) || 0;
                const usedTvh = Number(m.useddiskspace) || 0;
                const used = total > free ? (total - free) : usedTvh;
                if (total > 0 || free > 0) {
                    this.latestDiskSpace = {
                        total,
                        free,
                        used,
                        usedByTvh: usedTvh,
                        updatedAt: Date.now()
                    };
                }
                break;
            }
        }

        // Filtrar suscripciones y descartar escaneos internos de muxes/EPG/listas m3u
        const rawSubscriptionMsgs = msgs.filter(m => m.notificationClass === 'subscriptions');
        const subscriptionMsgs = rawSubscriptionMsgs.filter(m => !this.isScanOrInternalSubscription(m));

        this.activeSubscriptions = subscriptionMsgs;

        // Calcular métricas instantáneas
        this.totalBandwidth = subscriptionMsgs.reduce((sum, m) => sum + (m.in || 0), 0);
        this.totalConsumed = subscriptionMsgs.reduce((sum, m) => sum + (m.total_in || 0), 0);

        // Emitir a los clientes conectados al backend
        this.emit('subscriptions', {
            subscriptions: this.activeSubscriptions,
            metrics: {
                totalBandwidth: this.totalBandwidth,
                totalConsumed: this.totalConsumed,
                count: this.activeSubscriptions.length
            }
        });

        // Extraer los start IDs recibidos
        const receivedStarts = subscriptionMsgs.map(m => m.start);

        // Actualizar registros que ya no están activos
        await this.checkEndedStreams(receivedStarts);

        // Procesar nuevos o existentes
        const minTime = parseInt(this.cachedConfig.minimum_time || '10', 10);
        const currentTime = Math.floor(Date.now() / 1000);

        for (const msg of subscriptionMsgs) {
            const playbackTime = currentTime - msg.start;
            if (playbackTime >= minTime) {
                await this.processActiveStream(msg);
            }
        }
    }

    async checkEndedStreams(receivedStarts) {
        try {
            const activeDbRows = await registryRepository.getActiveRegistries();
            const nowIso = new Date().toISOString();

            for (const row of activeDbRows) {
                if (!receivedStarts.includes(row.id)) {
                    await registryRepository.closeRecord(row.id, nowIso);
                    this.debugLog(`Registro ${row.id} cerrado con fecha fin.`);

                    // Notificación fin de reproducción o grabación
                    const replacements = {
                        username: row.username,
                        channel: row.channel,
                        date: new Date().toLocaleString(),
                        client: row.client,
                        hostname: row.hostname
                    };
                    const isDvr = row.title && row.title.includes('DVR:');

                    // Notificación Webhook / Discord
                    if (this.cachedConfig.webhook_enabled === '1' || this.cachedConfig.webhook_enabled === 'true') {
                        const actionTitle = isDvr ? '⏺️ Grabación DVR Finalizada' : '⏹️ Reproducción Finalizada';
                        const text = `${row.username} ha parado de ${isDvr ? 'grabar' : 'reproducir'} ${row.channel}`;
                        webhookService.sendNotification({
                            webhookUrl: this.cachedConfig.webhook_url,
                            webhookType: this.cachedConfig.webhook_type || 'discord',
                            title: actionTitle,
                            message: text,
                            color: 0xEF4444 // Rojo
                        }).catch(() => {});
                    }
                    if (this.cachedConfig.telegram_notification === '1' || this.cachedConfig.telegram_notification === 'true') {
                        if (isDvr && (this.cachedConfig.telegram_notification_stop_recording === '1' || this.cachedConfig.telegram_notification_stop_recording === 'true')) {
                            const template = this.cachedConfig.telegram_notification_stop_recording_text || 'DVR ha finalizado grabación de %%channel%%';
                            await telegramService.sendMessage({
                                botToken: this.cachedConfig.telegram_bot_token,
                                chatId: this.cachedConfig.telegram_id,
                                message: telegramService.formatMessage(template, replacements),
                                isDebug: this.isDebug()
                            });
                        } else if (!isDvr && (this.cachedConfig.telegram_notification_stop_playback === '1' || this.cachedConfig.telegram_notification_stop_playback === 'true')) {
                            const template = this.cachedConfig.telegram_notification_stop_playback_text || 'El usuario %%username%% ha parado de reproducir %%channel%%';
                            await telegramService.sendMessage({
                                botToken: this.cachedConfig.telegram_bot_token,
                                chatId: this.cachedConfig.telegram_id,
                                message: telegramService.formatMessage(template, replacements),
                                isDebug: this.isDebug()
                            });
                        }
                    }
                }
            }
        } catch (e) {
            console.error('TvheadendService: Error en checkEndedStreams:', e.message);
        }
    }

    async processActiveStream(msg) {
        try {
            const existing = await registryRepository.getById(msg.start);
            const now = new Date();

            if (existing) {
                // Actualizar métricas
                await registryRepository.updateMetrics(msg.start, {
                    errors: msg.errors || 0,
                    total_in: msg.total_in || 0
                });

                const startDate = new Date(existing.start);
                const diffMinutes = Math.floor((now - startDate) / 60000);

                const replacements = {
                    username: existing.username,
                    channel: existing.channel,
                    date: startDate.toLocaleString(),
                    client: existing.client,
                    hostname: existing.hostname
                };

                // Notificación por límite de tiempo
                const timeLimit = parseInt(this.cachedConfig.telegram_time_limit || '0', 10);
                if (
                    (this.cachedConfig.telegram_notification === '1' || this.cachedConfig.telegram_notification === 'true') &&
                    (this.cachedConfig.telegram_notification_time === '1' || this.cachedConfig.telegram_notification_time === 'true') &&
                    timeLimit > 0 &&
                    diffMinutes >= timeLimit &&
                    !existing.notification_time
                ) {
                    const template = this.cachedConfig.telegram_notification_time_text || 'Atención: %%username%% lleva más de tiempo reproduciendo %%channel%%';
                    await telegramService.sendMessage({
                        botToken: this.cachedConfig.telegram_bot_token,
                        chatId: this.cachedConfig.telegram_id,
                        message: telegramService.formatMessage(template, replacements),
                        isDebug: this.isDebug()
                    });
                    await registryRepository.setNotificationSent(msg.start, 'time');
                }

                // Notificación por IP no permitida
                const isAuthorized = this.checkIpAuthorized(
                    existing.hostname,
                    this.cachedConfig.ip_allowed,
                    this.cachedConfig.allow_lan_ips === '1' || this.cachedConfig.allow_lan_ips === 'true'
                );

                if (
                    (this.cachedConfig.telegram_notification === '1' || this.cachedConfig.telegram_notification === 'true') &&
                    (this.cachedConfig.telegram_notification_ip_not_allowed === '1' || this.cachedConfig.telegram_notification_ip_not_allowed === 'true') &&
                    !isAuthorized &&
                    !existing.notification_ip
                ) {
                    const template = this.cachedConfig.telegram_notification_ip_not_allowed_text || 'Alerta: Reproducción desde IP no permitida %%hostname%% por %%username%%';
                    await telegramService.sendMessage({
                        botToken: this.cachedConfig.telegram_bot_token,
                        chatId: this.cachedConfig.telegram_id,
                        message: telegramService.formatMessage(template, replacements),
                        isDebug: this.isDebug()
                    });
                    await registryRepository.setNotificationSent(msg.start, 'ip');
                }
            } else {
                // Nuevo registro
                const startIso = new Date(msg.start * 1000).toISOString();
                await registryRepository.insertRecord({
                    id: msg.start,
                    username: msg.username || 'No user',
                    channel: msg.channel || '',
                    hostname: msg.hostname || '',
                    client: msg.client || '',
                    service: msg.service || '',
                    title: msg.title || '',
                    errors: msg.errors || 0,
                    total_in: msg.total_in || 0,
                    start: startIso,
                    end: null
                });

                this.debugLog(`Nuevo stream insertado: ${msg.start} (${msg.username} - ${msg.channel})`);

                // Notificación inicio
                const replacements = {
                    username: msg.username || 'No user',
                    channel: msg.channel || '',
                    date: new Date(msg.start * 1000).toLocaleString(),
                    client: msg.client || '',
                    hostname: msg.hostname || ''
                };

                const isDvr = msg.title && msg.title.includes('DVR:');

                // Notificación Webhook / Discord al iniciar
                if (this.cachedConfig.webhook_enabled === '1' || this.cachedConfig.webhook_enabled === 'true') {
                    const actionTitle = isDvr ? '🔴 Grabación DVR Iniciada' : '▶️ Nueva Reproducción Iniciada';
                    const text = `${msg.username || 'Usuario'} ha comenzado a ${isDvr ? 'grabar' : 'reproducir'} **${msg.channel}** (Cliente: ${msg.client || 'N/A'}, IP: ${msg.hostname || 'N/A'})`;
                    webhookService.sendNotification({
                        webhookUrl: this.cachedConfig.webhook_url,
                        webhookType: this.cachedConfig.webhook_type || 'discord',
                        title: actionTitle,
                        message: text,
                        color: 0x10B981 // Verde
                    }).catch(() => {});
                }
                if (this.cachedConfig.telegram_notification === '1' || this.cachedConfig.telegram_notification === 'true') {
                    if (isDvr && (this.cachedConfig.telegram_notification_start_recording === '1' || this.cachedConfig.telegram_notification_start_recording === 'true')) {
                        const template = this.cachedConfig.telegram_notification_start_recording_text || 'DVR ha comenzado grabación de %%channel%%';
                        await telegramService.sendMessage({
                            botToken: this.cachedConfig.telegram_bot_token,
                            chatId: this.cachedConfig.telegram_id,
                            message: telegramService.formatMessage(template, replacements),
                            isDebug: this.isDebug()
                        });
                    } else if (!isDvr && (this.cachedConfig.telegram_notification_start_playback === '1' || this.cachedConfig.telegram_notification_start_playback === 'true')) {
                        const template = this.cachedConfig.telegram_notification_start_playback_text || 'El usuario %%username%% ha empezado a reproducir %%channel%%';
                        await telegramService.sendMessage({
                            botToken: this.cachedConfig.telegram_bot_token,
                            chatId: this.cachedConfig.telegram_id,
                            message: telegramService.formatMessage(template, replacements),
                            isDebug: this.isDebug()
                        });
                    }
                }
            }
        } catch (e) {
            console.error('TvheadendService: Error procesando stream:', e.message);
        }
    }

    // Cliente REST con Digest y Basic Auth para consultas a la API de TVHeadend
    async queryApi(endpoint, customCredentials = null) {
        const creds = customCredentials || this.cachedConfig;
        const protocol = creds.protocol || 'http';
        const hostname = creds.hostname;
        const port = creds.port;
        const username = creds.username;
        const password = creds.password;
        const authType = creds.auth && creds.auth.trim() !== '' ? creds.auth : 'digest';

        if (!hostname || !port || !username || !password) {
            throw new Error('Configuración de TVHeadend incompleta');
        }

        const fullUrl = `${protocol}://${hostname}:${port}${endpoint}`;

        if (authType === 'plain') {
            const resp = await axios.get(fullUrl, {
                auth: { username, password },
                timeout: 8000
            });
            return resp.data;
        }

        // Digest Auth
        try {
            const initialResp = await axios.get(fullUrl, { timeout: 8000 });
            return initialResp.data;
        } catch (err) {
            if (err.response && err.response.status === 401) {
                const authHeader = err.response.headers['www-authenticate'];
                if (!authHeader) {
                    throw new Error('TVHeadend no devolvió cabecera WWW-Authenticate para Digest');
                }

                const realmMatch = authHeader.match(/realm="([^"]+)"/);
                const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

                if (!realmMatch || !nonceMatch) {
                    throw new Error('No se pudo extraer realm o nonce de la cabecera WWW-Authenticate');
                }

                const realm = realmMatch[1];
                const nonce = nonceMatch[1];
                const cnonce = crypto.randomBytes(16).toString('hex');
                const nc = '00000001';
                const qop = 'auth';
                const method = 'GET';
                const uri = endpoint;

                const A1 = md5(`${username}:${realm}:${password}`);
                const A2 = md5(`${method}:${uri}`);
                const responseHash = md5(`${A1}:${nonce}:${nc}:${cnonce}:${qop}:${A2}`);

                const authDigestHeader = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", algorithm="MD5", response="${responseHash}", qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;

                const finalResp = await axios.get(fullUrl, {
                    headers: { Authorization: authDigestHeader },
                    timeout: 8000
                });
                return finalResp.data;
            }
            throw err;
        }
    }

    async fetchDiskSpace() {
        try {
            const queryParams = this.latestBoxId
                ? `?boxid=${encodeURIComponent(this.latestBoxId)}&immediate=1`
                : '?immediate=1';
            const pollRes = await this.queryApi(`/comet/poll${queryParams}`);
            if (pollRes?.boxid) {
                this.latestBoxId = pollRes.boxid;
            }
            if (pollRes?.messages && Array.isArray(pollRes.messages)) {
                for (const m of pollRes.messages) {
                    if (m.totaldiskspace !== undefined || m.freediskspace !== undefined) {
                        const total = Number(m.totaldiskspace) || 0;
                        const free = Number(m.freediskspace) || 0;
                        const usedTvh = Number(m.useddiskspace) || 0;
                        const used = total > free ? (total - free) : usedTvh;
                        if (total > 0 || free > 0) {
                            this.latestDiskSpace = {
                                total,
                                free,
                                used,
                                usedByTvh: usedTvh,
                                updatedAt: Date.now()
                            };
                            return this.latestDiskSpace;
                        }
                    }
                }
            }
        } catch (e) {
            this.debugLog(`TvheadendService: Error consultando /comet/poll: ${e.message}`);
        }
        return this.latestDiskSpace;
    }

    async testConnection(credentials) {
        try {
            const data = await this.queryApi('/api/serverinfo', credentials);
            return { success: true, serverInfo: data };
        } catch (err) {
            try {
                // Alternativa común en TVHeadend
                const data = await this.queryApi('/api/status/subscriptions', credentials);
                return { success: true, serverInfo: data };
            } catch (err2) {
                throw new Error(err2.response?.data?.error || err.message || 'No se pudo conectar a TVHeadend');
            }
        }
    }
}

module.exports = new TvheadendService();

