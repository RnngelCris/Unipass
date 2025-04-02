import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import CreateAccount from './pages/CreateAccount';
import DashboardLayout from './pages/dashboard/Layout';
import Salidas from './pages/dashboard/Salidas';
import Documentos from './pages/dashboard/Documentos';
import Avisos from './pages/dashboard/Avisos';
import Expediente from './pages/dashboard/Expediente';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated, userData } = useAuth();

  const getDashboardPath = () => {
    const tipoUser = localStorage.getItem('tipoUser');
    const nivelAcademico = localStorage.getItem('nivelAcademico');
    
    if (tipoUser === 'PRECEPTOR' && nivelAcademico && userData) {
      const data = userData.Data || userData.data;
      if (data?.employee && data.employee.length > 0) {
        const sexo = data.employee[0].SEXO;
        const basePath = `/dashboard/${nivelAcademico.toLowerCase()}-${sexo.toLowerCase()}`;
        return `${basePath}/salidas`;
      }
    }
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Login onLogin={() => {}} />} />
            <Route path="/recover-password" element={<RecoverPassword />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route 
              path="/dashboard" 
              element={<DashboardLayout onLogout={() => {}} />}
            >
              {/* Rutas para preceptores de nivel medio masculino */}
              <Route path="nivel-medio-m">
                <Route path="salidas" element={<Salidas />} />
                <Route path="documentos" element={<Documentos />} />
                <Route path="avisos" element={<Avisos />} />
                <Route path="expediente" element={<Expediente />} />
              </Route>

              {/* Rutas para preceptores de nivel medio femenino */}
              <Route path="nivel-medio-f">
                <Route path="salidas" element={<Salidas />} />
                <Route path="documentos" element={<Documentos />} />
                <Route path="avisos" element={<Avisos />} />
                <Route path="expediente" element={<Expediente />} />
              </Route>

              {/* Rutas para preceptores universitarios masculino */}
              <Route path="universitario-m">
                <Route path="salidas" element={<Salidas />} />
                <Route path="documentos" element={<Documentos />} />
                <Route path="avisos" element={<Avisos />} />
                <Route path="expediente" element={<Expediente />} />
              </Route>

              {/* Rutas para preceptores universitarios femenino */}
              <Route path="universitario-f">
                <Route path="salidas" element={<Salidas />} />
                <Route path="documentos" element={<Documentos />} />
                <Route path="avisos" element={<Avisos />} />
                <Route path="expediente" element={<Expediente />} />
              </Route>

              {/* Ruta por defecto */}
              <Route index element={<Navigate to={getDashboardPath()} replace />} />
            </Route>
            <Route path="*" element={<Navigate to={getDashboardPath()} replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;