const http = require('http');
const express = require('express');
const cors = require('cors');

// Inicializar servicios y base de datos
require('./database/database');
const tvheadendService = require('./services/tvheadendService');
const wsServer = require('./websocket/wsServer');

// Rutas
const configRoutes = require('./routes/configRoutes');
const registriesRoutes = require('./routes/registriesRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const tvheadendRoutes = require('./routes/tvheadendRoutes');
const docsRoutes = require('./routes/docsRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api', configRoutes);
app.use('/api', registriesRoutes);
app.use('/api', statisticsRoutes);
app.use('/api', tvheadendRoutes);
app.use('/api', docsRoutes);
app.use('/api', systemRoutes);

// Endpoint de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        tvheadend: tvheadendService.status,
        timestamp: new Date().toISOString()
    });
});

// Crear servidor HTTP para acoplar WebSockets
const server = http.createServer(app);

// Inicializar servidor WebSocket en /ws
wsServer.init(server);

// Iniciar cliente de TVHeadend
tvheadendService.init();

// Iniciar servidor
server.listen(port, () => {
    console.log(`=================================`);
    console.log(` TVSPY Backend v3.2.2 Activo`);
    console.log(` HTTP API: http://localhost:${port}/api`);
    console.log(` WebSocket: ws://localhost:${port}/ws`);
    console.log(`=================================`);
});

// Manejo de apagado graceful
const handleShutdown = () => {
    console.log('Cerrando servidor TVSPY...');
    wsServer.destroy();
    server.close(() => {
        process.exit(0);
    });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
