const express = require('express');
const db = require('../database/database');

const app = express.Router();

// Endpoint para consultar la tabla 'config'
app.get('/config', (req, res) => {
    db.all('SELECT * FROM config', (err, rows) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        res.json(rows);
    });
});

app.post('/config/multiple', (req, res) => {
    const names = req.body.names;
    if (!Array.isArray(names) || names.length === 0) {
        res
            .status(400)
            .json({error: 'Names must be provided as an array'});
        return;
    }

    const placeholders = names.map(() => '?').join(', ');
    const sql = `SELECT * FROM config WHERE name IN (${placeholders})`;

    db.all(sql, names, (err, rows) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener un valor de configuración específico por su nombre
app.get('/config/:name', (req, res) => {
    const name = req.params.name;
    db.get('SELECT * FROM config WHERE name = ?', [name], (err, row) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        if (!row) {
            res
                .status(404)
                .json({error: 'Config not found'});
            return;
        }
        res.json(row);
    });
});

// Endpoint para actualizar un valor de configuración por su nombre
app.put('/config/:name', (req, res) => {
    const name = req.params.name;
    const {value} = req.body;
    if (!value) {
        res
            .status(400)
            .json({error: 'Value is required'});
        return;
    }
    db.run('UPDATE config SET value = ? WHERE name = ?', [
        value, name
    ], (err) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        res.json({message: 'Config updated successfully'});
    });
});

// Endpoint para añadir un registro a la tabla 'config'
app.post('/config', (req, res) => {
    const {name, value} = req.body;
    if (!name || !value) {
        res
            .status(400)
            .json({error: 'Both name and value are required'});
        return;
    }
    db.run('INSERT INTO config (name, value) VALUES (?, ?)', [
        name, value
    ], (err) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        res.json({message: 'Config data added successfully'});
    });
});

module.exports = app;
