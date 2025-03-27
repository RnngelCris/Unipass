import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DoorClosed, FileText, Bell, FolderOpen } from 'lucide-react';
import logoMenu from '../assets/images/Logo-menu.png';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: DoorClosed, text: 'Salidas', path: '/dashboard/salidas' },
    { icon: FileText, text: 'Documentos', path: '/dashboard/documentos' },
    { icon: Bell, text: 'Avisos', path: '/dashboard/avisos' },
    { icon: FolderOpen, text: 'Expediente', path: '/dashboard/expediente' }
  ];

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
          const isActive = location.pathname === item.path;
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