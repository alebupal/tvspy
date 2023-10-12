const express = require('express');
const axios = require('axios');
const app = express.Router();
const { getConfigValues } = require('./configTvheadend')
;
// Función para realizar una solicitud a la API externa
const getExternalData = async (endpoint, res) => {
    try {
        const configValues = await getConfigValues();

        if (!configValues.protocol ||
            !configValues.hostname ||
            !configValues.username ||
            !configValues.password ||
            !configValues.port) {
            res
                .status(404)
                .json(
                    {error: 'Algunos valores necesarios no se encontraron en la tabla de configuración'}
                );
            return;
        }
        const fullUrl = `${configValues.protocol}://${configValues.hostname}:${configValues.port}${endpoint}`;
console.log(fullUrl)
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
