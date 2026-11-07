const fs = require('fs');
const path = require('path');

class VersionService {
    constructor() {
        this.cache = null;
        this.cacheTime = 0;
        this.cacheTtlMs = 30 * 60 * 1000; // 30 minutos de caché
    }

    getLocalVersion() {
        try {
            const pkgPath = path.resolve(__dirname, '../../package.json');
            if (fs.existsSync(pkgPath)) {
                const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (data && data.version) return data.version.trim();
            }
        } catch (e) {
            console.warn('[VersionService] Error leyendo versión local:', e.message);
        }
        return '3.2.1';
    }

    compareVersions(current, latest) {
        const clean = (v) => (v || '').replace(/^v/i, '').trim();
        const cParts = clean(current).split('.').map((n) => parseInt(n, 10) || 0);
        const lParts = clean(latest).split('.').map((n) => parseInt(n, 10) || 0);

        for (let i = 0; i < Math.max(cParts.length, lParts.length); i++) {
            const c = cParts[i] || 0;
            const l = lParts[i] || 0;
            if (l > c) {
                if (i === 0) return 'major';
                if (i === 1) return 'minor';
                return 'patch';
            }
            if (c > l) {
                return null;
            }
        }
        return null;
    }

    async checkUpdate(force = false) {
        const now = Date.now();
        if (!force && this.cache && (now - this.cacheTime < this.cacheTtlMs)) {
            return { ...this.cache, cached: true };
        }

        const currentVersion = this.getLocalVersion();
        let latestVersion = currentVersion;
        let releaseUrl = 'https://github.com/alebupal/tvspy/releases';
        let releaseName = '';
        let releaseNotes = '';
        let publishedAt = null;

        try {
            // Intento 1: API de GitHub Releases
            const res = await fetch('https://api.github.com/repos/alebupal/tvspy/releases/latest', {
                headers: {
                    'User-Agent': 'TVSPY-Server/3.0',
                    'Accept': 'application/vnd.github.v3+json'
                },
                signal: AbortSignal.timeout(6000)
            });

            if (res.ok) {
                const data = await res.json();
                if (data && data.tag_name) {
                    latestVersion = data.tag_name.replace(/^v/i, '').trim();
                    releaseUrl = data.html_url || releaseUrl;
                    releaseName = data.name || data.tag_name;
                    releaseNotes = data.body || '';
                    publishedAt = data.published_at || null;
                }
            } else {
                // Fallback: raw package.json del repositorio oficial
                const rawRes = await fetch('https://raw.githubusercontent.com/alebupal/tvspy/main/package.json', {
                    signal: AbortSignal.timeout(5000)
                });
                if (rawRes.ok) {
                    const rawData = await rawRes.json();
                    if (rawData?.version) {
                        latestVersion = rawData.version.replace(/^v/i, '').trim();
                    }
                }
            }
        } catch (err) {
            console.warn('[VersionService] Error al consultar actualizaciones en GitHub:', err.message);
        }

        const updateType = this.compareVersions(currentVersion, latestVersion);
        const hasUpdate = Boolean(updateType);

        const result = {
            currentVersion,
            latestVersion,
            hasUpdate,
            updateType,
            releaseUrl,
            releaseName,
            releaseNotes,
            publishedAt,
            checkedAt: new Date().toISOString(),
            cached: false
        };

        this.cache = result;
        this.cacheTime = now;
        return result;
    }
}

module.exports = new VersionService();

