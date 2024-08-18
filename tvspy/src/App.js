import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './i18n';
import NavBarComponent from './components/NavBarComponent';
import Home from './pages/Home';
import Registry from './pages/Registry';
import Channels from './pages/Channels';
import Users from './pages/Users';
import Configuration from './pages/Configuration';

function App() {
  return (
    <Router>
      <NavBarComponent />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registry" element={<Registry />} />        
          <Route path="/channels" element={<Channels />} />
          <Route path="/users" element={<Users />} />
          <Route path="/configuration" element={<Configuration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

