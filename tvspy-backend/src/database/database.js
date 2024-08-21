const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Crear la tabla 'config'
db.run(`
  CREATE TABLE IF NOT EXISTS config (
    name TEXT PRIMARY KEY,
    value TEXT
  )
`, (err) => {
    if (err) {
        console.error('Error creando la tabla config:', err.message);
        return;
    }

    // Crear la tabla 'registries' solo después de crear la tabla 'config'
    db.run(`
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
    `, (err) => {
        if (err) {
            console.error('Error creando la tabla registries:', err.message);
            return;
        }
    });
});

module.exports = db;
