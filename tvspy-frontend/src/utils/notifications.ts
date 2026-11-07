// Utilidad para notificaciones de escritorio del navegador y avisos sonoros (Web Audio API)

const NOTIF_KEY = 'tvspy_desktop_notifications_enabled';
const SOUND_KEY = 'tvspy_notification_sound_enabled';
const UNAUTH_KEY = 'tvspy_unauthorized_ip_alerts_enabled';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Reproduce un tono acústico sutil y elegante de dos notas (D5 -> A5)
 * usando el sintetizador nativo Web Audio API (sin dependencias ni ficheros externos).
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Nota 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Nota 2: A5 (880 Hz) - armónico más brillante
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.debug('Error al reproducir timbre sonoro:', e);
  }
}

/**
 * Reproduce un tono de aviso / alerta más grave para advertencias (ej. IP no autorizada)
 */
export function playAlertChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.setValueAtTime(261.63, now + 0.15); // C4
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.debug('Error al reproducir alerta acústica:', e);
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notif = new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      silent: true, // silenciar el ding por defecto del OS si usamos nuestro Web Audio chime
      ...options,
    });

    // Auto-cerrar tras 6 segundos
    setTimeout(() => {
      try {
        notif.close();
      } catch {}
    }, 6000);

    return notif;
  } catch (e) {
    console.debug('Error enviando notificación del navegador:', e);
    return null;
  }
}

export function getNotificationSettings() {
  if (typeof window === 'undefined') {
    return {
      desktopNotifications: false,
      soundAlerts: false,
      unauthorizedIpAlerts: false,
    };
  }
  return {
    desktopNotifications: localStorage.getItem(NOTIF_KEY) === '1',
    soundAlerts: localStorage.getItem(SOUND_KEY) === '1',
    unauthorizedIpAlerts: localStorage.getItem(UNAUTH_KEY) === '1',
  };
}

export function saveNotificationSettings(settings: {
  desktopNotifications?: boolean;
  soundAlerts?: boolean;
  unauthorizedIpAlerts?: boolean;
}) {
  if (typeof window === 'undefined') return;
  if (settings.desktopNotifications !== undefined) {
    localStorage.setItem(NOTIF_KEY, settings.desktopNotifications ? '1' : '0');
  }
  if (settings.soundAlerts !== undefined) {
    localStorage.setItem(SOUND_KEY, settings.soundAlerts ? '1' : '0');
  }
  if (settings.unauthorizedIpAlerts !== undefined) {
    localStorage.setItem(UNAUTH_KEY, settings.unauthorizedIpAlerts ? '1' : '0');
  }
}
