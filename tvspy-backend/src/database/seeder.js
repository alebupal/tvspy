const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const defaultConfigData = require('./defaultConfigData');

// Insertar datos por defecto en la tabla 'config'
const insertDefaultConfigData = () => {
    const stmt = db.prepare(
        'INSERT OR IGNORE INTO config (name, value) VALUES (?, ?)'
    );
    defaultConfigData.forEach((data) => {
        stmt.run(data.name, data.value);
    });
    stmt.finalize();
};

// Ejecutar la inserción de datos por defecto
insertDefaultConfigData();