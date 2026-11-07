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
            let diskData = tvheadendService.latestDiskSpace;

            // Si no tenemos datos o tienen más de 30 segundos, intentar refrescar usando /comet/poll?immediate=1
            const isStale = !diskData || !diskData.total || (Date.now() - (diskData.updatedAt || 0) > 30000);
            if (isStale) {
                const fresh = await tvheadendService.fetchDiskSpace();
                if (fresh && fresh.total > 0) {
                    diskData = fresh;
                }
            }

            // Fallback: si aún no hay datos y existe un valor previo en memoria con total > 0, mantenerlo siempre
            if ((!diskData || diskData.total === 0) && tvheadendService.latestDiskSpace && tvheadendService.latestDiskSpace.total > 0) {
                diskData = tvheadendService.latestDiskSpace;
            }

            const total = diskData?.total || 0;
            const free = diskData?.free || 0;
            const used = diskData?.used || 0;
            const usedByTvh = diskData?.usedByTvh ?? 0;

            const usedPercentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
            const freePercentage = total > 0 ? Math.max(0, 100 - usedPercentage) : 100;
            const isLowSpace = total > 0 && freePercentage < 10;

            res.json({
                total,
                free,
                used,
                usedByTvh,
                usedPercentage,
                freePercentage,
                isLowSpace
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

