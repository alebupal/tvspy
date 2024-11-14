const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const defaultConfigData = require('./defaultConfigData');

// Crear una nueva instancia de la base de datos
const dbPath = path.join(__dirname, 'file/database.db');
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

        //await updateRegistriesTable();
        await insertDefaultConfigData();
    } catch (err) {
        console.error('Error initializing database:', err.message);
    }
};

const insertDefaultConfigData = async () => {
    try {
        // Primero, obtenemos todos los registros actuales en la tabla "config"
        const currentConfigs = await getSql('SELECT name FROM config');
        const currentConfigNames = currentConfigs.map(config => config.name);

        // Obtener los nombres de las configuraciones por defecto
        const defaultConfigNames = defaultConfigData.map(data => data.name);

        // Eliminar los registros que no están en defaultConfigData
        const namesToDelete = currentConfigNames.filter(name => !defaultConfigNames.includes(name));
        if (namesToDelete.length > 0) {
            const deleteStmt = db.prepare('DELETE FROM config WHERE name = ?');
            namesToDelete.forEach((name) => {
                deleteStmt.run(name, (err) => {
                    if (err) {
                        console.error(`Error deleting record with name ${name}:`, err.message);
                    }
                });
            });
            deleteStmt.finalize();
            console.log(`Deleted ${namesToDelete.length} records from "config" table.`);
        }

        // Insertar los datos por defecto si no existen
        const stmt = db.prepare('INSERT OR IGNORE INTO config (name, value) VALUES (?, ?)');
        defaultConfigData.forEach((data, index) => {
            stmt.run(data.name, data.value, (err) => {
                if (err) {
                    console.error(`Error inserting record with name ${data.name}:`, err.message);
                }
            });

            // Asegurarse de que todos los datos se insertaron antes de finalizar
            if (index === defaultConfigData.length - 1) {
                stmt.finalize((err) => {
                    if (err) {
                        console.error('Error finalizing insert statement:', err.message);
                    }
                });
            }
        });
    } catch (err) {
        console.error('Error inserting default config data:', err.message);
    }
};


const updateRegistriesTable = async () => {
    try {
        // Verificar si las columnas ya existen
        const existingColumns = await getSql(`PRAGMA table_info(registries)`);
        const columnNames = existingColumns.map(col => col.name);

        const newColumns = [
            { name: 'new_column_1', type: 'TEXT' },
            { name: 'new_column_2', type: 'INTEGER' },
            // Añade más columnas según sea necesario
        ];

        // Agregar las nuevas columnas si no existen
        for (const column of newColumns) {
            if (!columnNames.includes(column.name)) {
                await runSql(`ALTER TABLE registries ADD COLUMN ${column.name} ${column.type}`);
                console.log(`Column "${column.name}" added to "registries" table.`);
            }
        }

    } catch (err) {
        console.error('Error updating "registries" table:', err.message);
    }
};

// Ejecutar la inicialización de la base de datos
initializeDatabase();

module.exports = db;