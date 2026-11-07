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
import { configApi } from './api';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Cargar idioma guardado en base de datos si existe
    configApi
      .getAll()
      .then((configs) => {
        const langConfig = configs.find((c) => c.name === 'language');
        if (langConfig?.value && langConfig.value !== i18n.language) {
          i18n.changeLanguage(langConfig.value);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, [i18n]);

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
