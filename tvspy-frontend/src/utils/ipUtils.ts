/**
 * Utilidades para verificación de IPs autorizadas, detección de red local y servidor
 */

export function isLocalOrServerIp(ip: string | undefined | null): boolean {
  if (!ip) return true;
  const clean = ip.trim().replace(/^::ffff:/, '');
  return (
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean.toLowerCase() === 'localhost' ||
    clean.startsWith('127.') ||
    clean === '0.0.0.0' ||
    clean.toLowerCase() === 'server' ||
    clean.toLowerCase() === 'n/a'
  );
}

export function isPrivateLanIp(ip: string | undefined | null): boolean {
  if (!ip) return false;
  const clean = ip.trim().replace(/^::ffff:/, '');
  if (isLocalOrServerIp(clean)) return true;

  const parts = clean.split('.').map(Number);
  if (parts.length === 4 && !parts.some(isNaN)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // CGNAT
    if (parts[0] === 169 && parts[1] === 254) return true; // Link-local
  }
  return false;
}

export function matchIpPattern(ip: string, pattern: string): boolean {
  if (!ip || !pattern) return false;
  const cleanIp = ip.trim().replace(/^::ffff:/, '');
  const cleanPattern = pattern.trim().replace(/^::ffff:/, '');

  if (cleanIp === cleanPattern) return true;

  // Comodines tipo 192.168.1.* o 10.0.*.*
  if (cleanPattern.includes('*')) {
    const escaped = cleanPattern
      .split('.')
      .map((part) => (part === '*' ? '\\d+' : part))
      .join('\\.');
    try {
      return new RegExp(`^${escaped}$`).test(cleanIp);
    } catch {
      return false;
    }
  }

  // Notación CIDR tipo 192.168.1.0/24
  if (cleanPattern.includes('/')) {
    const [subIp, maskBitsStr] = cleanPattern.split('/');
    const maskBits = parseInt(maskBitsStr, 10);
    if (!isNaN(maskBits) && maskBits >= 0 && maskBits <= 32) {
      const ipToNum = (s: string) =>
        s.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
      try {
        const ipNum = ipToNum(cleanIp);
        const subNum = ipToNum(subIp);
        const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
        return (ipNum & mask) === (subNum & mask);
      } catch {
        return false;
      }
    }
  }

  return false;
}

export function checkIpAuthorized(
  ip: string | undefined | null,
  allowedConfigString: string | undefined | null,
  allowLan: boolean = false
): boolean {
  if (!ip) return true;

  // 1. Las IPs locales del propio servidor (127.0.0.1, localhost, ::1) SIEMPRE están permitidas
  if (isLocalOrServerIp(ip)) {
    return true;
  }

  // 2. Si está configurado permitir LAN automáticamente
  if (allowLan && isPrivateLanIp(ip)) {
    return true;
  }

  if (!allowedConfigString || !allowedConfigString.trim()) {
    return true;
  }

  const patterns = allowedConfigString
    .split(/[,\n;]/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (patterns.length === 0) {
    return true;
  }

  return patterns.some((pattern) => matchIpPattern(ip, pattern));
}

