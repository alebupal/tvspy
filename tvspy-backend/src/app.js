const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {  db } = require('./database/database');

const configRoutes = require('./routes/configRoutes');
const registriesRoutes = require('./routes/registriesRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const tvheadendRoutes = require('./routes/tvheadendRoutes');
const subcriptions = require('./routes/subcriptions');

const app = express();
const port = 3001;

// Configura CORS para permitir solicitudes desde el origen de tu frontend
app.use(cors()); //Permitir todas

app.use(bodyParser.json());

// Utiliza las rutas relacionadas con 'config'
app.use('/api', configRoutes);
app.use('/api', registriesRoutes);
app.use('/api', tvheadendRoutes);
app.use('/api', statisticsRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
