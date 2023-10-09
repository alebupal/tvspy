const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Crear la tabla 'config'
db.run(
    `
  CREATE TABLE IF NOT EXISTS config (
    name TEXT PRIMARY KEY,
    value TEXT
  )
`
);

// Crear la tabla 'registries'
db.run(
    `
  CREATE TABLE IF NOT EXISTS registries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    channel TEXT,
    hostname TEXT,
    client TEXT,
    service TEXT,
    errors INTEGER,
    total_in INTEGER,
    start DATETIME,
    end DATETIME
  )
`
);

module.exports = db;
