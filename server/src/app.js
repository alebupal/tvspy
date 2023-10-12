// app.js

const express = require('express');
const bodyParser = require('body-parser');
require('./database/seeder');

const configRoutes = require('./routes/configRoutes'); // Importa las rutas de 'config'
const registriesRoutes = require('./routes/registriesRoutes'); // Importa las rutas de 'registries'
const tvheadendRoutes = require('./routes/tvheadendRoutes'); // Importa las rutas de 'tvheeadend'
const subscriptions = require('./routes/subcriptions'); // Importa las rutas de 'tvheeadend'


const app = express();
const port = 3001;

app.use(bodyParser.json());

// Utiliza las rutas relacionadas con 'config'
app.use('/api', configRoutes);
app.use('/api', registriesRoutes);

app.use('/api', tvheadendRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
