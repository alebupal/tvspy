// utilidades.js
const db = require('../database/database');

async function getConfigValues() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM config WHERE name IN (?, ?, ?, ?, ?)', [
      'protocol', 'hostname', 'username', 'password', 'port'
    ], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const configValues = {};
        rows.forEach((row) => {
          configValues[row.name] = row.value;
        });
        resolve(configValues);
      }
    });
  });
}

module.exports = {
  getConfigValues,
};
