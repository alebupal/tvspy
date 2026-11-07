const axios = require('axios');

class TelegramService {
    formatMessage(template, values = {}) {
        if (!template) return '';
        return template
            .replace(/%%username%%/g, values.username || 'Desconocido')
            .replace(/%%channel%%/g, values.channel || 'Desconocido')
            .replace(/%%date%%/g, values.date || new Date().toLocaleString())
            .replace(/%%client%%/g, values.client || 'N/A')
            .replace(/%%hostname%%/g, values.hostname || 'N/A');
    }

    async sendMessage({ botToken, chatId, message, isDebug = false }) {
        if (!botToken || !chatId || !message) {
            if (isDebug) {
                console.log('TelegramService: Falta botToken, chatId o message.');
            }
            return false;
        }

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        try {
            await axios.post(url, {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            }, { timeout: 10000 });

            if (isDebug) {
                console.log('TelegramService: Mensaje enviado con éxito.');
            }
            return true;
        } catch (error) {
            console.error('TelegramService: Error enviando mensaje a Telegram:', error.response?.data?.description || error.message);
            return false;
        }
    }

    async sendTestMessage({ botToken, chatId }) {
        if (!botToken || !chatId) {
            throw new Error('El Token del Bot y el Chat ID son obligatorios para la prueba.');
        }

        const testMsg = `🚀 <b>TVSPY - Prueba de Notificación</b>\n\n¡La integración con Telegram funciona correctamente!\n⏰ <i>${new Date().toLocaleString()}</i>`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await axios.post(url, {
            chat_id: chatId,
            text: testMsg,
            parse_mode: 'HTML'
        }, { timeout: 10000 });

        return response.data;
    }
}

module.exports = new TelegramService();

