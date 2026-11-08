import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WebSocketProvider } from './context/WebSocketContext';
import { DebugProvider } from './context/DebugContext';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import Home from './pages/Home';
import Settings from './pages/Settings';
import User from './pages/User';
import Channel from './pages/Channel';
import Registry from './pages/Registry';
import Statistics from './pages/Statistics';
import Changelog from './pages/Changelog';
import DefaultLayout from './layout/DefaultLayout';
import PinLockScreen from './components/common/PinLockScreen';
import { configApi } from './api';
import { isAppUnlocked, clearAppUnlocked } from './utils/authUtils';

function App() {
  const isUnlocked = isAppUnlocked();
  const cachedPinEnabled = typeof window !== 'undefined' && localStorage.getItem('tvspy_pin_enabled') === '1';
  const cachedPinLength = typeof window !== 'undefined' ? (Number(localStorage.getItem('tvspy_pin_length')) || 4) : 4;

  const [loading, setLoading] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(!isUnlocked);
  const [isLocked, setIsLocked] = useState<boolean>(!isUnlocked && cachedPinEnabled);
  const [pinLength, setPinLength] = useState<number>(cachedPinLength);
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Comprobar si la protección con PIN está activada
    configApi
      .getPinStatus()
      .then((res) => {
        if (res && res.enabled) {
          localStorage.setItem('tvspy_pin_enabled', '1');
          if (res.length) {
            localStorage.setItem('tvspy_pin_length', String(res.length));
            setPinLength(res.length);
          }
          if (!isAppUnlocked()) {
            setIsLocked(true);
          } else {
            setIsLocked(false);
          }
        } else {
          localStorage.removeItem('tvspy_pin_enabled');
          localStorage.removeItem('tvspy_pin_length');
          clearAppUnlocked();
          setIsLocked(false);
        }
      })
      .catch(() => {
        if (!cachedPinEnabled || isAppUnlocked()) {
          setIsLocked(false);
        }
      })
      .finally(() => {
        setCheckingAuth(false);
      });

    // Sincronizar idioma guardado en la base de datos si difiere
    configApi
      .getAll()
      .then((configs) => {
        if (Array.isArray(configs)) {
          const langConfig = configs.find((c) => c.name === 'language');
          if (langConfig?.value && langConfig.value !== i18n.language) {
            i18n.changeLanguage(langConfig.value);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (isLocked) {
    return (
      <PinLockScreen
        expectedLength={pinLength}
        onUnlock={() => {
          setIsLocked(false);
          setCheckingAuth(false);
        }}
      />
    );
  }

  if (checkingAuth) {
    return <Loader />;
  }

  return loading ? (
    <Loader />
  ) : (
    <DebugProvider>
      <WebSocketProvider>
        <DefaultLayout>
          <Routes>
            <Route
              index
              element={
                <>
                  <PageTitle title={`${t('Home')} - TVSpy`} />
                  <Home />
                </>
              }
            />
            <Route
              path="/registry"
              element={
                <>
                  <PageTitle title={`${t('Registry')} - TVSpy`} />
                  <Registry />
                </>
              }
            />
            <Route
              path="/channels"
              element={
                <>
                  <PageTitle title={`${t('Channels')} - TVSpy`} />
                  <Channel />
                </>
              }
            />
            <Route
              path="/users"
              element={
                <>
                  <PageTitle title={`${t('Users')} - TVSpy`} />
                  <User />
                </>
              }
            />
            <Route
              path="/statistics"
              element={
                <>
                  <PageTitle title={`${t('Statistics')} - TVSpy`} />
                  <Statistics />
                </>
              }
            />
            <Route
              path="/settings"
              element={
                <>
                  <PageTitle title={`${t('Settings')} - TVSpy`} />
                  <Settings />
                </>
              }
            />
            <Route
              path="/changelog"
              element={
                <>
                  <PageTitle title="Changelog & Docs - TVSpy" />
                  <Changelog />
                </>
              }
            />
          </Routes>
        </DefaultLayout>
      </WebSocketProvider>
    </DebugProvider>
  );
}

export default App;
