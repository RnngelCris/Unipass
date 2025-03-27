import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import CreateAccount from './pages/CreateAccount';
import DashboardLayout from './pages/dashboard/Layout';
import Salidas from './pages/dashboard/Salidas';
import Documentos from './pages/dashboard/Documentos';
import Avisos from './pages/dashboard/Avisos';
import Expediente from './pages/dashboard/Expediente';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<DashboardLayout onLogout={() => setIsAuthenticated(false)} />}>
                <Route path="salidas" element={<Salidas />} />
                <Route path="documentos" element={<Documentos />} />
                <Route path="avisos" element={<Avisos />} />
                <Route path="expediente" element={<Expediente />} />
                <Route index element={<Navigate to="/dashboard/salidas" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;