import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DebugProvider } from './context/DebugContext';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import Home from './pages/Home';
import Settings from './pages/Settings';
import User from './pages/User';
import Channel from './pages/Channel';
import Registry from './pages/Registry';
import DefaultLayout from './layout/DefaultLayout';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <DebugProvider>
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
            path="/settings"
            element={
              <>
                <PageTitle title={`${t('Settings')} - TVSpy`} />
                <Settings />
              </>
            }
          />
        </Routes>
      </DefaultLayout>
    </DebugProvider>
  );
}

export default App;
