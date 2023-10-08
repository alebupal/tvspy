const express = require('express');
const db = require('../database/database');

const app = express.Router();

// Endpoint para consultar la tabla 'registries'
app.get('/registries', (req, res) => {
    db.all('SELECT * FROM registries', (err, rows) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        res.json(rows);
    });
});

// Endpoint para obtener un registro específico por su ID
app.get('/registries/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM registries WHERE id = ?', [id], (err, row) => {
        if (err) {
            res
                .status(500)
                .json({error: err.message});
            return;
        }
        if (!row) {
            res
                .status(404)
                .json({error: 'Registry not found'});
            return;
        }
        res.json(row);
    });
});

// Endpoint para actualizar un registro específico por su ID
app.put('/registries/:id', (req, res) => {
    const id = req.params.id;
    const {
        username,
        channel,
        hostname,
        client,
        service,
        errors,
        total_in,
        start,
        end
    } = req.body;
    if (!username || !channel || !hostname || !client || !service || !start || !end) {
        res
            .status(400)
            .json({error: 'All required fields must be provided'});
        return;
    }
    db.run(
        'UPDATE registries SET username = ?, channel = ?, hostname = ?, client = ?, ser' +
                'vice = ?, errors = ?, total_in = ?, start = ?, end = ? WHERE id = ?',
        [
            username,
            channel,
            hostname,
            client,
            service,
            errors,
            total_in,
            start,
            end,
            id
        ],
        (err) => {
            if (err) {
                res
                    .status(500)
                    .json({error: err.message});
                return;
            }
            res.json({message: 'Registry updated successfully'});
        }
    );
});

// Endpoint para añadir un registro a la tabla 'registries'
app.post('/registries', (req, res) => {
    const {
        username,
        channel,
        hostname,
        client,
        service,
        errors,
        total_in,
        start,
        end
    } = req.body;
    if (!username || !channel || !hostname || !client || !service || !start || !end) {
        res
            .status(400)
            .json({error: 'All required fields must be provided'});
        return;
    }
    db.run(
        'INSERT INTO registries (username, channel, hostname, client, service, errors, ' +
                'total_in, start, end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            username,
            channel,
            hostname,
            client,
            service,
            errors,
            total_in,
            start,
            end
        ],
        (err) => {
            if (err) {
                res
                    .status(500)
                    .json({error: err.message});
                return;
            }
            res.json({message: 'Registry data added successfully'});
        }
    );
});

module.exports = app;
