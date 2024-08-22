const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const defaultConfigData = require('./defaultConfigData');

// Crear una nueva instancia de la base de datos
const dbPath = path.join(__dirname, '../../database/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Función para ejecutar comandos SQL con Promesas
const runSql = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Función para consultar datos con Promesas
const getSql = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Crear las tablas
const initializeDatabase = async () => {
    try {
        await runSql(`
            CREATE TABLE IF NOT EXISTS config (
                name TEXT PRIMARY KEY,
                value TEXT
            )
        `);
        console.log('Table "config" created or already exists.');

        await runSql(`
            CREATE TABLE IF NOT EXISTS registries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                channel TEXT,
                hostname TEXT,
                client TEXT,
                service TEXT,
                title TEXT,
                errors INTEGER,
                total_in INTEGER,
                start DATETIME,
                end DATETIME,
                notification_time BOOLEAN,
                notification_ip BOOLEAN
            )
        `);
        console.log('Table "registries" created or already exists.');

        // Verificar si la tabla está vacía antes de insertar datos por defecto
        const rows = await getSql('SELECT COUNT(*) AS count FROM config');
        if (rows[0].count === 0) {
            await insertDefaultConfigData();
            console.log('Default config data inserted.');
        } else {
            console.log('Table "config" is not empty. Skipping default data insertion.');
        }
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

const insertDefaultConfigData = () => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT OR IGNORE INTO config (name, value) VALUES (?, ?)');
        defaultConfigData.forEach((data, index) => {
            stmt.run(data.name, data.value, (err) => {
                if (err) {
                    reject(err);
                }
            });
            // Ensure all data is inserted before finalizing
            if (index === defaultConfigData.length - 1) {
                stmt.finalize((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

// Ejecutar la inicialización de la base de datos
initializeDatabase();

module.exports = db;
