import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, ChevronDown, Moon, Sun, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { userData } = useAuth();

  const getUserInfo = () => {
    const data = userData?.Data || userData?.data;
    if (data?.employee && data.employee.length > 0) {
      const employee = data.employee[0];
      const primerNombre = employee.NOMBRES.split(' ')[0];
      return {
        name: `${primerNombre} ${employee.APELLIDOS}`,
        fullName: `${employee.NOMBRES} ${employee.APELLIDOS}`,
        email: employee.EMAIl_INSTITUCIONAL || 'Sin correo registrado'
      };
    }
    return {
      name: 'Usuario',
      fullName: 'Usuario',
      email: 'Sin correo registrado'
    };
  };

  const userInfo = getUserInfo();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Implement theme switching logic here
  };

  return (
    <div className="bg-white shadow-sm px-6 py-3 flex justify-end items-center">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2 focus:outline-none group"
        >
          <div className="relative">
            <div className="bg-yellow-400 rounded-full p-2 group-hover:bg-yellow-500 transition-colors duration-200">
              <UserCircle size={24} className="text-gray-800" />
            </div>
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">{userInfo.name}</span>
            <span className="text-xs text-gray-500">{userInfo.email}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border py-2 z-50">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-3">
                  <UserCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">¡Hola, {userInfo.name}!</p>
                  <p className="text-sm text-gray-600">{userInfo.email}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 group transition-colors duration-200"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                )}
                <span className="text-gray-700 group-hover:text-gray-900">Cambiar tema</span>
              </button>

              <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 group transition-colors duration-200">
                <Settings className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-gray-700 group-hover:text-gray-900">Configuración</span>
                  <span className="text-xs text-gray-500">Preferencias, notificaciones</span>
                </div>
              </button>

              <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 group transition-colors duration-200">
                <Bell className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-gray-700 group-hover:text-gray-900">Notificaciones</span>
                  <span className="text-xs text-gray-500">2 notificaciones sin leer</span>
                </div>
                {hasNotifications && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    2
                  </span>
                )}
              </button>

              <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 group transition-colors duration-200">
                <HelpCircle className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                <div className="flex flex-col">
                  <span className="text-gray-700 group-hover:text-gray-900">Centro de ayuda</span>
                  <span className="text-xs text-gray-500">Guías y soporte</span>
                </div>
              </button>
            </div>

            <div className="border-t py-2">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-red-50 group transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-600" />
                <div className="flex flex-col">
                  <span className="text-red-600 group-hover:text-red-700">Cerrar sesión</span>
                  <span className="text-xs text-red-400">Finalizar sesión actual</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;