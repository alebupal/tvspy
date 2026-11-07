const { allSql, getSql, runSql } = require('../database/database');

class RegistryRepository {
    async getActiveRegistries() {
        return await allSql('SELECT * FROM registries WHERE end IS NULL');
    }

    async getById(id) {
        return await getSql('SELECT * FROM registries WHERE id = ?', [id]);
    }

    async insertRecord(data) {
        const {
            id,
            username = 'No user',
            channel = '',
            hostname = '',
            client = '',
            service = '',
            title = '',
            errors = 0,
            total_in = 0,
            start,
            end = null,
            notification_time = 0,
            notification_ip = 0
        } = data;

        const sql = `
            INSERT INTO registries (id, username, channel, hostname, client, service, title, errors, total_in, start, end, notification_time, notification_ip)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await runSql(sql, [
            id,
            username,
            channel,
            hostname,
            client,
            service,
            title,
            errors,
            total_in,
            start,
            end,
            notification_time ? 1 : 0,
            notification_ip ? 1 : 0
        ]);
    }

    async updateMetrics(id, { errors = 0, total_in = 0 }) {
        return await runSql(
            'UPDATE registries SET errors = ?, total_in = ? WHERE id = ?',
            [errors, total_in, id]
        );
    }

    async closeRecord(id, endIso) {
        return await runSql(
            'UPDATE registries SET end = ? WHERE id = ?',
            [endIso, id]
        );
    }

    async setNotificationSent(id, type) {
        if (type === 'time') {
            return await runSql('UPDATE registries SET notification_time = 1 WHERE id = ?', [id]);
        } else if (type === 'ip') {
            return await runSql('UPDATE registries SET notification_ip = 1 WHERE id = ?', [id]);
        }
    }

    async list({ page = 1, limit = 50, search = '', channel = '', username = '', startDate = '', endDate = '' }) {
        const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const conditions = [];
        const params = [];

        if (search) {
            conditions.push('(username LIKE ? OR channel LIKE ? OR hostname LIKE ? OR client LIKE ? OR title LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s, s, s, s);
        }

        if (channel) {
            conditions.push('channel = ?');
            params.push(channel);
        }

        if (username) {
            conditions.push('username = ?');
            params.push(username);
        }

        if (startDate) {
            conditions.push('start >= ?');
            params.push(startDate);
        }

        if (endDate) {
            conditions.push('start <= ?');
            params.push(endDate);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(*) as total FROM registries ${whereClause}`;
        const totalRow = await getSql(countQuery, params);
        const total = totalRow ? totalRow.total : 0;

        const dataQuery = `
            SELECT * FROM registries 
            ${whereClause} 
            ORDER BY start DESC 
            LIMIT ? OFFSET ?
        `;
        const rows = await allSql(dataQuery, [...params, parseInt(limit, 10), offset]);

        return {
            items: rows,
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                pages: Math.ceil(total / parseInt(limit, 10))
            }
        };
    }

    async getAllRaw() {
        return await allSql('SELECT * FROM registries ORDER BY start DESC');
    }

    async getStatistics({ type = 'time', daysAgo = 30, limit = 10 }) {
        const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const safeDays = Math.max(1, parseInt(daysAgo, 10) || 30);
        const dateParam = `-${safeDays} days`;

        let topChannelsQuery, topClientsQuery, topUsersQuery;

        if (type === 'uses') {
            topChannelsQuery = `
                SELECT COALESCE(NULLIF(channel, ''), 'N/A') AS channel, COUNT(*) as count 
                FROM registries 
                WHERE start >= datetime('now', ?)
                GROUP BY COALESCE(NULLIF(channel, ''), 'N/A') 
                ORDER BY count DESC 
                LIMIT ?
            `;
            topClientsQuery = `
                SELECT COALESCE(NULLIF(client, ''), 'N/A') AS client, COUNT(*) as count 
                FROM registries 
                WHERE start >= datetime('now', ?)
                GROUP BY COALESCE(NULLIF(client, ''), 'N/A') 
                ORDER BY count DESC 
                LIMIT ?
            `;
            topUsersQuery = `
                SELECT COALESCE(NULLIF(username, ''), 'N/A') AS username, COUNT(*) as count 
                FROM registries 
                WHERE start >= datetime('now', ?)
                GROUP BY COALESCE(NULLIF(username, ''), 'N/A') 
                ORDER BY count DESC 
                LIMIT ?
            `;
        } else {
            topChannelsQuery = `
                SELECT COALESCE(NULLIF(channel, ''), 'N/A') AS channel, 
                       ROUND(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400)) AS total_time_seconds
                FROM registries 
                WHERE start >= datetime('now', ?)
                GROUP BY COALESCE(NULLIF(channel, ''), 'N/A') 
                ORDER BY total_time_seconds DESC 
                LIMIT ?
            `;
            topClientsQuery = `
                SELECT COALESCE(NULLIF(client, ''), 'N/A') AS client, 
                       ROUND(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400)) AS total_time_seconds
                FROM registries 
                WHERE start >= datetime('now', ?)
                GROUP BY COALESCE(NULLIF(client, ''), 'N/A') 
                ORDER BY total_time_seconds DESC 
                LIMIT ?
            `;
            topUsersQuery = `
                SELECT COALESCE(NULLIF(username, ''), 'N/A') AS username, 
                       ROUND(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400)) AS total_time_seconds
                FROM registries 
                WHERE start >= datetime('now', ?)
                GROUP BY COALESCE(NULLIF(username, ''), 'N/A') 
                ORDER BY total_time_seconds DESC 
                LIMIT ?
            `;
        }

        // Evolución por día
        const activityByDayQuery = `
            SELECT strftime('%Y-%m-%d', start) as date, 
                   COUNT(*) as reproductions, 
                   ROUND(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400)) as total_seconds,
                   COALESCE(SUM(total_in), 0) as total_bandwidth
            FROM registries 
            WHERE start >= datetime('now', ?)
            GROUP BY strftime('%Y-%m-%d', start)
            ORDER BY date ASC
        `;

        // Actividad por hora del día (00 a 23)
        const activityByHourQuery = `
            SELECT strftime('%H', start) as hour, 
                   COUNT(*) as count
            FROM registries
            WHERE start >= datetime('now', ?)
            GROUP BY strftime('%H', start)
            ORDER BY hour ASC
        `;

        // Resumen / KPIs
        const summaryQuery = `
            SELECT 
                COUNT(*) as total_reproductions,
                ROUND(COALESCE(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400), 0)) as total_duration_seconds,
                COALESCE(SUM(total_in), 0) as total_consumed_bytes,
                COUNT(DISTINCT channel) as unique_channels,
                COUNT(DISTINCT username) as unique_users
            FROM registries
            WHERE start >= datetime('now', ?)
        `;

        const lastReproductionsQuery = `
            SELECT * FROM registries 
            WHERE start >= datetime('now', ?)
            ORDER BY start DESC 
            LIMIT ?
        `;

        const [
            topChannels,
            topClients,
            topUsers,
            lastReproductions,
            activityByDay,
            activityByHour,
            summary
        ] = await Promise.all([
            allSql(topChannelsQuery, [dateParam, safeLimit]),
            allSql(topClientsQuery, [dateParam, safeLimit]),
            allSql(topUsersQuery, [dateParam, safeLimit]),
            allSql(lastReproductionsQuery, [dateParam, safeLimit]),
            allSql(activityByDayQuery, [dateParam]),
            allSql(activityByHourQuery, [dateParam]),
            getSql(summaryQuery, [dateParam])
        ]);

        return {
            topChannels,
            topClients,
            topUsers,
            lastReproductions,
            activityByDay,
            activityByHour,
            summary
        };
    }

    async getUserSummary(username) {
        if (!username) return null;

        const summaryQuery = `
            SELECT 
                COUNT(*) as total_plays,
                ROUND(COALESCE(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400), 0)) as total_duration_seconds,
                COALESCE(SUM(total_in), 0) as total_consumed_bytes,
                MAX(start) as last_seen,
                COUNT(DISTINCT channel) as unique_channels
            FROM registries
            WHERE username = ?
        `;

        const topChannelsQuery = `
            SELECT 
                channel,
                COUNT(*) as count,
                ROUND(COALESCE(SUM((julianday(COALESCE(end, datetime('now'))) - julianday(start)) * 86400), 0)) as total_seconds
            FROM registries
            WHERE username = ? AND channel IS NOT NULL AND channel != ''
            GROUP BY channel
            ORDER BY count DESC
            LIMIT 5
        `;

        const recentPlaysQuery = `
            SELECT * FROM registries
            WHERE username = ?
            ORDER BY id DESC
            LIMIT 5
        `;

        const lastKnownClientQuery = `
            SELECT client, hostname
            FROM registries
            WHERE username = ? AND hostname IS NOT NULL AND hostname != ''
            ORDER BY id DESC
            LIMIT 1
        `;

        const [summary, topChannels, recentPlays, lastKnown] = await Promise.all([
            getSql(summaryQuery, [username]),
            allSql(topChannelsQuery, [username]),
            allSql(recentPlaysQuery, [username]),
            getSql(lastKnownClientQuery, [username])
        ]);

        return {
            username,
            summary: summary || { total_plays: 0, total_duration_seconds: 0, total_consumed_bytes: 0, unique_channels: 0 },
            topChannels: topChannels || [],
            recentPlays: recentPlays || [],
            lastKnown: lastKnown || null
        };
    }
}

module.exports = new RegistryRepository();
