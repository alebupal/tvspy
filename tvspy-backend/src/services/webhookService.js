const axios = require('axios');

class WebhookService {
    async sendNotification({ webhookUrl, webhookType = 'generic', title, message, color = 0x3C50E0 }) {
        if (!webhookUrl) return false;

        try {
            if (webhookType === 'discord') {
                // Formato Embed de Discord
                const payload = {
                    username: 'TVSPY',
                    avatar_url: 'https://raw.githubusercontent.com/alebupal/tvspy/main/screenshoot/logo.png',
                    embeds: [
                        {
                            title: title || 'TVSPY Alerta',
                            description: message.replace(/<[^>]*>?/gm, ''), // Quitar etiquetas HTML
                            color: color,
                            timestamp: new Date().toISOString(),
                            footer: {
                                text: 'TVSPY Notification Engine',
                            },
                        },
                    ],
                };
                await axios.post(webhookUrl, payload, { timeout: 8000 });
                return true;
            } else if (webhookType === 'gotify') {
                // Formato Gotify
                const payload = {
                    title: title || 'TVSPY Alerta',
                    message: message.replace(/<[^>]*>?/gm, ''),
                    priority: 5,
                };
                await axios.post(webhookUrl, payload, { timeout: 8000 });
                return true;
            } else {
                // Genérico JSON
                const payload = {
                    event: 'tvspy_notification',
                    title,
                    message: message.replace(/<[^>]*>?/gm, ''),
                    timestamp: new Date().toISOString(),
                };
                await axios.post(webhookUrl, payload, { timeout: 8000 });
                return true;
            }
        } catch (err) {
            console.error('WebhookService: Error enviando webhook:', err.response?.data || err.message);
            return false;
        }
    }

    async testWebhook({ webhookUrl, webhookType = 'discord' }) {
        if (!webhookUrl) {
            throw new Error('La URL del Webhook es requerida para la prueba');
        }

        const success = await this.sendNotification({
            webhookUrl,
            webhookType,
            title: '🚀 TVSPY - Prueba de Webhook',
            message: `¡La integración con ${webhookType.toUpperCase()} funciona correctamente!\nHora: ${new Date().toLocaleString()}`,
            color: 0x10B981,
        });

        if (!success) {
            throw new Error(`Fallo al enviar la prueba al webhook de ${webhookType}`);
        }
        return { success: true };
    }
}

module.exports = new WebhookService();

