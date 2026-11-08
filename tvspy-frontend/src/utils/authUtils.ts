/**
 * Utilidades para la autenticación y persistencia de sesión por PIN en TVSpy.
 */

const STORAGE_KEY_UNLOCKED = 'tvspy_unlocked';
const STORAGE_KEY_EXPIRY = 'tvspy_unlocked_expiry';
const STORAGE_KEY_TOKEN = 'tvspy_unlocked_token';
const COOKIE_NAME = 'tvspy_unlocked';
const DEFAULT_PERSIST_DAYS = 30; // Recordar dispositivo durante 30 días

/**
 * Comprueba si la aplicación está desbloqueada en la sesión actual o por cookie/localStorage persistente.
 */
export const isAppUnlocked = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Desbloqueado en la sesión de navegación activa (sessionStorage)
  if (sessionStorage.getItem(STORAGE_KEY_UNLOCKED) === '1') {
    return true;
  }

  // 2. Comprobar desbloqueo persistente con fecha de expiración en localStorage
  const expiryStr = localStorage.getItem(STORAGE_KEY_EXPIRY);
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (expiryStr && token) {
    const expiry = Number(expiryStr);
    if (!isNaN(expiry) && expiry > Date.now()) {
      // Re-sincronizar sessionStorage para optimizar llamadas posteriores
      sessionStorage.setItem(STORAGE_KEY_UNLOCKED, '1');
      return true;
    }
    // Si ha expirado, limpiar almacenamiento
    clearAppUnlocked();
  }

  // 3. Fallback mediante cookie persistente
  if (typeof document !== 'undefined' && document.cookie) {
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [name, val] = c.trim().split('=');
      if (name === COOKIE_NAME && val === '1') {
        sessionStorage.setItem(STORAGE_KEY_UNLOCKED, '1');
        return true;
      }
    }
  }

  return false;
};

/**
 * Guarda el estado de desbloqueo persistente (30 días) en sessionStorage, localStorage y cookie.
 */
export const setAppUnlocked = (token?: string, days = DEFAULT_PERSIST_DAYS): void => {
  if (typeof window === 'undefined') return;

  const validToken = token || `tvspy_auth_${Date.now()}`;
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;

  sessionStorage.setItem(STORAGE_KEY_UNLOCKED, '1');
  localStorage.setItem(STORAGE_KEY_TOKEN, validToken);
  localStorage.setItem(STORAGE_KEY_EXPIRY, String(expiry));

  // Cookie persistente (SameSite Lax, compatible con HTTP local y reverse proxies)
  const maxAgeSec = days * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
};

/**
 * Elimina las credenciales de desbloqueo y bloquea de nuevo la aplicación.
 */
export const clearAppUnlocked = (): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(STORAGE_KEY_UNLOCKED);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_EXPIRY);

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};

