const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/docs/:type', (req, res) => {
    try {
        const { type } = req.params; // 'changelog' | 'readme'
        const lang = req.query.lang === 'en' ? 'en' : 'es';

        let filename;
        if (type === 'readme') {
            filename = lang === 'en' ? 'README.MD' : 'README_ES.MD';
        } else if (type === 'guide' || type === 'documentation') {
            filename = lang === 'en' ? 'DOCUMENTATION.MD' : 'DOCUMENTACION.MD';
        } else {
            filename = lang === 'en' ? 'CHANGELOG.MD' : 'CHANGELOG_ES.MD';
        }

        // Buscar en la raíz del proyecto
        const candidatePaths = [
            path.join(__dirname, '../../..', filename),
            path.join(__dirname, '../..', filename),
            path.join(process.cwd(), filename),
            path.join('/app', filename)
        ];

        let filePath = null;
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                filePath = p;
                break;
            }
        }

        if (!filePath) {
            return res.status(404).json({ error: `Archivo ${filename} no encontrado` });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ filename, content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

