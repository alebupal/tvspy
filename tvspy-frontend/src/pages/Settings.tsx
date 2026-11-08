import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { configApi, systemApi } from '../api';
import Card from '../components/common/Card';
import Tabs, { TabItem } from '../components/common/Tabs';
import Input from '../components/common/Input';
import ToggleSwitch from '../components/common/ToggleSwitch';
import toast, { Toaster } from 'react-hot-toast';
import { formatBytes } from '../utils/formatters';
import {
  FiTv,
  FiSend,
  FiShield,
  FiCpu,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiHelpCircle,
  FiShare2,
  FiDownload,
  FiTrash2,
  FiDatabase,
  FiLock,
  FiPlus,
  FiX,
  FiBell,
  FiVolume2,
} from 'react-icons/fi';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationChime,
  playAlertChime,
  getNotificationSettings,
  saveNotificationSettings,
} from '../utils/notifications';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('tvheadend');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testingTvh, setTestingTvh] = useState<boolean>(false);
  const [tvhTestResult, setTvhTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [testingTelegram, setTestingTelegram] = useState<boolean>(false);
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);

  // Info BD
  const [dbInfo, setDbInfo] = useState<{ sizeBytes: number; totalRegistries: number } | null>(null);
  const [purgeDays, setPurgeDays] = useState<number>(180);
  const [purging, setPurging] = useState<boolean>(false);

  // Actualizaciones
  const [updateInfo, setUpdateInfo] = useState<import('../types').UpdateCheckResult | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState<boolean>(false);

  // Notificaciones de escritorio y sonido
  const [notificationSettings, setNotificationSettingsState] = useState(getNotificationSettings());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(getNotificationPermission());

  const handleToggleDesktopNotif = async (enabled: boolean) => {
    if (enabled) {
      const perm = await requestNotificationPermission();
      setBrowserPermission(perm);
      if (perm !== 'granted') {
        toast.error('El navegador no tiene permisos concedidos para notificaciones de escritorio');
        setNotificationSettingsState((prev) => ({ ...prev, desktopNotifications: false }));
        saveNotificationSettings({ desktopNotifications: false });
        return;
      }
    }
    setNotificationSettingsState((prev) => ({ ...prev, desktopNotifications: enabled }));
    saveNotificationSettings({ desktopNotifications: enabled });
  };

  const handleToggleSound = (enabled: boolean) => {
    if (enabled) playNotificationChime();
    setNotificationSettingsState((prev) => ({ ...prev, soundAlerts: enabled }));
    saveNotificationSettings({ soundAlerts: enabled });
  };

  const handleToggleUnauthAlert = (enabled: boolean) => {
    if (enabled) playAlertChime();
    setNotificationSettingsState((prev) => ({ ...prev, unauthorizedIpAlerts: enabled }));
    saveNotificationSettings({ unauthorizedIpAlerts: enabled });
  };

  // Estado del formulario
  const [config, setConfig] = useState<Record<string, string>>({
    protocol: 'http',
    hostname: '',
    port: '9981',
    username: '',
    password: '',
    auth: 'digest',
    ip_allowed: '',
    minimum_time: '10',
    telegram_bot_token: '',
    telegram_id: '',
    telegram_notification: '0',
    telegram_notification_start_playback: '0',
    telegram_notification_start_playback_text: 'El usuario %%username%% ha empezado a reproducir %%channel%% a las %%date%% con el reproductor %%client%% y desde la IP: %%hostname%%',
    telegram_notification_stop_playback: '0',
    telegram_notification_stop_playback_text: 'El usuario %%username%% ha parado de reproducir el %%channel%% a las %%date%%',
    telegram_notification_start_recording: '0',
    telegram_notification_start_recording_text: 'DVR ha empezado a grabar el canal %%channel%% a las %%date%%',
    telegram_notification_stop_recording: '0',
    telegram_notification_stop_recording_text: 'DVR ha parado de grabar el canal %%channel%% a las %%date%%',
    telegram_notification_time: '0',
    telegram_notification_time_text: 'El usuario %%username%% lleva más tiempo del configurado viendo %%channel%%',
    telegram_time_limit: '120',
    telegram_notification_ip_not_allowed: '0',
    telegram_notification_ip_not_allowed_text: 'Alerta: Reproducción desde IP no autorizada %%hostname%% por el usuario %%username%% en %%channel%%',
    notify_server_down: '1',
    pin_enabled: '0',
    pin_code: '',
    auto_purge_enabled: '0',
    auto_purge_days: '90',
    webhook_enabled: '0',
    webhook_url: '',
    webhook_type: 'discord',
    language: 'es',
    debug_mode: '0',
    allow_lan_ips: '1',
  });

  const [newIpInput, setNewIpInput] = useState<string>('');

  const allowedIpsList = (config.ip_allowed || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);

  const handleAddIp = () => {
    if (!newIpInput.trim()) return;
    const incoming = newIpInput
      .split(/[,\n;]/)
      .map((ip) => ip.trim())
      .filter(Boolean);

    const merged = Array.from(new Set([...allowedIpsList, ...incoming]));
    handleChange('ip_allowed', merged.join(', '));
    setNewIpInput('');
  };

  const handleRemoveIp = (ipToRemove: string) => {
    const updated = allowedIpsList.filter((ip) => ip !== ipToRemove);
    handleChange('ip_allowed', updated.join(', '));
  };

  const handleAddPreset = (preset: string) => {
    if (!allowedIpsList.includes(preset)) {
      const merged = [...allowedIpsList, preset];
      handleChange('ip_allowed', merged.join(', '));
    }
  };

  const loadDbInfo = async () => {
    try {
      const res = await systemApi.getDbInfo();
      setDbInfo(res);
    } catch {}
  };

  const handleCheckUpdate = async (force = true) => {
    setCheckingUpdate(true);
    try {
      const res = await systemApi.checkUpdate(force);
      setUpdateInfo(res);
      if (res.hasUpdate) {
        toast.success(`${t('New version available')}: v${res.latestVersion}`);
      } else {
        toast.success(t('You are using the latest version'));
      }
    } catch (err: any) {
      toast.error(err.message || t('Error checking for updates'));
    } finally {
      setCheckingUpdate(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const map = await configApi.getAsMap();
        setConfig((prev) => ({ ...prev, ...map }));
        if (map.pin_enabled === '1') {
          localStorage.setItem('tvspy_pin_enabled', '1');
          if (map.pin_code) {
            localStorage.setItem('tvspy_pin_length', String(map.pin_code.length));
          }
        } else if (map.pin_enabled === '0') {
          localStorage.removeItem('tvspy_pin_enabled');
          localStorage.removeItem('tvspy_pin_length');
        }
        loadDbInfo();
        systemApi.checkUpdate(false).then((u) => setUpdateInfo(u)).catch(() => {});
      } catch (err) {
        toast.error(t('Error loading configuration'));
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, [t]);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string, enabled: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: enabled ? '1' : '0' }));
  };

  const isEnabled = (key: string): boolean => {
    const val = config[key];
    return val === '1' || val === 'true';
  };

  // Guardar configuración
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await configApi.updateBulk(config);
      if (config.pin_enabled === '1') {
        localStorage.setItem('tvspy_pin_enabled', '1');
        if (config.pin_code) {
          localStorage.setItem('tvspy_pin_length', String(config.pin_code.length));
        }
      } else if (config.pin_enabled === '0') {
        localStorage.removeItem('tvspy_pin_enabled');
        localStorage.removeItem('tvspy_pin_length');
      }
      toast.success(t('Successfully updated'));
      if (config.language && config.language !== i18n.language) {
        i18n.changeLanguage(config.language);
      }
    } catch (err: any) {
      toast.error(err?.message || t('Error updating'));
    } finally {
      setSaving(false);
    }
  };

  // Probar TVHeadend
  const handleTestTvheadend = async () => {
    setTestingTvh(true);
    setTvhTestResult(null);
    try {
      const res = await configApi.testTvheadend({
        protocol: config.protocol,
        hostname: config.hostname,
        port: config.port,
        username: config.username,
        password: config.password,
        auth: config.auth,
      });
      if (res.success) {
        setTvhTestResult({ success: true, msg: t('TVHeadend connection successful') });
        toast.success(t('TVHeadend connection successful'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || t('Error connecting to TVHeadend');
      setTvhTestResult({ success: false, msg });
      toast.error(`Error: ${msg}`);
    } finally {
      setTestingTvh(false);
    }
  };

  // Probar Telegram
  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      await configApi.testTelegram({
        botToken: config.telegram_bot_token,
        chatId: config.telegram_id,
      });
      toast.success(t('Test message sent successfully to Telegram'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('Error sending test message to Telegram'));
    } finally {
      setTestingTelegram(false);
    }
  };

  // Probar Webhook / Discord
  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    try {
      await configApi.testWebhook({
        webhookUrl: config.webhook_url,
        webhookType: config.webhook_type || 'discord',
      });
      toast.success(t('Webhook tested successfully!'));
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || t('Error testing webhook'));
    } finally {
      setTestingWebhook(false);
    }
  };

  // Purgar BD
  const handlePurgeDb = async () => {
    if (!window.confirm(t('Purge confirm', { days: purgeDays }))) {
      return;
    }

    setPurging(true);
    try {
      const res = await systemApi.purgeOldRecords(purgeDays);
      toast.success(res.message);
      loadDbInfo();
    } catch (err: any) {
      toast.error(err.message || t('Error purging records'));
    } finally {
      setPurging(false);
    }
  };

  const tabs: TabItem[] = [
    { id: 'tvheadend', label: t('TVHeadend'), icon: <FiTv /> },
    { id: 'notifications', label: t('Notifications'), icon: <FiBell /> },
    { id: 'security', label: t('Security & Filters'), icon: <FiShield /> },
    { id: 'system', label: t('System & Database'), icon: <FiCpu /> },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-body dark:text-bodydark">
        <FiRefreshCw className="inline-block animate-spin text-2xl mb-2 text-primary" />
        <div>{t('Loading...')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Toaster position="top-right" />

      {/* Cabecera y Botón Guardar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-white">
            {t('Settings')}
          </h2>
          <p className="text-xs text-body dark:text-bodydark mt-0.5">
            Ajustes generales, conexión con TVHeadend, notificaciones y copias de seguridad
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-xs font-semibold text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
        >
          {saving ? <FiRefreshCw className="animate-spin text-sm" /> : <FiSave className="text-sm" />}
          {saving ? 'Guardando...' : t('Save')}
        </button>
      </div>

      {/* Navegación por Pestañas */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <Card>
        {/* PESTAÑA 1: TVHEADEND */}
        {activeTab === 'tvheadend' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                Conexión con TVHeadend
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Configura los datos del servidor TVHeadend para monitorear transmisiones y registrar actividad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  {t('Protocol')}
                </label>
                <select
                  value={config.protocol || 'http'}
                  onChange={(e) => handleChange('protocol', e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                </select>
              </div>

              <Input
                label="Hostname / IP"
                placeholder="192.168.1.100 o tvheadend.local"
                value={config.hostname || ''}
                onChange={(e) => handleChange('hostname', e.target.value)}
              />

              <Input
                label="Puerto"
                type="number"
                placeholder="9981"
                value={config.port || ''}
                onChange={(e) => handleChange('port', e.target.value)}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  {t('Auth')}
                </label>
                <select
                  value={config.auth || 'digest'}
                  onChange={(e) => handleChange('auth', e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="digest">Digest (Recomendado)</option>
                  <option value="plain">Plain / Basic</option>
                </select>
                <span className="text-[11px] text-body dark:text-bodydark mt-1 block">
                  {t('In TVHeadend Settings>General>Authentication type')}
                </span>
              </div>

              <Input
                label={t('Username')}
                placeholder="Usuario de TVHeadend"
                value={config.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
              />

              <Input
                label={t('Password')}
                type="password"
                placeholder="Contraseña de TVHeadend"
                value={config.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>

            {/* Test de conexión */}
            <div className="pt-4 border-t border-stroke dark:border-strokedark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-black dark:text-white block">
                  Verificar conectividad
                </span>
                <span className="text-xs text-body dark:text-bodydark">
                  Comprueba si TVSPY puede comunicarse con TVHeadend con las credenciales ingresadas.
                </span>
              </div>

              <button
                type="button"
                onClick={handleTestTvheadend}
                disabled={testingTvh}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition text-xs font-semibold disabled:opacity-50 w-fit"
              >
                {testingTvh && <FiRefreshCw className="animate-spin text-xs" />}
                {testingTvh ? 'Verificando...' : 'Probar Conexión'}
              </button>
            </div>

            {tvhTestResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  tvhTestResult.success
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {tvhTestResult.success ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{tvhTestResult.msg}</span>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: NOTIFICACIONES (CENTRO UNIFICADO) */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                {t('Notifications Center')}
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                {t('Notifications Center description')}
              </p>
            </div>

            {/* SECCIÓN 1: NOTIFICACIONES DE ESCRITORIO Y SONIDO EN VIVO */}
            <div className="rounded-xl border border-stroke dark:border-strokedark p-4.5 bg-gray-50/60 dark:bg-meta-4/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-secondary">
                    <FiBell className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">
                      {t('Desktop Notifications & Sound Alerts')}
                    </h4>
                    <p className="text-[11px] text-body dark:text-bodydark">
                      {t('Desktop notifications description')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (notificationSettings.desktopNotifications) {
                        sendBrowserNotification(t('TVSPY Test Notification'), {
                          body: t('Desktop notifications are active and working!'),
                        });
                        toast.success(t('Test notification sent'));
                      } else {
                        toast(t('Enable desktop notifications first'));
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition"
                  >
                    <FiBell className="text-xs" />
                    {t('Test notification')}
                  </button>

                  <button
                    type="button"
                    onClick={() => playNotificationChime()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition"
                  >
                    <FiVolume2 className="text-xs" />
                    {t('Test sound')}
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
                  <ToggleSwitch
                    label={t('Browser Desktop Notifications')}
                    description={
                      browserPermission === 'denied'
                        ? t('Notifications blocked in browser permissions')
                        : t('Show native OS/browser notification banner when a new stream starts')
                    }
                    enabled={notificationSettings.desktopNotifications}
                    onChange={handleToggleDesktopNotif}
                  />
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
                  <ToggleSwitch
                    label={t('Stream Start Sound Chime')}
                    description={t('Play a subtle chime using Web Audio when a playback or recording begins')}
                    enabled={notificationSettings.soundAlerts}
                    onChange={handleToggleSound}
                  />
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
                  <ToggleSwitch
                    label={t('Alert on Unauthorized IP')}
                    description={t('Play warning sound and send high-priority alert if connection is not in allowed list')}
                    enabled={notificationSettings.unauthorizedIpAlerts}
                    onChange={handleToggleUnauthAlert}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: TELEGRAM */}
            <div className="rounded-xl border border-stroke dark:border-strokedark p-4.5 bg-gray-50/60 dark:bg-meta-4/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                    <FiSend className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">
                      {t('Telegram Notifications')}
                    </h4>
                    <p className="text-[11px] text-body dark:text-bodydark">
                      {t('Telegram notifications description')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram || !config.telegram_bot_token || !config.telegram_id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 disabled:opacity-40 transition w-fit self-start sm:self-center"
                >
                  {testingTelegram && <FiRefreshCw className="animate-spin text-xs" />}
                  <FiSend className="text-xs" />
                  {t('Test')} Telegram
                </button>
              </div>

            {/* Credenciales de Telegram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('Telegram Bot Token')}
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                value={config.telegram_bot_token || ''}
                onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
              />
              <Input
                label={t('Telegram ID')}
                placeholder={t('Chat ID or Channel ID')}
                value={config.telegram_id || ''}
                onChange={(e) => handleChange('telegram_id', e.target.value)}
              />
            </div>

            {/* Conmutador maestro */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
              <ToggleSwitch
                label={t('Enable Telegram Notifications')}
                description={t('Enable automated Telegram notifications description')}
                enabled={isEnabled('telegram_notification')}
                onChange={(v) => handleToggle('telegram_notification', v)}
              />
            </div>

            {/* Eventos y Plantillas de Telegram (SÓLO SI LAS NOTIFICACIONES ESTÁN ACTIVADAS) */}
            {isEnabled('telegram_notification') && (
              <div className="space-y-4 pt-2 border-t border-stroke/70 dark:border-strokedark/70">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs border border-sky-500/20">
                <FiHelpCircle className="text-base flex-shrink-0" />
                <span>
                  {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                </span>
              </div>

              {/* Evento 1: Inicio reproducción */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Playback Start')}
                  enabled={isEnabled('telegram_notification_start_playback')}
                  onChange={(v) => handleToggle('telegram_notification_start_playback', v)}
                />
                {isEnabled('telegram_notification_start_playback') && (
                  <Input
                    label={t('Playback Start Notification Text')}
                    value={config.telegram_notification_start_playback_text || ''}
                    onChange={(e) => handleChange('telegram_notification_start_playback_text', e.target.value)}
                  />
                )}
              </div>

              {/* Evento 2: Fin reproducción */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Playback Stop')}
                  enabled={isEnabled('telegram_notification_stop_playback')}
                  onChange={(v) => handleToggle('telegram_notification_stop_playback', v)}
                />
                {isEnabled('telegram_notification_stop_playback') && (
                  <Input
                    label={t('Playback Stop Notification Text')}
                    value={config.telegram_notification_stop_playback_text || ''}
                    onChange={(e) => handleChange('telegram_notification_stop_playback_text', e.target.value)}
                  />
                )}
              </div>

              {/* Evento 3: Inicio grabación DVR */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Recording Start')}
                  enabled={isEnabled('telegram_notification_start_recording')}
                  onChange={(v) => handleToggle('telegram_notification_start_recording', v)}
                />
                {isEnabled('telegram_notification_start_recording') && (
                  <Input
                    label={t('Recording Start Notification Text')}
                    value={config.telegram_notification_start_recording_text || ''}
                    onChange={(e) => handleChange('telegram_notification_start_recording_text', e.target.value)}
                  />
                )}
              </div>

              {/* Evento 4: Fin grabación DVR */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Recording Stop')}
                  enabled={isEnabled('telegram_notification_stop_recording')}
                  onChange={(v) => handleToggle('telegram_notification_stop_recording', v)}
                />
                {isEnabled('telegram_notification_stop_recording') && (
                  <Input
                    label={t('Recording Stop Notification Text')}
                    value={config.telegram_notification_stop_recording_text || ''}
                    onChange={(e) => handleChange('telegram_notification_stop_recording_text', e.target.value)}
                  />
                )}
              </div>

              {/* Evento 5: Alerta por tiempo prolongado */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Specific Time')}
                  description={t('Notify on time limit description')}
                  enabled={isEnabled('telegram_notification_time')}
                  onChange={(v) => handleToggle('telegram_notification_time', v)}
                />
                {isEnabled('telegram_notification_time') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('Telegram time limit (Minutes)')}
                      type="number"
                      value={config.telegram_time_limit || '120'}
                      onChange={(e) => handleChange('telegram_time_limit', e.target.value)}
                    />
                    <Input
                      label={t('Time Notification Text')}
                      value={config.telegram_notification_time_text || ''}
                      onChange={(e) => handleChange('telegram_notification_time_text', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Evento 6: IP no autorizada */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Unauthorized IP')}
                  description={t('Notify on unauthorized IP description')}
                  enabled={isEnabled('telegram_notification_ip_not_allowed')}
                  onChange={(v) => handleToggle('telegram_notification_ip_not_allowed', v)}
                />
                {isEnabled('telegram_notification_ip_not_allowed') && (
                  <Input
                    label={t('Unauthorized IP Notification Text')}
                    value={config.telegram_notification_ip_not_allowed_text || ''}
                    onChange={(e) => handleChange('telegram_notification_ip_not_allowed_text', e.target.value)}
                  />
                )}
              </div>

              {/* Evento 7: Caída o desconexión del servidor TVHeadend */}
              <div className="border border-stroke rounded-lg p-4 dark:border-strokedark space-y-3">
                <ToggleSwitch
                  label={t('Notify on Server Down')}
                  description={t('Sends alert if connection with TVHeadend is lost for more than 2 minutes and another when recovered')}
                  enabled={isEnabled('notify_server_down')}
                  onChange={(v) => handleToggle('notify_server_down', v)}
                />
              </div>

            </div>
          )}
        </div>

            {/* SECCIÓN 3: DISCORD, GOTIFY Y WEBHOOKS */}
            <div className="rounded-xl border border-stroke dark:border-strokedark p-4.5 bg-gray-50/60 dark:bg-meta-4/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <FiShare2 className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">
                      {t('Discord / Gotify / Webhooks')}
                    </h4>
                    <p className="text-[11px] text-body dark:text-bodydark">
                      {t('Discord / Webhooks description')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook || !config.webhook_url}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 disabled:opacity-40 transition w-fit self-start sm:self-center"
                >
                  {testingWebhook && <FiRefreshCw className="animate-spin text-xs" />}
                  <FiShare2 className="text-xs" />
                  {t('Test Webhook')}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
                <ToggleSwitch
                  label={t('Enable Webhook Notifications')}
                  description={t('Stream real-time events to configured webhook')}
                  enabled={isEnabled('webhook_enabled')}
                  onChange={(v) => handleToggle('webhook_enabled', v)}
                />
              </div>

              {isEnabled('webhook_enabled') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="sm:col-span-1">
                    <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                      {t('Webhook Type')}
                    </label>
                    <select
                      value={config.webhook_type || 'discord'}
                      onChange={(e) => handleChange('webhook_type', e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-white py-2.5 px-4 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="discord">Discord (Rich Embeds)</option>
                      <option value="gotify">Gotify</option>
                      <option value="generic">{t('Generic (JSON POST)')}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      label={t('Webhook URL')}
                      placeholder="https://discord.com/api/webhooks/... o https://gotify.local/message?token=..."
                      value={config.webhook_url || ''}
                      onChange={(e) => handleChange('webhook_url', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: FILTROS Y SEGURIDAD */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                {t('Network Filters & Rules')}
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                {t('Network filters description')}
              </p>
            </div>

            {/* GESTIÓN DE IPS AUTORIZADAS Y FILTROS */}
            <div className="rounded-xl border border-stroke bg-gray-50/50 p-5 dark:border-strokedark dark:bg-meta-4/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiShield className="text-primary text-base" />
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    {t('Allowed IP Whitelist')}
                  </h4>
                </div>
                <span className="text-[11px] text-body dark:text-bodydark font-mono">
                  {allowedIpsList.length} {t('registered IPs')}
                </span>
              </div>

              <p className="text-xs text-body dark:text-bodydark leading-relaxed">
                {t('Configure allowed IPs description')}
              </p>

              {/* Toggles de IPs locales y LAN */}
              <div className="space-y-3 pt-2 pb-1 border-y border-stroke/60 dark:border-strokedark/60">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-black dark:text-white flex items-center gap-1.5">
                      <FiCheckCircle className="text-emerald-500 text-sm" />
                      {t('Local server IPs (127.0.0.1 / localhost)')}
                    </span>
                    <p className="text-[11px] text-body dark:text-bodydark mt-0.5">
                      {t('Always authorized by default for internal server health checks and local playbacks')}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {t('Always allowed')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-stroke/40 dark:border-strokedark/40">
                  <div>
                    <span className="font-semibold text-black dark:text-white">
                      {t('Allow all private local network IPs (LAN)')}
                    </span>
                    <p className="text-[11px] text-body dark:text-bodydark mt-0.5">
                      {t('Automatically authorize 192.168.x.x, 10.x.x.x, and 172.16-31.x.x without manual entry')}
                    </p>
                  </div>
                  <ToggleSwitch
                    label=""
                    enabled={isEnabled('allow_lan_ips')}
                    onChange={(v) => handleToggle('allow_lan_ips', v)}
                  />
                </div>
              </div>

              {/* Chips de IPs actuales */}
              <div>
                <label className="block text-xs font-semibold text-black dark:text-white mb-2">
                  {t('Whitelisted IPs / Ranges / Subnets')}:
                </label>
                {allowedIpsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allowedIpsList.map((ip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-mono font-medium text-primary dark:text-secondary shadow-sm"
                      >
                        <span>{ip}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIp(ip)}
                          title={`${t('Remove')} ${ip}`}
                          className="hover:text-rose-500 transition ml-0.5"
                        >
                          <FiX className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-body dark:text-bodydark italic mb-3">
                    {t('No specific IPs defined. Any external connection is allowed unless a list is added.')}
                  </p>
                )}
              </div>

              {/* Input para añadir nueva IP + Botón */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('IP filter placeholder')}
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIp();
                    }
                  }}
                  className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-xs text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddIp}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition flex-shrink-0"
                >
                  <FiPlus className="text-sm" />
                  {t('Add')}
                </button>
              </div>

              {/* Botones de sugerencias rápidas */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-body dark:text-bodydark">
                <span className="font-medium mr-1">{t('Quick add')}:</span>
                <button
                  type="button"
                  onClick={() => handleAddPreset('192.168.1.*')}
                  className="rounded px-2 py-0.5 bg-gray-200 text-black dark:bg-meta-4 dark:text-bodydark hover:bg-primary/10 hover:text-primary transition font-mono"
                >
                  + 192.168.1.*
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('10.0.0.*')}
                  className="rounded px-2 py-0.5 bg-gray-200 text-black dark:bg-meta-4 dark:text-bodydark hover:bg-primary/10 hover:text-primary transition font-mono"
                >
                  + 10.0.0.*
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('172.16.0.*')}
                  className="rounded px-2 py-0.5 bg-gray-200 text-black dark:bg-meta-4 dark:text-bodydark hover:bg-primary/10 hover:text-primary transition font-mono"
                >
                  + 172.16.0.*
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label={`${t('Minimum time')} (segundos)`}
                helperText={t('Minimum time considered to record viewing of a channel')}
                type="number"
                placeholder="10"
                value={config.minimum_time || '10'}
                onChange={(e) => handleChange('minimum_time', e.target.value)}
              />
            </div>

            {/* SECCIÓN PROTECCIÓN CON PIN */}
            <div className="pt-6 border-t border-stroke dark:border-strokedark space-y-4">
              <div className="flex items-center gap-2">
                <FiLock className="text-primary text-base" />
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {t('PIN Protection') || 'Protección del Panel con PIN'}
                </h4>
              </div>

              <ToggleSwitch
                label={t('Enable PIN protection') || 'Activar protección con código PIN'}
                description={t('Require PIN to enter and manage TVSPY') || 'Solicita un código PIN numérico antes de permitir ver emisiones o modificar ajustes'}
                enabled={isEnabled('pin_enabled')}
                onChange={(v) => handleToggle('pin_enabled', v)}
              />

              {isEnabled('pin_enabled') && (
                <div className="max-w-xs">
                  <Input
                    label={t('Access PIN Code (4-8 digits)') || 'Código PIN de acceso (4-8 dígitos)'}
                    type="password"
                    placeholder="1234"
                    value={config.pin_code || ''}
                    onChange={(e) => handleChange('pin_code', e.target.value.replace(/\D/g, '').slice(0, 8))}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: SISTEMA & MANTENIMIENTO BD & ACTUALIZACIONES */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                {t('System & Database')}
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                {t('System tab description')}
              </p>
            </div>

            {/* SECCIÓN ACTUALIZACIONES & VERSIÓN */}
            <div className="rounded-xl border border-stroke dark:border-strokedark p-4 bg-gray-50/60 dark:bg-meta-4/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="text-primary text-base" />
                  <h4 className="text-sm font-bold text-black dark:text-white">
                    {t('Updates & Version')}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckUpdate(true)}
                  disabled={checkingUpdate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-semibold text-black hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4 transition shadow-sm disabled:opacity-50"
                >
                  <FiRefreshCw className={`text-xs ${checkingUpdate ? 'animate-spin' : ''}`} />
                  {checkingUpdate ? t('Checking for updates...') : t('Check now')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
                  <span className="text-body dark:text-bodydark block">{t('Current version')}:</span>
                  <p className="font-bold font-mono text-black dark:text-white mt-0.5">
                    v{updateInfo?.currentVersion || '3.2.3'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
                  <span className="text-body dark:text-bodydark block">{t('Latest version')}:</span>
                  <p className="font-bold font-mono text-black dark:text-white mt-0.5">
                    v{updateInfo?.latestVersion || '3.2.3'}
                  </p>
                </div>
              </div>

              {updateInfo?.hasUpdate ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                    <FiAlertCircle className="text-base flex-shrink-0" />
                    <span>{t('New version available')}: <b>v{updateInfo.latestVersion}</b></span>
                  </div>
                  <a
                    href={updateInfo.releaseUrl || 'https://github.com/alebupal/tvspy/releases'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded bg-amber-500 text-white font-semibold hover:bg-amber-600 transition"
                  >
                    {t('View release notes')}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <FiCheckCircle className="text-base flex-shrink-0" />
                  <span>{t('You are using the latest version')}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  {t('Language')}
                </label>
                <select
                  value={config.language || 'es'}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full sm:w-1/2 rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stroke dark:border-strokedark">
                <ToggleSwitch
                  label={t('Enable debug mode')}
                  description={t('Debug mode description')}
                  enabled={isEnabled('debug_mode')}
                  onChange={(v) => handleToggle('debug_mode', v)}
                />
              </div>
            </div>

            {/* SECCIÓN MANTENIMIENTO Y BACKUP BD */}
            <div className="pt-6 border-t border-stroke dark:border-strokedark space-y-4">
              <div className="flex items-center gap-2">
                <FiDatabase className="text-primary text-base" />
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {t('Database Backup and Maintenance')}
                </h4>
              </div>

              {dbInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-stroke dark:border-strokedark dark:bg-meta-4/20 text-xs">
                  <div>
                    <span className="text-body dark:text-bodydark">{t('SQLite file size')}:</span>
                    <p className="font-bold font-mono text-black dark:text-white mt-0.5">
                      {formatBytes(dbInfo.sizeBytes)}
                    </p>
                  </div>
                  <div>
                    <span className="text-body dark:text-bodydark">{t('Accumulated historical records')}:</span>
                    <p className="font-bold font-mono text-black dark:text-white mt-0.5">
                      {dbInfo.totalRegistries} {t('reproductions')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-semibold text-black dark:text-white block">
                    {t('Download Backup')}
                  </span>
                  <span className="text-xs text-body dark:text-bodydark">
                    {t('Download Backup description')}
                  </span>
                </div>

                <a
                  href="/api/system/backup"
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm w-fit"
                >
                  <FiDownload className="text-xs" />
                  {t('Download Backup (.db)')}
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stroke/70 dark:border-strokedark/70">
                <div>
                  <span className="text-xs font-semibold text-black dark:text-white block">
                    {t('Purge old registries and VACUUM')}
                  </span>
                  <span className="text-xs text-body dark:text-bodydark">
                    {t('Purge description')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={purgeDays}
                    onChange={(e) => setPurgeDays(Number(e.target.value))}
                    className="rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  >
                    <option value={30}>{t('Older than 30 days')}</option>
                    <option value={90}>{t('Older than 90 days')}</option>
                    <option value={180}>{t('Older than 180 days')}</option>
                    <option value={365}>{t('Older than 1 year')}</option>
                  </select>

                  <button
                    type="button"
                    onClick={handlePurgeDb}
                    disabled={purging}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition disabled:opacity-50"
                  >
                    {purging ? <FiRefreshCw className="animate-spin text-xs" /> : <FiTrash2 className="text-xs" />}
                    {t('Purge DB')}
                  </button>
                </div>
              </div>

              {/* AUTO-PURGA PROGRAMADA */}
              <div className="pt-4 border-t border-stroke/70 dark:border-strokedark/70 space-y-3">
                <ToggleSwitch
                  label={t('Enable automatic scheduled purge') || 'Auto-limpieza periódica automática de registros antiguos'}
                  description={t('Purges old records automatically in background and runs VACUUM') || 'Elimina registros antiguos periódicamente en segundo plano y ejecuta VACUUM sin intervención manual'}
                  enabled={isEnabled('auto_purge_enabled')}
                  onChange={(v) => handleToggle('auto_purge_enabled', v)}
                />

                {isEnabled('auto_purge_enabled') && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs text-body dark:text-bodydark font-medium">
                      {t('Keep records from last') || 'Conservar registros de los últimos'}:
                    </span>
                    <select
                      value={config.auto_purge_days || '90'}
                      onChange={(e) => handleChange('auto_purge_days', e.target.value)}
                      className="rounded-lg border border-stroke bg-white px-3 py-1.5 text-xs font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                    >
                      <option value="30">30 {t('days')}</option>
                      <option value="60">60 {t('days')}</option>
                      <option value="90">90 {t('days')}</option>
                      <option value="180">180 {t('days')}</option>
                      <option value="365">365 {t('days')}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Settings;
