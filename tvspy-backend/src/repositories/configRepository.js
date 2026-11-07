const { allSql, getSql, runSql } = require('../database/database');

class ConfigRepository {
    async getAll() {
        return await allSql('SELECT name, value FROM config');
    }

    async getAllAsObject() {
        const rows = await this.getAll();
        const configMap = {};
        rows.forEach(r => {
            configMap[r.name] = r.value;
        });
        return configMap;
    }

    async getByName(name) {
        const row = await getSql('SELECT name, value FROM config WHERE name = ?', [name]);
        return row ? row.value : null;
    }

    async getByNames(names) {
        if (!Array.isArray(names) || names.length === 0) return [];
        const placeholders = names.map(() => '?').join(', ');
        return await allSql(`SELECT name, value FROM config WHERE name IN (${placeholders})`, names);
    }

    async set(name, value) {
        const stringVal = value !== undefined && value !== null ? String(value) : '';
        await runSql(
            `INSERT INTO config (name, value) VALUES (?, ?) 
             ON CONFLICT(name) DO UPDATE SET value = excluded.value`,
            [name, stringVal]
        );
        return { name, value: stringVal };
    }

    async updateMultiple(entries) {
        for (const [key, val] of Object.entries(entries)) {
            await this.set(key, val);
        }
    }
}

module.exports = new ConfigRepository();

