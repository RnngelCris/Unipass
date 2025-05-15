import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DoorClosed, FileText, Bell, FolderOpen, Users, ClipboardList, Home } from 'lucide-react';
import logoMenu from '../assets/images/Logo-menu.png';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { userData } = useAuth();
  const tipoUser = localStorage.getItem('tipoUser');
  const data = userData?.Data || userData?.data;
  const employee = data?.employee?.[0];
  const isCoordinacion = employee?.ID_DEPARATAMENTO === 351;

  const getBasePath = () => {
    if (isCoordinacion) {
      return '/dashboard';
    }
    if (tipoUser === 'PRECEPTOR' && employee) {
      const sexo = employee.SEXO.toLowerCase();
      const departamento = employee.DEPARTAMENTO.toUpperCase();
      const nivel = departamento === 'H.V.N.U' ? 'universitario' : 'nivel-medio';
      return `/dashboard/${nivel}-${sexo}`;
    }
    return '/dashboard';
  };

  const getMenuItems = () => {
    const basePath = getBasePath();
    const baseMenuItems = [
      { icon: Home, text: 'Inicio', path: '/dashboard' },
      { icon: DoorClosed, text: 'Salidas', path: `${basePath}/salidas` },
    ];

    if (isCoordinacion) {
      // Coordinación ve todo igual que preceptor pero sin restricciones
      return [
        ...baseMenuItems,
        { icon: FileText, text: 'Documentos', path: `${basePath}/documentos` },
        { icon: FolderOpen, text: 'Expediente', path: `${basePath}/expediente` },
      ];
    }

    switch (tipoUser) {
      case 'PRECEPTOR':
        return [
          ...baseMenuItems,
          { icon: FileText, text: 'Documentos', path: `${basePath}/documentos` },
          { icon: FolderOpen, text: 'Expediente', path: `${basePath}/expediente` },
        ];
      case 'ADMIN':
        return [
          { icon: Users, text: 'Gestión de Usuarios', path: `${basePath}/usuarios` },
          { icon: ClipboardList, text: 'Reportes', path: `${basePath}/reportes` },
        ];
      default:
        return baseMenuItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-[#003B5C] min-h-screen p-4">
      <div className="mb-8">
        <img 
          src={logoMenu}
          alt="Universidad Linda Vista"
          className="w-[50%] h-auto mx-auto"
        />
      </div>
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/dashboard'
            ? location.pathname === '/dashboard' || location.pathname === '/dashboard/'
            : location.pathname.includes(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg mb-2 ${
                isActive 
                  ? 'bg-[#00304A] text-white'
                  : 'text-gray-300 hover:bg-[#00304A] hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.text}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;