const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express.Router();
const { getConfigValues } = require('./configTvheadend');

// Función para generar el hash MD5
const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

// Función para realizar una solicitud a la API externa con autenticación Digest
const getExternalData = async (endpoint, res) => {
    try {
        const configValues = await getConfigValues();

        if (!configValues.protocol ||
            !configValues.hostname ||
            !configValues.username ||
            !configValues.password ||
            !configValues.port) {
            res.status(404).json({
                error: 'Algunos valores necesarios no se encontraron en la tabla de configuración'
            });
            return;
        }

        const fullUrl = `${configValues.protocol}://${configValues.hostname}:${configValues.port}${endpoint}`;

        // Realizar la primera solicitud para obtener nonce y realm
        let initialResponse;
        try {
            initialResponse = await axios.get(fullUrl);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // El servidor respondió con 401, obtenemos los valores necesarios
                const authHeader = error.response.headers['www-authenticate'];
                
                // Extraer realm y nonce del encabezado
                const realmMatch = authHeader.match(/realm="([^"]+)"/);
                const nonceMatch = authHeader.match(/nonce="([^"]+)"/);

                if (!realmMatch || !nonceMatch) {
                    throw new Error('No se pudo extraer realm o nonce del encabezado de autenticación.');
                }

                const realm = realmMatch[1];
                const nonce = nonceMatch[1];

                // Generar cnonce
                const cnonce = crypto.randomBytes(16).toString('hex');
                const nc = '00000001'; // Número de conteo (por defecto 1)
                const qop = 'auth';
                const method = 'GET';
                const uri = endpoint;

                // Generar A1, A2 y response
                const A1 = md5(`${configValues.username}:${realm}:${configValues.password}`);
                const A2 = md5(`${method}:${uri}`);
                const responseHash = md5(`${A1}:${nonce}:${nc}:${cnonce}:${qop}:${A2}`);

                // Construir el encabezado de autorización
                const authDigestHeader = `Digest username="${configValues.username}", realm="undefined", uri="${uri}", algorithm="MD5", qop=${qop}, cnonce="undefined", response="${responseHash}""`;

                // Realizar la solicitud con el encabezado de autenticación Digest
                const finalResponse = await axios.get(fullUrl, {
                    headers: {
                        'Authorization': authDigestHeader
                    }
                });

                res.json(finalResponse.data);
                return;
            } else {
                throw new Error('Error inesperado durante la autenticación.');
            }
        }

        // Si la primera solicitud fue exitosa (lo cual es raro si el servidor requiere autenticación Digest)
        res.json(initialResponse.data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar la API externa' });
    }
};

// Rutas
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
