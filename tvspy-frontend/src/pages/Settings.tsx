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
} from 'react-icons/fi';

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
    webhook_enabled: '0',
    webhook_url: '',
    webhook_type: 'discord',
    language: 'es',
    debug_mode: '0',
  });

  const loadDbInfo = async () => {
    try {
      const res = await systemApi.getDbInfo();
      setDbInfo(res);
    } catch {}
  };

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const map = await configApi.getAsMap();
        setConfig((prev) => ({ ...prev, ...map }));
        loadDbInfo();
      } catch (err) {
        toast.error('Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

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
      toast.success(t('Successfully updated') || 'Configuración guardada correctamente');
      if (config.language && config.language !== i18n.language) {
        i18n.changeLanguage(config.language);
      }
    } catch (err: any) {
      toast.error(err?.message || t('Error updating') || 'Error al guardar');
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
        setTvhTestResult({ success: true, msg: '¡Conexión establecida con éxito con TVHeadend!' });
        toast.success('Conexión con TVHeadend exitosa');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error al conectar con TVHeadend';
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
      toast.success(t('Test message sent successfully to Telegram') || 'Mensaje de prueba enviado');
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
      toast.success('¡Webhook probado con éxito!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Error al probar webhook');
    } finally {
      setTestingWebhook(false);
    }
  };

  // Purgar BD
  const handlePurgeDb = async () => {
    if (!window.confirm(`¿Seguro que deseas eliminar los registros de más de ${purgeDays} días y compactar la base de datos?`)) {
      return;
    }

    setPurging(true);
    try {
      const res = await systemApi.purgeOldRecords(purgeDays);
      toast.success(res.message);
      loadDbInfo();
    } catch (err: any) {
      toast.error(err.message || 'Error al purgar registros');
    } finally {
      setPurging(false);
    }
  };

  const tabs: TabItem[] = [
    { id: 'tvheadend', label: 'TVHeadend', icon: <FiTv /> },
    { id: 'telegram', label: 'Telegram', icon: <FiSend /> },
    { id: 'webhooks', label: 'Discord / Webhooks', icon: <FiShare2 /> },
    { id: 'security', label: 'Filtros & Seguridad', icon: <FiShield /> },
    { id: 'system', label: 'Sistema & Base de Datos', icon: <FiCpu /> },
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

        {/* PESTAÑA 2: TELEGRAM */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                  Notificaciones de Telegram
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Recibe alertas instantáneas en tu canal o chat privado de Telegram.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram || !config.telegram_bot_token || !config.telegram_id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white disabled:opacity-40 transition w-fit"
              >
                {testingTelegram && <FiRefreshCw className="animate-spin text-xs" />}
                <FiSend className="text-xs" />
                {t('Test')}
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
                placeholder="Chat ID o ID del Canal"
                value={config.telegram_id || ''}
                onChange={(e) => handleChange('telegram_id', e.target.value)}
              />
            </div>

            {/* Conmutador maestro */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
              <ToggleSwitch
                label={t('Enable Telegram Notifications')}
                description="Habilitar el motor de envío de notificaciones automáticas a Telegram"
                enabled={isEnabled('telegram_notification')}
                onChange={(v) => handleToggle('telegram_notification', v)}
              />
            </div>

            {/* Lista de Eventos y Plantillas */}
            <div className="space-y-4 pt-2">
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
                  description="Enviar aviso si un usuario excede un límite de minutos reproduciendo"
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
                  description="Enviar alerta cuando la conexión provenga de una IP fuera de la lista de permitidas"
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
            </div>
          </div>
        )}

        {/* PESTAÑA 3: DISCORD & WEBHOOKS */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                  Integración Discord / Gotify / Webhook
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Envía alertas automáticas de inicio y fin de streaming a canales de Discord, servidores Gotify o Home Assistant.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testingWebhook || !config.webhook_url}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stroke bg-white text-xs font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white disabled:opacity-40 transition w-fit"
              >
                {testingWebhook && <FiRefreshCw className="animate-spin text-xs" />}
                <FiShare2 className="text-xs" />
                Probar Webhook
              </button>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-meta-4/20 border border-stroke dark:border-strokedark">
              <ToggleSwitch
                label="Habilitar notificaciones por Webhook"
                description="Transmitir eventos de transmisiones en tiempo real al webhook configurado"
                enabled={isEnabled('webhook_enabled')}
                onChange={(v) => handleToggle('webhook_enabled', v)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
                  Tipo de Webhook
                </label>
                <select
                  value={config.webhook_type || 'discord'}
                  onChange={(e) => handleChange('webhook_type', e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-2.5 px-4 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="discord">Discord (Rich Embeds)</option>
                  <option value="gotify">Gotify</option>
                  <option value="generic">Genérico (JSON POST)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="URL del Webhook"
                  placeholder="https://discord.com/api/webhooks/... o https://gotify.local/message?token=..."
                  value={config.webhook_url || ''}
                  onChange={(e) => handleChange('webhook_url', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: FILTROS Y SEGURIDAD */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                Filtros de Red y Reglas
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Control de acceso por IP y parámetros mínimos de registro.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label={t('IP Allowed')}
                helperText={t('IP´s separated by commas') || 'Separar múltiples IPs mediante comas (ej. 192.168.1.10, 192.168.1.11)'}
                placeholder="192.168.1.10, 192.168.1.50"
                value={config.ip_allowed || ''}
                onChange={(e) => handleChange('ip_allowed', e.target.value)}
              />

              <Input
                label={`${t('Minimum time')} (segundos)`}
                helperText={t('Minimum time considered to record viewing of a channel')}
                type="number"
                placeholder="10"
                value={config.minimum_time || '10'}
                onChange={(e) => handleChange('minimum_time', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PESTAÑA 5: SISTEMA & MANTENIMIENTO BD */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-1">
                Ajustes de Sistema & Diagnóstico
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Idioma de la interfaz, modo debug y mantenimiento de base de datos.
              </p>
            </div>

            <div className="space-y-4">
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
                  description="Imprime trazas y registros detallados en la consola del servidor"
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
                  Copia de Seguridad y Mantenimiento de Base de Datos
                </h4>
              </div>

              {dbInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50/70 border border-stroke dark:border-strokedark dark:bg-meta-4/20 text-xs">
                  <div>
                    <span className="text-body dark:text-bodydark">Tamaño del archivo SQLite:</span>
                    <p className="font-bold font-mono text-black dark:text-white mt-0.5">
                      {formatBytes(dbInfo.sizeBytes)}
                    </p>
                  </div>
                  <div>
                    <span className="text-body dark:text-bodydark">Registros históricos acumulados:</span>
                    <p className="font-bold font-mono text-black dark:text-white mt-0.5">
                      {dbInfo.totalRegistries} registros
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs font-semibold text-black dark:text-white block">
                    Descargar Copia de Seguridad
                  </span>
                  <span className="text-xs text-body dark:text-bodydark">
                    Obtén una copia exacta de tu archivo database.db
                  </span>
                </div>

                <a
                  href="/api/system/backup"
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm w-fit"
                >
                  <FiDownload className="text-xs" />
                  Descargar Backup (.db)
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stroke/70 dark:border-strokedark/70">
                <div>
                  <span className="text-xs font-semibold text-black dark:text-white block">
                    Purgar registros antiguos y Compactar (VACUUM)
                  </span>
                  <span className="text-xs text-body dark:text-bodydark">
                    Elimina historial antiguo para liberar espacio y optimizar el rendimiento.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={purgeDays}
                    onChange={(e) => setPurgeDays(Number(e.target.value))}
                    className="rounded-lg border border-stroke bg-white px-3 py-2 text-xs font-medium text-black outline-none transition focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  >
                    <option value={30}>Mayores a 30 días</option>
                    <option value={90}>Mayores a 90 días</option>
                    <option value={180}>Mayores a 180 días</option>
                    <option value={365}>Mayores a 1 año</option>
                  </select>

                  <button
                    type="button"
                    onClick={handlePurgeDb}
                    disabled={purging}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition disabled:opacity-50"
                  >
                    {purging ? <FiRefreshCw className="animate-spin text-xs" /> : <FiTrash2 className="text-xs" />}
                    Purgar BD
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Settings;
