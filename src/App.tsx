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
  const [userType, setUserType] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [userGender, setUserGender] = useState('');

  const handleLogin = (type: string, level?: string, gender?: string) => {
    setIsAuthenticated(true);
    setUserType(type);
    if (level) setUserLevel(level);
    if (gender) setUserGender(gender);
  };

  const getDashboardPath = () => {
    if (userType === 'PRECEPTOR') {
      return `/dashboard/${userLevel.toLowerCase()}-${userGender.toLowerCase()}`;
    }
    return '/dashboard';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/" element={<Login onLogin={handleLogin} />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route 
                path="/dashboard" 
                element={<DashboardLayout onLogout={() => setIsAuthenticated(false)} />}
              >
                {/* Rutas para preceptores de nivel medio masculino */}
                <Route path="nivel-medio-m">
                  <Route path="salidas" element={<Salidas level="NIVEL MEDIO" gender="M" />} />
                  <Route path="documentos" element={<Documentos level="NIVEL MEDIO" gender="M" />} />
                  <Route path="avisos" element={<Avisos level="NIVEL MEDIO" gender="M" />} />
                  <Route path="expediente" element={<Expediente level="NIVEL MEDIO" gender="M" />} />
                </Route>

                {/* Rutas para preceptores de nivel medio femenino */}
                <Route path="nivel-medio-f">
                  <Route path="salidas" element={<Salidas level="NIVEL MEDIO" gender="F" />} />
                  <Route path="documentos" element={<Documentos level="NIVEL MEDIO" gender="F" />} />
                  <Route path="avisos" element={<Avisos level="NIVEL MEDIO" gender="F" />} />
                  <Route path="expediente" element={<Expediente level="NIVEL MEDIO" gender="F" />} />
                </Route>

                {/* Rutas para preceptores universitarios masculino */}
                <Route path="universitario-m">
                  <Route path="salidas" element={<Salidas level="UNIVERSITARIO" gender="M" />} />
                  <Route path="documentos" element={<Documentos level="UNIVERSITARIO" gender="M" />} />
                  <Route path="avisos" element={<Avisos level="UNIVERSITARIO" gender="M" />} />
                  <Route path="expediente" element={<Expediente level="UNIVERSITARIO" gender="M" />} />
                </Route>

                {/* Rutas para preceptores universitarios femenino */}
                <Route path="universitario-f">
                  <Route path="salidas" element={<Salidas level="UNIVERSITARIO" gender="F" />} />
                  <Route path="documentos" element={<Documentos level="UNIVERSITARIO" gender="F" />} />
                  <Route path="avisos" element={<Avisos level="UNIVERSITARIO" gender="F" />} />
                  <Route path="expediente" element={<Expediente level="UNIVERSITARIO" gender="F" />} />
                </Route>

                {/* Ruta por defecto */}
                <Route index element={<Navigate to={`${getDashboardPath()}/salidas`} replace />} />
              </Route>
              <Route path="*" element={<Navigate to={getDashboardPath()} replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;