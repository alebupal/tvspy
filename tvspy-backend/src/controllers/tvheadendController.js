const tvheadendService = require('../services/tvheadendService');

class TvheadendController {
    async getChannels(req, res) {
        try {
            const { name } = req.query;
            let endpoint = '/api/channel/grid?limit=100000';
            if (name) {
                endpoint += `&filter=${encodeURIComponent(JSON.stringify([{
                    type: 'string',
                    value: name,
                    field: 'name'
                }]))}`;
            }

            const data = await tvheadendService.queryApi(endpoint);
            res.json(data);
        } catch (err) {
            res.status(502).json({ error: 'Error al consultar canales de TVHeadend', details: err.message });
        }
    }

    async getSubscriptions(req, res) {
        try {
            const data = await tvheadendService.queryApi('/api/status/subscriptions');
            res.json(data);
        } catch (err) {
            res.status(502).json({ error: 'Error al consultar suscripciones de TVHeadend', details: err.message });
        }
    }

    async getUsers(req, res) {
        try {
            const data = await tvheadendService.queryApi('/api/access/entry/grid?limit=100000');
            res.json(data);
        } catch (err) {
            res.status(502).json({ error: 'Error al consultar usuarios de TVHeadend', details: err.message });
        }
    }

    async cancelSubscription(req, res) {
        try {
            const id = req.body?.id || req.query?.id;
            if (!id) {
                return res.status(400).json({ error: 'Falta el ID de la suscripción a cancelar' });
            }

            const result = await tvheadendService.queryApi(`/api/status/cancel?id=${id}`);
            res.json({ success: true, message: `Suscripción ${id} cancelada`, result });
        } catch (err) {
            res.status(500).json({ error: 'Error al cancelar la suscripción', details: err.message });
        }
    }

    async getStatus(req, res) {
        res.json({
            status: tvheadendService.status,
            error: tvheadendService.lastError,
            activeCount: tvheadendService.activeSubscriptions.length,
            totalBandwidth: tvheadendService.totalBandwidth,
            totalConsumed: tvheadendService.totalConsumed,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = new TvheadendController();

