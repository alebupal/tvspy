import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Button from '../components/Forms/Button';
import ToggleSwitch from '../components/Forms/ToggleSwitch';
import Alert from '../components/Alert';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import Loader from '../common/Loader/index';

const fields = [
  'languaje',
  'port',
  'username',
  'password',
  'protocol',
  'hostname',
  'auth',
  'ip_allowed',
  'telegram_bot_token',
  'telegram_id',
  'telegram_notification',
  'telegram_notification_start_playback',
  'telegram_notification_stop_playback',
  'telegram_notification_start_recording',
  'telegram_notification_stop_recording',
  'telegram_notification_start_playback_text',
  'telegram_notification_stop_playback_text',
  'telegram_notification_start_recording_text',
  'telegram_notification_stop_recording_text',
  'telegram_notification_time',
  'telegram_notification_time_text',
  'telegram_time_limit',
  'telegram_notification_ip_not_allowed',
  'telegram_notification_ip_not_allowed_text',
];

interface FormData {
  [key: string]: any;
}

interface Switches {
  [key: string]: boolean;
}

interface Alert {
  id: number;
  type: 'warning' | 'success' | 'error';
  title: string;
  duration: number;
}

const Settings = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({});
  const [initialValues, setInitialValues] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switches, setSwitches] = useState<Switches>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertsRef = useRef<HTMLDivElement | null>(null);

  const toBoolean = (value: string | boolean | undefined): boolean => {
    if (value === '1' || value === true) return true;
    if (value === '0' || value === false) return false;
    return false;
  };

  const toInteger = (value: string | boolean | undefined): string => {
    if (value === true) return "1";
    if (value === false) return "0";
    return "0";
  };

  useEffect(() => {
    const fetchInitialValues = async () => {
      try {
        const initialFormData: FormData = {};
        for (const field of fields) {
          const response = await axios.get(`${API_ENDPOINTS.CONFIG}/${field}`);
          const value: string | boolean | undefined = response.data.value;
          initialFormData[field] = value;
        }
        setFormData(initialFormData);

        setSwitches({
          telegram_notification: toBoolean(initialFormData.telegram_notification),
          telegram_notification_start_playback: toBoolean(initialFormData.telegram_notification_start_playback),
          telegram_notification_stop_playback: toBoolean(initialFormData.telegram_notification_stop_playback),
          telegram_notification_start_recording: toBoolean(initialFormData.telegram_notification_start_recording),
          telegram_notification_stop_recording: toBoolean(initialFormData.telegram_notification_stop_recording),
          telegram_notification_time: toBoolean(initialFormData.telegram_notification_time),
          telegram_notification_ip_not_allowed: toBoolean(initialFormData.telegram_notification_ip_not_allowed),
        });
        
        setInitialValues(initialFormData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialValues();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        const { checked } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: checked,
        }));
        setSwitches(prevState => ({
            ...prevState,
            [name]: checked,
        }));
    } else {
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedFields: string[] = [];
    const failedFields: string[] = [];

    for (const [key, value] of Object.entries(formData)) {
      if (value !== '' && value !== null && value !== undefined && value !== initialValues[key]) {
        const newValue = typeof value === "boolean" ? toInteger(value) : value;
        
        if (newValue !== initialValues[key]) {
          try {
            await axios.put(`${API_ENDPOINTS.CONFIG}/${key}`, { 'value': newValue });
            updatedFields.push(key);
            initialValues[key] = value;
          } catch (error) {
            failedFields.push(key);
          }
        }
      }
    }

    if (updatedFields.length > 0) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now(),
          type: 'success',
          title: `${t('Successfully updated')}: ${updatedFields.join(', ')} `,
          duration: 5000
        }
      ]);
    }

    if (failedFields.length > 0) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        {
          id: Date.now() + 1,
          type: 'error',
          title: `${t('Error updating')}: ${failedFields.join(', ')} `,
          duration: 5000
        }
      ]);
    }
  };

  useEffect(() => {
    if (alerts.length > 0 && alertsRef.current) {
      alertsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [alerts]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500"><p>{t('Error')}: {error}</p></div>;

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName={t('Settings')} />
        <div id='alerts' className='mb-5' ref={alertsRef}>
          {alerts.map(alert => (
            <Alert
              key={alert.id}
              type={alert.type}
              title={alert.title}
              duration={alert.duration}
            />
          ))}
        </div>
        <form  className="grid grid-cols-5 gap-8" onSubmit={handleSubmit}>
          {/* <!-- TVHeadend --> */}
          <div className="col-span-5 xl:col-span-4">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('TVHeadend')}
                </h3>
              </div>
              <div className="p-7">
                {/* <!-- Group 1 --> */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="username"
                    >
                      {t('Username')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username ?? ''} onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="password"
                    >
                      {t('Password')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z" fill=""></path><path d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z" fill=""></path>

                          </g>
                        </svg>
                      </span>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="password"
                        id="password"
                        value={formData.password ?? ''} onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                {/* <!-- Group 1 --> */}
                {/* <!-- Group 2 --> */}
                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="hostname"
                  >
                    {t('Hostname')}
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="hostname"
                    id="hostname"
                    value={formData.hostname ?? ''} onChange={handleChange}
                  />
                </div>
                {/* <!-- Group 2 --> */}
                {/* <!-- Group 3 --> */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="protocol"
                    >
                      {t('Protocol')}
                    </label>
                    <div className="relative z-20 bg-white dark:bg-form-input">
                      <select
                        name='protocol'
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4.5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                        value={formData.protocol ?? ''}
                        onChange={handleChange}
                      >
                        <option value="http" className="text-body dark:text-bodydark">
                          HTTP
                        </option>
                        <option value="https" className="text-body dark:text-bodydark">
                          HTTPS
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="port"
                    >
                      {t('Port')}
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="port"
                      id="port"
                      value={formData.port ?? ''} onChange={handleChange}
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="auth"
                    >
                      {t('Authentication')}
                    </label>
                    <div className="relative z-20 bg-white dark:bg-form-input">
                      <select
                        name='auth'
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4.5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                        value={formData.auth ?? ''}
                        onChange={handleChange}
                      >
                        <option value="plain" className="text-body dark:text-bodydark">
                          Plain
                        </option>
                        <option value="digest" className="text-body dark:text-bodydark">
                          Digest
                        </option>
                      </select>
                    </div>
                  </div>
                </div>                
                {/* <!-- Group 3 --> */}
                {/* <!-- Button --> */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <Button />    
                </div>  
                {/* <!--Button --> */}
              </div>
            </div>
          </div>
          {/* <!-- TVHeadend --> */}

          {/* <!-- General --> */}
          <div className="col-span-5 xl:col-span-8">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('General')}
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="languaje"
                  >
                    {t('Languaje')}
                  </label>
                  <div className="relative z-20 bg-white dark:bg-form-input">
                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.0007 2.50065C5.85852 2.50065 2.50065 5.85852 2.50065 10.0007C2.50065 14.1428 5.85852 17.5007 10.0007 17.5007C14.1428 17.5007 17.5007 14.1428 17.5007 10.0007C17.5007 5.85852 14.1428 2.50065 10.0007 2.50065ZM0.833984 10.0007C0.833984 4.93804 4.93804 0.833984 10.0007 0.833984C15.0633 0.833984 19.1673 4.93804 19.1673 10.0007C19.1673 15.0633 15.0633 19.1673 10.0007 19.1673C4.93804 19.1673 0.833984 15.0633 0.833984 10.0007Z"
                            fill="#637381"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.833984 9.99935C0.833984 9.53911 1.20708 9.16602 1.66732 9.16602H18.334C18.7942 9.16602 19.1673 9.53911 19.1673 9.99935C19.1673 10.4596 18.7942 10.8327 18.334 10.8327H1.66732C1.20708 10.8327 0.833984 10.4596 0.833984 9.99935Z"
                            fill="#637381"
                          ></path>
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.50084 10.0008C7.55796 12.5632 8.4392 15.0301 10.0006 17.0418C11.5621 15.0301 12.4433 12.5632 12.5005 10.0008C12.4433 7.43845 11.5621 4.97153 10.0007 2.95982C8.4392 4.97153 7.55796 7.43845 7.50084 10.0008ZM10.0007 1.66749L9.38536 1.10547C7.16473 3.53658 5.90275 6.69153 5.83417 9.98346C5.83392 9.99503 5.83392 10.0066 5.83417 10.0182C5.90275 13.3101 7.16473 16.4651 9.38536 18.8962C9.54325 19.069 9.76655 19.1675 10.0007 19.1675C10.2348 19.1675 10.4581 19.069 10.6159 18.8962C12.8366 16.4651 14.0986 13.3101 14.1671 10.0182C14.1674 10.0066 14.1674 9.99503 14.1671 9.98346C14.0986 6.69153 12.8366 3.53658 10.6159 1.10547L10.0007 1.66749Z"
                            fill="#637381"
                          ></path>
                        </g>
                      </svg>
                    </span>
                    <select
                      name='languaje'
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                      value={formData.languaje ?? ''}
                      onChange={handleChange}
                    >
                      <option value="en" className="text-body dark:text-bodydark">
                        English
                      </option>
                      <option value="es" className="text-body dark:text-bodydark">
                        Español
                      </option>
                    </select>
                  </div>
                </div>
                <div className="mb-5.5">
                  <label className="mb-3 block text-black dark:text-white">
                    {t('IP Allowed')}
                  </label>
                  <textarea
                    value={formData.ip_allowed ?? ''}
                    onChange={handleChange}
                    name='ip_allowed'
                    rows={4}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                  <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                    {t('IP´s separated by commas')}
                  </span>
                </div>
                {/* <!-- Button --> */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <Button />    
                </div>            
                {/* <!--Button --> */}
              </div>
            </div>
          </div>
          {/* <!-- General --> */}

          {/* <!-- Telegram --> */}
          <div className="col-span-5 xl:col-span-12">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  {t('Telegram')}
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <ToggleSwitch
                    name="telegram_notification"
                    id="telegram_notification"
                    switches={switches.telegram_notification}
                    checked={toBoolean(formData.telegram_notification)}
                    onChange={handleChange}
                    labelKey="Enable Telegram Notifications"
                  />
                </div>
                {toBoolean(formData.telegram_notification) && (
                  <>
                    {/* <!-- Group 1 --> */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="telegram_bot_token"
                        >
                          {t('Telegram Bot Token')}
                        </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="telegram_bot_token"
                          id="telegram_bot_token"
                          value={formData.telegram_bot_token ?? ''} onChange={handleChange}
                        />
                      </div>
                      <div className="w-full sm:w-1/2">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="telegram_id"
                        >
                          {t('Telegram ID')}
                        </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="telegram_id"
                          id="telegram_id"
                          value={formData.telegram_id ?? ''} onChange={handleChange}
                        />
                      </div>
                    </div>    
                    {/* <!-- Group 1 --> */}
                    {/* <!-- Group 2 --> */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <div className="mb-5.5">
                          <ToggleSwitch
                            name="telegram_notification_start_playback"
                            id="telegram_notification_start_playback"
                            switches={switches.telegram_notification_start_playback}
                            checked={toBoolean(formData.telegram_notification_start_playback)}
                            onChange={handleChange}
                            labelKey="Notify on Playback Start"
                          />
                        </div>
                        {toBoolean(formData.telegram_notification_start_playback) && (
                          <div className="mb-5.5">
                            <label className="mb-3 block text-black dark:text-white">
                              {t('Playback Start Notification Text')}
                            </label>
                            <textarea
                              value={formData.telegram_notification_start_playback_text ?? ''}
                              onChange={handleChange}
                              name='telegram_notification_start_playback_text'
                              rows={4}
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            ></textarea>
                            <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                              {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="w-full sm:w-1/2">
                        <div className="mb-5.5">
                          <ToggleSwitch
                            name="telegram_notification_stop_playback"
                            id="telegram_notification_stop_playback"
                            switches={switches.telegram_notification_stop_playback}
                            checked={toBoolean(formData.telegram_notification_stop_playback)}
                            onChange={handleChange}
                            labelKey="Notify on Playback Stop"
                          />
                        </div>
                        {toBoolean(formData.telegram_notification_stop_playback) && (
                          <div className="mb-5.5">
                            <label className="mb-3 block text-black dark:text-white">
                              {t('Playback Stop Notification Text')}
                            </label>
                            <textarea
                              value={formData.telegram_notification_stop_playback_text ?? ''}
                              onChange={handleChange}
                              name='telegram_notification_stop_playback_text'
                              rows={4}
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            ></textarea>
                            <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                              {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                            </span>

                          </div>
                        )}
                      </div>
                    </div>
                    {/* <!-- Group 2 --> */}
                    {/* <!-- Group 3 --> */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <div className="mb-5.5">
                          <ToggleSwitch
                            name="telegram_notification_start_recording"
                            id="telegram_notification_start_recording"
                            switches={switches.telegram_notification_start_recording}
                            checked={toBoolean(formData.telegram_notification_start_recording)}
                            onChange={handleChange}
                            labelKey="Notify on Recording Start"
                          />
                        </div>
                        {toBoolean(formData.telegram_notification_start_recording) && (
                          <div className="mb-5.5">
                            <label className="mb-3 block text-black dark:text-white">
                              {t('Recording Start Notification Text')}
                            </label>
                            <textarea
                              value={formData.telegram_notification_start_recording_text ?? ''}
                              onChange={handleChange}
                              name='telegram_notification_start_recording_text'
                              rows={4}
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            ></textarea>
                            <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                              {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                            </span>

                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-1/2">
                        <div className="mb-5.5">
                          <ToggleSwitch
                            name="telegram_notification_stop_recording"
                            id="telegram_notification_stop_recording"
                            switches={switches.telegram_notification_stop_recording}
                            checked={toBoolean(formData.telegram_notification_stop_recording)}
                            onChange={handleChange}
                            labelKey="Notify on Recording Stop"
                          />
                        </div>
                        {toBoolean(formData.telegram_notification_stop_recording) && (
                          <div className="mb-5.5">
                            <label className="mb-3 block text-black dark:text-white">
                              {t('Recording Stop Notification Text')}
                            </label>
                            <textarea
                              value={formData.telegram_notification_stop_recording_text ?? ''}
                              onChange={handleChange}
                              name='telegram_notification_stop_recording_text'
                              rows={4}
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            ></textarea>
                            <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                              {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                            </span>

                          </div>
                        )}
                      </div>
                    </div>
                    {/* <!-- Group 3 --> */}
                    {/* <!-- Group 4 --> */}
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                      <div className="w-full sm:w-1/2">
                        <div className="mb-5.5">
                          <ToggleSwitch
                            name="telegram_notification_time"
                            id="telegram_notification_time"
                            switches={switches.telegram_notification_time}
                            checked={toBoolean(formData.telegram_notification_time)}
                            onChange={handleChange}
                            labelKey="Notify on Specific Time"
                          />
                        </div>
                        {toBoolean(formData.telegram_notification_time) && (
                          <div>
                            <div className="mb-5.5">
                              <label className="mb-3 block text-black dark:text-white">
                                {t('Time Notification Text')}
                              </label>
                              <textarea
                                value={formData.telegram_notification_time_text ?? ''}
                                onChange={handleChange}
                                name='telegram_notification_time_text'
                                rows={4}
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              ></textarea>
                              <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                                {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                              </span>
                            </div>
                            <div className="mb-5.5">
                                <label
                                  className="mb-3 block text-sm font-medium text-black dark:text-white"
                                  htmlFor="telegram_time_limit"
                                >
                                  {t('Telegram time limit (MIN)')}
                                </label>
                                <input
                                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                  type="number"
                                  name="telegram_time_limit"
                                  id="telegram_time_limit"
                                  value={formData.telegram_time_limit ?? ''} onChange={handleChange}
                                />
                              </div>
                          </div>
                        )}
                      </div>
                      <div className="w-full sm:w-1/2">
                        <div className="mb-5.5">
                          <ToggleSwitch
                            name="telegram_notification_ip_not_allowed"
                            id="telegram_notification_ip_not_allowed"
                            switches={switches.telegram_notification_ip_not_allowed}
                            checked={toBoolean(formData.telegram_notification_ip_not_allowed)}
                            onChange={handleChange}
                            labelKey="Notify on Unauthorized IP"
                          />
                        </div>
                        {toBoolean(formData.telegram_notification_ip_not_allowed) && (
                          <div className="mb-5.5">
                            <label className="mb-3 block text-black dark:text-white">
                              {t('Unauthorized IP Notification Text')}
                            </label>
                            <textarea
                              value={formData.telegram_notification_ip_not_allowed_text ?? ''}
                              onChange={handleChange}
                              name='telegram_notification_ip_not_allowed_text'
                              rows={4}
                              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            ></textarea>
                            <span className="text-gray-500 dark:text-gray-400 text-sm italic ml-2">
                              {t('The following variables can be used %%username%%, %%channel%%, %%date%%, %%client%% and %%hostname%%')}
                            </span>

                          </div>
                        )}
                      </div>
                    </div>
                    {/* <!-- Group 4 --> */}
                  </>
                )}
                {/* <!-- Button --> */}
                <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                  <Button />    
                </div>   
                {/* <!--Button --> */}
              </div>
            </div>
          </div>
          {/* <!-- Telegram --> */}
        </form>
      </div>
    </>
  );
};

export default Settings;
