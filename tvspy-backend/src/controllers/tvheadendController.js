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

    async getDiskSpace(req, res) {
        try {
            let data = null;
            try {
                data = await tvheadendService.queryApi('/api/status/diskspace');
            } catch {
                try {
                    data = await tvheadendService.queryApi('/status/diskspace');
                } catch {
                    data = null;
                }
            }

            let total = 0;
            let free = 0;
            let used = 0;

            const entries = Array.isArray(data?.entries)
                ? data.entries
                : Array.isArray(data)
                ? data
                : [];

            if (entries.length > 0) {
                for (const e of entries) {
                    const eTotal = Number(e.total ?? e.totaldiskspace ?? e.total_space ?? 0) || 0;
                    const eFree = Number(e.free ?? e.freediskspace ?? e.free_space ?? 0) || 0;
                    const eUsed = Number(e.used ?? e.useddiskspace ?? (eTotal > eFree ? eTotal - eFree : 0)) || 0;
                    total += eTotal;
                    free += eFree;
                    used += eUsed;
                }
            } else if (data) {
                total = Number(data.totaldiskspace ?? data.total ?? data.total_space ?? 0) || 0;
                free = Number(data.freediskspace ?? data.free ?? data.free_space ?? 0) || 0;
                used = Number(data.useddiskspace ?? data.used ?? (total > free ? total - free : 0)) || 0;
            }

            const usedPercentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
            const freePercentage = total > 0 ? Math.max(0, 100 - usedPercentage) : 100;
            const isLowSpace = total > 0 && freePercentage < 10;

            res.json({
                total,
                free,
                used,
                usedPercentage,
                freePercentage,
                isLowSpace,
                raw: data
            });
        } catch (err) {
            res.status(502).json({ error: 'Error al consultar espacio en disco de TVHeadend', details: err.message });
        }
    }

    async getCurrentEpg(req, res) {
        try {
            const now = Math.floor(Date.now() / 1000);
            const data = await tvheadendService.queryApi('/api/epg/events/grid?limit=2000');
            const entries = Array.isArray(data?.entries) ? data.entries : [];

            const currentEventsByChannel = {};

            for (const ev of entries) {
                const start = Number(ev.start) || 0;
                const stop = Number(ev.stop) || 0;
                const chanName = (ev.channelName || ev.channelNumber || '').trim();

                if (!chanName) continue;

                if (start <= now && stop >= now) {
                    const durationSeconds = Math.max(1, stop - start);
                    const elapsedSeconds = Math.max(0, now - start);
                    const progress = Math.min(100, Math.max(0, Math.round((elapsedSeconds / durationSeconds) * 100)));
                    const remainingMinutes = Math.max(0, Math.round((stop - now) / 60));

                    currentEventsByChannel[chanName.toLowerCase()] = {
                        eventId: ev.eventId,
                        title: ev.title || 'Sin información',
                        subtitle: ev.subtitle || '',
                        summary: ev.summary || ev.description || '',
                        start,
                        stop,
                        progress,
                        durationMinutes: Math.round(durationSeconds / 60),
                        remainingMinutes,
                        channelName: chanName
                    };
                }
            }

            res.json({
                timestamp: now,
                count: Object.keys(currentEventsByChannel).length,
                events: currentEventsByChannel
            });
        } catch (err) {
            res.status(502).json({ error: 'Error al consultar EPG de TVHeadend', details: err.message });
        }
    }

    async getDvrUpcoming(req, res) {
        try {
            let data = null;
            try {
                data = await tvheadendService.queryApi('/api/dvr/entry/grid_upcoming?limit=200');
            } catch {
                data = await tvheadendService.queryApi('/api/dvr/entry/grid?limit=200');
            }

            const entries = Array.isArray(data?.entries) ? data.entries : [];
            const now = Math.floor(Date.now() / 1000);

            const upcoming = entries
                .filter(e => (Number(e.stop) || 0) >= now || (e.sched_status === 'scheduled' || e.sched_status === 'recording'))
                .sort((a, b) => (Number(a.start) || 0) - (Number(b.start) || 0));

            res.json({
                total: upcoming.length,
                entries: upcoming
            });
        } catch (err) {
            res.status(502).json({ error: 'Error al consultar grabaciones de TVHeadend', details: err.message });
        }
    }
}

module.exports = new TvheadendController();

