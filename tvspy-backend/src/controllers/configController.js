const configRepository = require('../repositories/configRepository');
const tvheadendService = require('../services/tvheadendService');
const telegramService = require('./../services/telegramService');
const webhookService = require('../services/webhookService');

const TVHEADEND_KEYS = ['port', 'username', 'password', 'protocol', 'hostname', 'auth'];

class ConfigController {
    async getAll(req, res) {
        try {
            const configs = await configRepository.getAll();
            res.json(configs);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getByName(req, res) {
        try {
            const { name } = req.params;
            const value = await configRepository.getByName(name);
            if (value === null) {
                return res.status(404).json({ error: 'Configuración no encontrada' });
            }
            res.json({ name, value });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getMultiple(req, res) {
        try {
            const { names } = req.body;
            if (!Array.isArray(names)) {
                return res.status(400).json({ error: 'names debe ser un array' });
            }
            const rows = await configRepository.getByNames(names);
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const { name } = req.params;
            const { value } = req.body;

            await configRepository.set(name, value);

            // Si se modifica una credencial de TVHeadend o mínimo tiempo, recargar conexión
            if (TVHEADEND_KEYS.includes(name) || name === 'minimum_time') {
                tvheadendService.reconnect();
            }

            res.json({ message: 'Configuración actualizada con éxito', name, value });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateMultiple(req, res) {
        try {
            const settings = req.body; // { key: val, ... }
            if (typeof settings !== 'object' || settings === null) {
                return res.status(400).json({ error: 'El cuerpo debe ser un objeto con pares clave-valor' });
            }

            await configRepository.updateMultiple(settings);

            // Verificar si alguna clave de tvheadend cambió
            const changedKeys = Object.keys(settings);
            const needsReconnect = changedKeys.some(k => TVHEADEND_KEYS.includes(k) || k === 'minimum_time');
            if (needsReconnect) {
                tvheadendService.reconnect();
            }

            res.json({ message: 'Configuraciones actualizadas con éxito' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async testTvheadend(req, res) {
        try {
            const credentials = req.body; // opcionalmente pasa datos para probar antes de guardar
            const result = await tvheadendService.testConnection(credentials && Object.keys(credentials).length > 0 ? credentials : null);
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message || 'Error al conectar con TVHeadend' });
        }
    }

    async testTelegram(req, res) {
        try {
            let { botToken, chatId } = req.body;
            if (!botToken || !chatId) {
                const configMap = await configRepository.getAllAsObject();
                botToken = botToken || configMap.telegram_bot_token;
                chatId = chatId || configMap.telegram_id;
            }

            const result = await telegramService.sendTestMessage({ botToken, chatId });
            res.json({ success: true, result });
        } catch (err) {
            res.status(400).json({ error: err.response?.data?.description || err.message });
        }
    }

    async testWebhook(req, res) {
        try {
            let { webhookUrl, webhookType } = req.body;
            if (!webhookUrl) {
                const configMap = await configRepository.getAllAsObject();
                webhookUrl = configMap.webhook_url;
                webhookType = webhookType || configMap.webhook_type || 'discord';
            }
            const result = await webhookService.testWebhook({ webhookUrl, webhookType });
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message || 'Error al probar webhook' });
        }
    }
}

module.exports = new ConfigController();

