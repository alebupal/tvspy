const registryRepository = require('../repositories/registryRepository');

const timezone = process.env.TZ || 'Europe/Madrid';
const locale = process.env.LOCALE || 'es-ES';

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return new Intl.DateTimeFormat(locale, {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(d);
    } catch (e) {
        return dateStr;
    }
};

class RegistryController {
    async list(req, res) {
        try {
            const {
                page,
                limit,
                search,
                channel,
                username,
                startDate,
                endDate,
                raw
            } = req.query;

            // Compatibilidad hacia atrás si se pide sin paginación explícita
            if (raw === 'true' || (!page && !limit && !search && !channel && !username)) {
                const rows = await registryRepository.getAllRaw();
                const formatted = rows.map(r => ({
                    ...r,
                    start: formatDate(r.start),
                    end: formatDate(r.end)
                }));
                return res.json(formatted);
            }

            const result = await registryRepository.list({
                page: page || 1,
                limit: limit || 50,
                search,
                channel,
                username,
                startDate,
                endDate
            });

            // Formatear fechas para la vista
            result.items = result.items.map(r => ({
                ...r,
                formattedStart: formatDate(r.start),
                formattedEnd: formatDate(r.end)
            }));

            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const row = await registryRepository.getById(id);
            if (!row) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }
            res.json({
                ...row,
                formattedStart: formatDate(row.start),
                formattedEnd: formatDate(row.end)
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async create(req, res) {
        try {
            const { username, channel, hostname, client, service, errors, total_in, start, end } = req.body;
            if (!username || !channel || !hostname || !client || !service || !start) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }
            await registryRepository.insertRecord({
                id: Math.floor(new Date(start).getTime() / 1000),
                username,
                channel,
                hostname,
                client,
                service,
                errors: errors || 0,
                total_in: total_in || 0,
                start,
                end: end || null
            });
            res.json({ message: 'Registro creado con éxito' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { errors, total_in, end } = req.body;
            if (end) {
                await registryRepository.closeRecord(id, end);
            }
            if (errors !== undefined || total_in !== undefined) {
                await registryRepository.updateMetrics(id, { errors, total_in });
            }
            res.json({ message: 'Registro actualizado con éxito' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getUserSummary(req, res) {
        try {
            const { username } = req.params;
            const data = await registryRepository.getUserSummary(username);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getChannelSummary(req, res) {
        try {
            const { channel } = req.params;
            const data = await registryRepository.getChannelSummary(channel);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new RegistryController();

