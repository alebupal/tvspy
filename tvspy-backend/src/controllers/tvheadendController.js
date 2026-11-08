const tvheadendService = require('../services/tvheadendService');

function isRawUuid(str) {
    if (!str || typeof str !== 'string') return true;
    const clean = str.replace(/[-_]/g, '');
    return clean.length >= 20 && /^[0-9a-fA-F]+$/.test(clean);
}

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

            const [channelsData, tagsMap, servicesMap] = await Promise.all([
                tvheadendService.queryApi(endpoint),
                tvheadendService.getChannelTagsMap(),
                tvheadendService.getServicesMap()
            ]);

            if (channelsData?.entries && Array.isArray(channelsData.entries)) {
                for (const ch of channelsData.entries) {
                    // Mapear tags / categorías a nombres legibles
                    const tagNames = [];
                    if (Array.isArray(ch.tags)) {
                        for (const t of ch.tags) {
                            const name = tagsMap[t] || t;
                            if (name && !isRawUuid(name)) tagNames.push(name);
                        }
                    }
                    ch.tags_names = tagNames;

                    // Mapear servicios y redes
                    const serviceDetails = [];
                    const networks = new Set();

                    // 1. Por lista de servicios vinculados en el canal
                    if (Array.isArray(ch.services)) {
                        for (const sid of ch.services) {
                            const sInfo = servicesMap.byId ? servicesMap.byId[sid] : null;
                            if (sInfo) {
                                const cleanName = isRawUuid(sInfo.name) ? '' : sInfo.name;
                                serviceDetails.push({ ...sInfo, name: cleanName });
                                if (sInfo.network && !isRawUuid(sInfo.network)) networks.add(sInfo.network);
                            } else {
                                serviceDetails.push({ uuid: sid, name: '' });
                            }
                        }
                    }

                    // 2. Por servicios que apuntan al canal
                    if (ch.uuid && servicesMap.byChannel && servicesMap.byChannel[ch.uuid]) {
                        for (const sInfo of servicesMap.byChannel[ch.uuid]) {
                            if (!serviceDetails.some(s => s.uuid === sInfo.uuid)) {
                                const cleanName = isRawUuid(sInfo.name) ? '' : sInfo.name;
                                serviceDetails.push({ ...sInfo, name: cleanName });
                                if (sInfo.network && !isRawUuid(sInfo.network)) networks.add(sInfo.network);
                            }
                        }
                    }

                    // 3. Si no se detectó red desde los servicios, detectar si hay tag de proveedor/red (ej. ·TDTChannels)
                    if (networks.size === 0 && tagNames.length > 0) {
                        for (const t of tagNames) {
                            if (t.startsWith('·') || t.startsWith('.')) {
                                networks.add(t.replace(/^[·.]\s*/, ''));
                            }
                        }
                    }

                    ch.services_details = serviceDetails;
                    ch.networks = Array.from(networks);
                    ch.network_name = ch.networks.join(', ');
                }
            }

            res.json(channelsData);
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
            const start = req.body?.start || req.query?.start;
            const hostname = req.body?.hostname || req.query?.hostname;
            const username = req.body?.username || req.query?.username;

            if (!id && !start && !hostname) {
                return res.status(400).json({ error: 'Faltan parámetros para identificar la conexión a cancelar' });
            }

            // 1. Buscar la suscripción activa en memoria si existe
            const targetSub = tvheadendService.activeSubscriptions.find(s =>
                (id && s.id == id) ||
                (start && s.start == start) ||
                (id && s.start == id) ||
                (hostname && (s.hostname === hostname || s.peer === hostname))
            );

            // 2. Consultar las conexiones activas en TVHeadend (/api/status/connections)
            let connections = [];
            try {
                const connData = await tvheadendService.queryApi('/api/status/connections');
                connections = Array.isArray(connData?.entries) ? connData.entries : (Array.isArray(connData) ? connData : []);
            } catch (connErr) {
                // Silencioso, usaremos fallback si falla la lista
            }

            // 3. Mapear la suscripción con la conexión correspondiente
            let matchedConn = null;
            const targetStart = targetSub?.start || start;
            const targetIp = targetSub?.hostname || targetSub?.peer || hostname;
            const targetUser = targetSub?.username || targetSub?.user || username;

            // Prioridad a) Coincidencia por timestamp exacto de inicio
            if (targetStart) {
                matchedConn = connections.find(c => c.started == targetStart);
            }

            // Prioridad b) Coincidencia por IP de origen (peer) y usuario
            if (!matchedConn && targetIp) {
                matchedConn = connections.find(c =>
                    c.peer === targetIp && (!targetUser || c.user === targetUser)
                );
            }

            // Prioridad c) Coincidencia por ID directo en la lista de conexiones
            if (!matchedConn && id) {
                matchedConn = connections.find(c => c.id == id);
            }

            const connectionIdToCancel = matchedConn ? matchedConn.id : id;

            if (!connectionIdToCancel) {
                return res.status(404).json({ error: 'No se encontró la conexión activa correspondiente en TVHeadend' });
            }

            // 4. Ejecutar cancelación en TVHeadend usando /api/connections/cancel
            let result = null;
            try {
                result = await tvheadendService.queryApi(`/api/connections/cancel?id=${encodeURIComponent(connectionIdToCancel)}`);
            } catch (err1) {
                // Alternativa compatible con versiones variantes de TVHeadend
                try {
                    result = await tvheadendService.queryApi(`/api/status/connections/cancel?id=${encodeURIComponent(connectionIdToCancel)}`);
                } catch (err2) {
                    throw err1;
                }
            }

            res.json({
                success: true,
                message: `Conexión ${connectionIdToCancel} cancelada correctamente`,
                connectionId: connectionIdToCancel,
                result
            });
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

