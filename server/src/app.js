const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/database');
require('./database/seeder');

const configRoutes = require('./routes/configRoutes');
const registriesRoutes = require('./routes/registriesRoutes');
const tvheadendRoutes = require('./routes/tvheadendRoutes');

const app = express();
const port = 3001;

// Configura CORS para permitir solicitudes desde el origen de tu frontend
app.use(cors({
    origin: 'http://localhost:3000' // Cambia esto al dominio de tu frontend si es necesario
}));

app.use(bodyParser.json());

// Utiliza las rutas relacionadas con 'config'
app.use('/api', configRoutes);
app.use('/api', registriesRoutes);
app.use('/api', tvheadendRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
