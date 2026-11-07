const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const defaultConfigData = require('./defaultConfigData');

// Directorio del archivo de base de datos
const dbDir = path.join(__dirname, 'file');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});

// Envolturas con Promesas para consultas asíncronas limpias
const runSql = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const getSql = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const allSql = (sql, params = []) => {
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

// Inicialización de la base de datos
const initializeDatabase = async () => {
    try {
        // Tabla de configuración
        await runSql(`
            CREATE TABLE IF NOT EXISTS config (
                name TEXT PRIMARY KEY,
                value TEXT
            )
        `);

        // Tabla de registros de reproducciones
        await runSql(`
            CREATE TABLE IF NOT EXISTS registries (
                id INTEGER PRIMARY KEY,
                username TEXT,
                channel TEXT,
                hostname TEXT,
                client TEXT,
                service TEXT,
                title TEXT,
                errors INTEGER DEFAULT 0,
                total_in INTEGER DEFAULT 0,
                start DATETIME,
                end DATETIME,
                notification_time BOOLEAN DEFAULT 0,
                notification_ip BOOLEAN DEFAULT 0
            )
        `);

        // Índices para optimizar rendimiento en consultas y estadísticas
        await runSql(`CREATE INDEX IF NOT EXISTS idx_registries_start ON registries(start)`);
        await runSql(`CREATE INDEX IF NOT EXISTS idx_registries_end ON registries(end)`);
        await runSql(`CREATE INDEX IF NOT EXISTS idx_registries_channel ON registries(channel)`);
        await runSql(`CREATE INDEX IF NOT EXISTS idx_registries_username ON registries(username)`);

        await insertDefaultConfigData();
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

const insertDefaultConfigData = async () => {
    try {
        const stmt = db.prepare('INSERT OR IGNORE INTO config (name, value) VALUES (?, ?)');
        defaultConfigData.forEach((item) => {
            stmt.run(item.name, item.value !== undefined ? String(item.value) : '');
        });
        stmt.finalize();
    } catch (err) {
        console.error('Error inserting default config data:', err.message);
    }
};

// Iniciar inicialización
initializeDatabase();

module.exports = {
    db,
    runSql,
    getSql,
    allSql
};
