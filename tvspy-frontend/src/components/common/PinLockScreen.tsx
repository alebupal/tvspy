import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { configApi } from '../../api';
import Logo from '../../images/logo/logo-icon.svg';
import { FiLock, FiUnlock, FiDelete } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface PinLockScreenProps {
  onUnlock: () => void;
  expectedLength?: number;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  onUnlock,
  expectedLength = 4,
}) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Cantidad de puntos a mostrar (se adapta exactamente al tamaño del PIN configurado)
  const dotsCount = Math.max(expectedLength, pin.length, 4);

  const handleKeyPress = (num: string) => {
    if (pin.length < 12) {
      setError(null);
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPin('');
  };

  const handleSubmit = async (codeToSubmit?: string) => {
    const code = codeToSubmit || pin;
    if (!code) return;

    setLoading(true);
    setError(null);
    try {
      const res = await configApi.verifyPin(code);
      if (res.success) {
        sessionStorage.setItem('tvspy_unlocked', '1');
        toast.success(t('Access granted') || 'Acceso concedido');
        onUnlock();
      } else {
        setError(res.error || t('Incorrect PIN') || 'PIN incorrecto');
        setPin('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('Incorrect PIN') || 'PIN incorrecto');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // Envío automático cuando se alcanza la longitud configurada
  useEffect(() => {
    if (expectedLength && pin.length === expectedLength) {
      handleSubmit(pin);
    }
  }, [pin, expectedLength]);

  // Soporte de teclado físico (números, borrar, enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-whiten dark:bg-boxdark-2 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-stroke bg-white p-8 shadow-2xl dark:border-strokedark dark:bg-boxdark text-center">
        {/* Logo e Icono */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
          <img src={Logo} alt="TVSPY" className="h-10 w-10" />
        </div>

        <h2 className="text-xl font-bold text-black dark:text-white flex items-center justify-center gap-2">
          <FiLock className="text-primary text-lg" />
          <span>TVSPY Protegido</span>
        </h2>
        <p className="mt-1 text-xs text-body dark:text-bodydark">
          {t('Enter your PIN to access TVSPY') || 'Introduce tu código PIN para acceder a TVSPY'}
        </p>

        {/* Círculos / Display del PIN dinámico según la longitud real */}
        <div className="my-6 flex justify-center gap-2.5 flex-wrap max-w-[260px] mx-auto">
          {Array.from({ length: dotsCount }).map((_, idx) => (
            <div
              key={idx}
              className={`h-3.5 w-3.5 rounded-full border transition-all duration-200 ${
                pin.length > idx
                  ? 'border-primary bg-primary scale-110 shadow-sm'
                  : 'border-stroke bg-gray-100 dark:border-strokedark dark:bg-meta-4'
              } ${error ? 'border-rose-500 bg-rose-500 animate-pulse' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-xs font-semibold text-rose-500 animate-shake">
            {error}
          </p>
        )}

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="flex h-12 w-full items-center justify-center rounded-xl border border-stroke bg-gray-50/70 text-base font-bold text-black hover:bg-primary hover:text-white dark:border-strokedark dark:bg-meta-4/30 dark:text-white dark:hover:bg-primary transition shadow-sm active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-stroke/50 text-xs font-semibold text-body hover:bg-gray-100 dark:border-strokedark/50 dark:text-bodydark dark:hover:bg-meta-4 transition active:scale-95"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-stroke bg-gray-50/70 text-base font-bold text-black hover:bg-primary hover:text-white dark:border-strokedark dark:bg-meta-4/30 dark:text-white dark:hover:bg-primary transition shadow-sm active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-stroke/50 text-base font-bold text-body hover:bg-gray-100 dark:border-strokedark/50 dark:text-bodydark dark:hover:bg-meta-4 transition active:scale-95"
            aria-label="Borrar dígito"
          >
            <FiDelete />
          </button>
        </div>

        {/* Botón Desbloquear */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={loading || pin.length === 0}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
        >
          <FiUnlock className="text-sm" />
          <span>{loading ? 'Verificando...' : (t('Unlock') || 'Desbloquear')}</span>
        </button>
      </div>
    </div>
  );
};

export default PinLockScreen;
