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
import InicioPreceptor from './pages/dashboard/InicioPreceptor';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function AppRoutes() {
  const { isAuthenticated, userData } = useAuth();

  const getDashboardPath = () => {
    const tipoUser = localStorage.getItem('tipoUser');
    console.log('Tipo de usuario:', tipoUser);
    
    if (tipoUser === 'PRECEPTOR' && userData) {
      return '/dashboard';
    }
    
    console.log('Redirigiendo a ruta por defecto /dashboard');
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
              {/* Página de inicio para preceptores y coordinación */}
              <Route index element={<InicioPreceptor />} />
              {/* Rutas globales para coordinación */}
              <Route path="salidas" element={<Salidas />} />
              <Route path="documentos" element={<Documentos />} />
              <Route path="expediente" element={<Expediente />} />
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
                <Route path="expediente" element={<Expediente />} />
              </Route>
              {/* Ruta por defecto */}
              {/* <Route index element={<Navigate to={getDashboardPath()} replace />} /> */}
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
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;