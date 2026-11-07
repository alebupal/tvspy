const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { runSql, getSql } = require('../database/database');
const geoIpService = require('../services/geoIpService');
const versionService = require('../services/versionService');

const dbPath = path.join(__dirname, '../database/file/database.db');

// Obtener información del estado de la base de datos
router.get('/system/db-info', async (req, res) => {
    try {
        let sizeBytes = 0;
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            sizeBytes = stats.size;
        }

        const countRow = await getSql('SELECT COUNT(*) as total FROM registries');
        const totalRegistries = countRow ? countRow.total : 0;

        res.json({
            sizeBytes,
            totalRegistries,
            dbPath
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Descargar backup de la base de datos
router.get('/system/backup', (req, res) => {
    try {
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ error: 'Archivo de base de datos no encontrado' });
        }

        const dateStr = new Date().toISOString().slice(0, 10);
        const downloadName = `tvspy_backup_${dateStr}.db`;

        res.download(dbPath, downloadName, (err) => {
            if (err) {
                console.error('Error al descargar backup:', err);
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Purgar registros antiguos y compactar la base de datos
router.post('/system/purge', async (req, res) => {
    try {
        const { days = 180 } = req.body;
        const safeDays = Math.max(7, parseInt(days, 10) || 180);
        const dateParam = `-${safeDays} days`;

        // Contar cuántos se eliminarán
        const toDeleteRow = await getSql(`SELECT COUNT(*) as count FROM registries WHERE start < datetime('now', ?)`, [dateParam]);
        const deletedCount = toDeleteRow ? toDeleteRow.count : 0;

        // Eliminar
        await runSql(`DELETE FROM registries WHERE start < datetime('now', ?)`, [dateParam]);

        // Ejecutar VACUUM para recuperar espacio en disco
        await runSql('VACUUM');

        res.json({
            message: `Se han purgado ${deletedCount} registros anteriores a ${safeDays} días`,
            deletedCount,
            days: safeDays
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Consulta de GeoIP con flags
router.get('/system/geoip/:ip', async (req, res) => {
    try {
        const { ip } = req.params;
        const info = await geoIpService.lookup(ip);
        res.json(info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comprobar actualizaciones de TVSPY desde GitHub
router.get('/system/check-update', async (req, res) => {
    try {
        const force = req.query.force === 'true' || req.query.force === '1';
        const updateInfo = await versionService.checkUpdate(force);
        res.json(updateInfo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener versión local
router.get('/system/version', (req, res) => {
    res.json({
        version: versionService.getLocalVersion()
    });
});

module.exports = router;
