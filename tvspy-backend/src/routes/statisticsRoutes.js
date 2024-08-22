const express = require('express');
const db = require('../database/database');

const app = express.Router();

app.get('/statistics/general', (req, res) => {
    const type = req.query.type || 'time'; // 'time' o 'uses'
    const daysAgo = req.query.daysAgo || 30; // Tiempo en días, por defecto 30 días
    const limit = parseInt(req.query.limit, 10) || 10; // Límite de resultados, por defecto 10
    
    const dateFilter = `WHERE start >= datetime('now', '-${daysAgo} days')`;

    let topChannelsQuery, topClientsQuery, topUsersQuery;

    if (type === 'uses') {
        topChannelsQuery = `
            SELECT COALESCE(NULLIF(channel, ''), 'N/\A') AS channel, COUNT(*) as count 
            FROM registries 
            ${dateFilter}
            GROUP BY COALESCE(NULLIF(channel, ''), 'N/\A') 
            ORDER BY count DESC 
            LIMIT ${limit};
        `;
        
        topClientsQuery = `
            SELECT COALESCE(NULLIF(client, ''), 'N/\A') AS client, COUNT(*) as count 
            FROM registries 
            ${dateFilter}
            GROUP BY COALESCE(NULLIF(client, ''), 'N/\A') 
            ORDER BY count DESC 
            LIMIT ${limit};
        `;
        
        topUsersQuery = `
            SELECT COALESCE(NULLIF(username, ''), 'N/\A') AS username, COUNT(*) as count 
            FROM registries 
            ${dateFilter}
            GROUP BY COALESCE(NULLIF(username, ''), 'N/\A') 
            ORDER BY count DESC 
            LIMIT ${limit};
        `;
    } else { // por defecto es 'time'
        topChannelsQuery = `
            SELECT COALESCE(NULLIF(channel, ''), 'N/\A') AS channel, 
                   SUM((julianday(end) - julianday(start)) * 24 * 60 * 60) AS total_time_seconds
            FROM registries 
            ${dateFilter}
            GROUP BY COALESCE(NULLIF(channel, ''), 'N/\A') 
            ORDER BY total_time_seconds DESC 
            LIMIT ${limit};
        `;
        
        topClientsQuery = `
            SELECT COALESCE(NULLIF(client, ''), 'N/\A') AS client, 
                   SUM((julianday(end) - julianday(start)) * 24 * 60 * 60) AS total_time_seconds
            FROM registries 
            ${dateFilter}
            GROUP BY COALESCE(NULLIF(client, ''), 'N/\A') 
            ORDER BY total_time_seconds DESC 
            LIMIT ${limit};
        `;
        
        topUsersQuery = `
            SELECT COALESCE(NULLIF(username, ''), 'N/\A') AS username, 
                   SUM((julianday(end) - julianday(start)) * 24 * 60 * 60) AS total_time_seconds
            FROM registries 
            ${dateFilter}
            GROUP BY COALESCE(NULLIF(username, ''), 'N/\A') 
            ORDER BY total_time_seconds DESC 
            LIMIT ${limit};
        `;
    }

    const lastReproductionsQuery = `
        SELECT *
        FROM registries 
        ${dateFilter}
        ORDER BY end DESC 
        LIMIT ${limit};
    `;
    
    db.all(topChannelsQuery, (err, topChannels) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        db.all(topClientsQuery, (err, topClients) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            db.all(topUsersQuery, (err, topUsers) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                db.all(lastReproductionsQuery, (err, lastReproductions) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    
                    res.json({
                        topChannels,
                        topClients,
                        topUsers,
                        lastReproductions
                    });
                });
            });
        });
    });
});

module.exports = app;
