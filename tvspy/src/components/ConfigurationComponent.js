import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/apiConfig';

const fields = [
    'languaje',
    'port',
    'username',
    'password',
    'protocol',
    'hostname',
    'refresh',
    'ip_allowed',
    'telegram_bot_token',
    'telegram_id',
    'telegram_notification',
    'telegram_notification_start_playback',
    'telegram_notification_start_playback_text',
    'telegram_notification_stop_playback',
    'telegram_notification_stop_playback_text',
    'telegram_notification_start_recording',
    'telegram_notification_start_recording_text',
    'telegram_notification_stop_recording',
    'telegram_notification_stop_recording_text',
    'telegram_notification_time',
    'telegram_notification_time_text',
    'telegram_time_limit',
    'telegram_notification_ip_not_allowed',
    'telegram_notification_ip_not_allowed_text',
];

const ConfigForm = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});
    const [initialValues, setInitialValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchInitialValues = async () => {
            try {
                const initialFormData = {};
                for (const field of fields) {
                    const response = await axios.get(`${API_ENDPOINTS.CONFIG}/${field}`);
                    initialFormData[field] = response.data.value;
                }
                setFormData(initialFormData);
                setInitialValues(initialFormData); // Guardar los valores iniciales
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialValues();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const updatedFields = [];
        const failedFields = [];
        
        for (const [key, value] of Object.entries(formData)) {
            // Solo enviar si el valor ha cambiado
            if (value !== '' && value !== null && value !== undefined && value !== initialValues[key]) {
                try {
                    await axios.put(`${API_ENDPOINTS.CONFIG}/${key}`, { value });
                    updatedFields.push(key);
                    console.log(`Successfully updated ${key}`);
                } catch (error) {
                    failedFields.push(key);
                    console.error(`Error updating ${key}:`, error);
                }
            }
        }
        
        if (updatedFields.length > 0) {
            setSuccessMessage(`${t('Fields updated')}: ${updatedFields.join(', ')}`);
        }
        
        if (failedFields.length > 0) {
            setErrorMessage(`${t('Fields not updated')}: ${failedFields.join(', ')}`);
        }
    };

    if (loading) return <p>{t('Loading...')}</p>;
    if (error) return <p>{t('Error')}: {error}</p>;

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="languaje">{t('Languaje')}</label>
                    <select id="languaje" name="languaje" value={formData.languaje ?? ''} onChange={handleChange}>
                        <option value="es">ES</option>
                        <option value="en">EN</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="port">{t('Port')}</label>
                    <input type="number" id="port" name="port" value={formData.port ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="username">{t('Username')}</label>
                    <input type="text" id="username" name="username" value={formData.username ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="password">{t('Password')}</label>
                    <input type="password" id="password" name="password" value={formData.password ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="protocol">{t('Protocol')}</label>
                    <select id="protocol" name="protocol" value={formData.protocol ?? ''} onChange={handleChange}>
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="hostname">{t('Hostname')}</label>
                    <input type="text" id="hostname" name="hostname" value={formData.hostname ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="refresh">{t('Refresh Interval')}</label>
                    <input type="number" id="refresh" name="refresh" value={formData.refresh ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="ip_allowed">{t('IP Allowed')}</label>
                    <input type="text" id="ip_allowed" name="ip_allowed" value={formData.ip_allowed ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="telegram_bot_token">{t('Telegram Bot Token')}</label>
                    <input type="text" id="telegram_bot_token" name="telegram_bot_token" value={formData.telegram_bot_token ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="telegram_id">{t('Telegram ID')}</label>
                    <input type="text" id="telegram_id" name="telegram_id" value={formData.telegram_id ?? ''} onChange={handleChange} />
                </div>

                <div>
                    <label htmlFor="telegram_notification">{t('Enable Telegram Notifications')}</label>
                    <input type="checkbox" id="telegram_notification" name="telegram_notification" checked={formData.telegram_notification} onChange={handleChange} />
                </div>

                {formData.telegram_notification && (
                    <>
                        <div>
                            <label htmlFor="telegram_notification_start_playback">{t('Notify on Playback Start')}</label>
                            <input type="checkbox" id="telegram_notification_start_playback" name="telegram_notification_start_playback" checked={formData.telegram_notification_start_playback} onChange={handleChange} />
                        </div>

                        {formData.telegram_notification_start_playback && (
                            <div>
                                <label htmlFor="telegram_notification_start_playback_text">{t('Playback Start Notification Text')}</label>
                                <input type="text" id="telegram_notification_start_playback_text" name="telegram_notification_start_playback_text" value={formData.telegram_notification_start_playback_text ?? ''} onChange={handleChange} />
                            </div>
                        )}

                        <div>
                            <label htmlFor="telegram_notification_stop_playback">{t('Notify on Playback Stop')}</label>
                            <input type="checkbox" id="telegram_notification_stop_playback" name="telegram_notification_stop_playback" checked={formData.telegram_notification_stop_playback} onChange={handleChange} />
                        </div>

                        {formData.telegram_notification_stop_playback && (
                            <div>
                                <label htmlFor="telegram_notification_stop_playback_text">{t('Playback Stop Notification Text')}</label>
                                <input type="text" id="telegram_notification_stop_playback_text" name="telegram_notification_stop_playback_text" value={formData.telegram_notification_stop_playback_text ?? ''} onChange={handleChange} />
                            </div>
                        )}

                        <div>
                            <label htmlFor="telegram_notification_start_recording">{t('Notify on Recording Start')}</label>
                            <input type="checkbox" id="telegram_notification_start_recording" name="telegram_notification_start_recording" checked={formData.telegram_notification_start_recording} onChange={handleChange} />
                        </div>

                        {formData.telegram_notification_start_recording && (
                            <div>
                                <label htmlFor="telegram_notification_start_recording_text">{t('Recording Start Notification Text')}</label>
                                <input type="text" id="telegram_notification_start_recording_text" name="telegram_notification_start_recording_text" value={formData.telegram_notification_start_recording_text ?? ''} onChange={handleChange} />
                            </div>
                        )}

                        <div>
                            <label htmlFor="telegram_notification_stop_recording">{t('Notify on Recording Stop')}</label>
                            <input type="checkbox" id="telegram_notification_stop_recording" name="telegram_notification_stop_recording" checked={formData.telegram_notification_stop_recording} onChange={handleChange} />
                        </div>

                        {formData.telegram_notification_stop_recording && (
                            <div>
                                <label htmlFor="telegram_notification_stop_recording_text">{t('Recording Stop Notification Text')}</label>
                                <input type="text" id="telegram_notification_stop_recording_text" name="telegram_notification_stop_recording_text" value={formData.telegram_notification_stop_recording_text ?? ''} onChange={handleChange} />
                            </div>
                        )}

                        <div>
                            <label htmlFor="telegram_notification_time">{t('Notify on Specific Time')}</label>
                            <input type="checkbox" id="telegram_notification_time" name="telegram_notification_time" checked={formData.telegram_notification_time} onChange={handleChange} />
                        </div>

                        {formData.telegram_notification_time && (
                            <>
                                <div>
                                    <label htmlFor="telegram_notification_time_text">{t('Time Notification Text')}</label>
                                    <input type="text" id="telegram_notification_time_text" name="telegram_notification_time_text" value={formData.telegram_notification_time_text ?? ''} onChange={handleChange} />
                                </div>

                                <div>
                                    <label htmlFor="telegram_time_limit">{t('Time Limit')}</label>
                                    <input type="text" id="telegram_time_limit" name="telegram_time_limit" value={formData.telegram_time_limit ?? ''} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="telegram_notification_ip_not_allowed">{t('Notify on Unauthorized IP')}</label>
                            <input type="checkbox" id="telegram_notification_ip_not_allowed" name="telegram_notification_ip_not_allowed" checked={formData.telegram_notification_ip_not_allowed} onChange={handleChange} />
                        </div>

                        {formData.telegram_notification_ip_not_allowed && (
                            <div>
                                <label htmlFor="telegram_notification_ip_not_allowed_text">{t('Unauthorized IP Notification Text')}</label>
                                <input type="text" id="telegram_notification_ip_not_allowed_text" name="telegram_notification_ip_not_allowed_text" value={formData.telegram_notification_ip_not_allowed_text ?? ''} onChange={handleChange} />
                            </div>
                        )}
                    </>
                )}

                <button type="submit">{t('Save')}</button>
            </form>
            
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default ConfigForm;
