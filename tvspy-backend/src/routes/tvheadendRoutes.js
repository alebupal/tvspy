const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express.Router();
const { getConfigValues } = require('./configTvheadend');

// Función para generar el hash MD5
const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');

// Función para realizar una solicitud a la API externa con autenticación
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

        const authType = configValues.auth && configValues.auth.trim() !== '' ? configValues.auth : 'digest';

        const fullUrl = `${configValues.protocol}://${configValues.hostname}:${configValues.port}${endpoint}`;

        if (authType === 'plain') {
            try {
                const fullUrl = `${configValues.protocol}://${configValues.hostname}:${configValues.port}${endpoint}`;
                const response = await axios.get(fullUrl, {
                    auth: {
                        username: configValues.username,
                        password: configValues.password
                    }
                });
                res.json(response.data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error al consultar la API externa con autenticación básica' });
            }
        } else {
            // Autenticación digest por defecto
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
                    const authDigestHeader = `Digest username="${configValues.username}", realm="${realm}", nonce="${nonce}", uri="${uri}", algorithm="MD5", response="${responseHash}", qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;

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
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar la API externa' });
    }
};

// Rutas
app.get('/channel', async (req, res) => {
    const { name } = req.query; // Obtén el parámetro 'name' de la consulta
    const limit = 1000000; // O cualquier otro valor que necesites

    // Construye la URL con el parámetro 'name' si está presente
    let url = `/api/channel/grid?limit=${limit}`;
    if (name) {
        url += `&filter=${encodeURIComponent(JSON.stringify([{
            "type": "string",
            "value": name,
            "field": "name"
        }]))}`;
    }

    // Obtén datos de la URL construida
    await getExternalData(url, res);
});

app.get('/subscriptions', async (req, res) => {
    await getExternalData('/api/status/subscriptions', res);
});

app.get('/users', async (req, res) => {
    await getExternalData('/api/access/entry/grid?limit=1000000', res);
});

module.exports = app;
