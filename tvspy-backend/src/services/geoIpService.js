const axios = require('axios');

class GeoIpService {
    constructor() {
        this.cache = new Map();
    }

    isPrivateIp(ip) {
        if (!ip || ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') return true;
        // IPv4 privada: 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 100.64-127.x.x (CGNAT)
        const parts = ip.split('.').map(Number);
        if (parts.length === 4) {
            if (parts[0] === 10) return true;
            if (parts[0] === 192 && parts[1] === 168) return true;
            if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
            if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
            if (parts[0] === 169 && parts[1] === 254) return true;
        }
        return false;
    }

    getFlagEmoji(countryCode) {
        if (!countryCode || countryCode.length !== 2) return '';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }

    async lookup(ip) {
        if (!ip) return null;
        const cleanIp = ip.trim().replace(/^::ffff:/, '');

        if (this.isPrivateIp(cleanIp)) {
            return {
                ip: cleanIp,
                isLocal: true,
                country: 'Red Local',
                countryCode: 'LAN',
                city: 'LAN',
                flag: '🏠',
                isp: 'Local Network'
            };
        }

        if (this.cache.has(cleanIp)) {
            return this.cache.get(cleanIp);
        }

        try {
            const resp = await axios.get(`http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,city,isp`, {
                timeout: 3000
            });

            if (resp.data && resp.data.status === 'success') {
                const info = {
                    ip: cleanIp,
                    isLocal: false,
                    country: resp.data.country || '',
                    countryCode: resp.data.countryCode || '',
                    city: resp.data.city || '',
                    flag: this.getFlagEmoji(resp.data.countryCode),
                    isp: resp.data.isp || ''
                };
                this.cache.set(cleanIp, info);
                return info;
            }
        } catch (err) {
            // Silencioso ante fallo de red externa
        }

        const fallback = {
            ip: cleanIp,
            isLocal: false,
            country: 'Desconocido',
            countryCode: '',
            city: '',
            flag: '🌐',
            isp: ''
        };
        this.cache.set(cleanIp, fallback);
        return fallback;
    }
}

module.exports = new GeoIpService();

