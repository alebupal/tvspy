const express = require('express');
const db = require('../database/database');
const axios = require('axios');

const app = express.Router();

// Función para obtener la configuración desde la tabla 'config'
const getConfigValues = async () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM config WHERE name IN (?, ?, ?, ?)', [
            'host', 'username', 'password', 'port'
        ], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const configValues = {};
                rows.forEach((row) => {
                    configValues[row.name] = row.value;
                });
                resolve(configValues);
            }
        });
    });
};

// Función para realizar una solicitud a la API externa
const getExternalData = async (endpoint, res) => {
    try {
        const configValues = await getConfigValues();

        if (!configValues.host || !configValues.username || !configValues.password || !configValues.port) {
            res
                .status(404)
                .json(
                    {error: 'Algunos valores necesarios no se encontraron en la tabla de configuración'}
                );
            return;
        }

        const fullUrl = `${configValues.host}:${configValues.port}${endpoint}`;

        const response = await axios.get(fullUrl, {
            auth: {
                username: configValues.username,
                password: configValues.password
            }
        });

        const data = response.data;
        res.json(data);
    } catch (error) {
        console.error(error);
        res
            .status(500)
            .json({error: 'Error al consultar la API externa'});
    }
};

app.get('/channels', async (req, res) => {
    await getExternalData('/api/channel/list', res);
});

app.get('/subscriptions', async (req, res) => {
    await getExternalData('/api/status/subscriptions', res);
});

app.get('/users', async (req, res) => {
    await getExternalData('/api/access/entry/grid', res);
});

module.exports = app;
