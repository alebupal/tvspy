import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const initialFields = [
    { name: 'port', value: 9981 },
    { name: 'username', value: '' },
    { name: 'password', value: '' },
    { name: 'protocol', value: 'http' },
    { name: 'hostname', value: '' },
    { name: 'refresh', value: 5 },
    { name: 'ip_allowed', value: '' },
    { name: 'telegram_bot_token', value: '' },
    { name: 'telegram_id', value: '' },
    { name: 'telegram_notification', value: false },
    { name: 'telegram_notification_start_playback', value: false },
    { name: 'telegram_notification_start_playback_text', value: '' },
    { name: 'telegram_notification_stop_playback', value: false },
    { name: 'telegram_notification_stop_playback_text', value: '' },
    { name: 'telegram_notification_start_recording', value: false },
    { name: 'telegram_notification_start_recording_text', value: '' },
    { name: 'telegram_notification_stop_recording', value: false },
    { name: 'telegram_notification_stop_recording_text', value: '' },
    { name: 'telegram_notification_time', value: false },
    { name: 'telegram_notification_time_text', value: '' },
    { name: 'telegram_time_limit', value: '' },
    { name: 'telegram_notification_ip_not_allowed', value: false },
    { name: 'telegram_notification_ip_not_allowed_text', value: '' },
];

function ConfigurationComponent() {
    // Inicializar el estado del formulario
    const defaultValues = initialFields.reduce((acc, field) => {
        acc[field.name] = field.value;
        return acc;
    }, {});

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues
    });

    const onSubmit = async (data) => {
        try {
            await axios.post('http://localhost:5000/config', data); // Cambia la URL según tu API
            console.log('Datos enviados:', data);
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {initialFields.map((field) => (
                <div key={field.name}>
                    <label htmlFor={field.name}>
                        {field.name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}:
                    </label>
                    {typeof field.value === 'boolean' ? (
                        <input
                            id={field.name}
                            type="checkbox"
                            {...register(field.name)}
                        />
                    ) : (
                        <input
                            id={field.name}
                            type={typeof field.value === 'number' ? 'number' : 'text'}
                            {...register(field.name, { required: true })}
                        />
                    )}
                    {errors[field.name] && <span>{field.name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} es obligatorio</span>}
                </div>
            ))}
            <button type="submit">Guardar</button>
        </form>
    );
}

export default ConfigurationComponent;
