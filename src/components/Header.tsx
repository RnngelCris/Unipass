import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, ChevronDown, Moon, Sun, Settings, Bell, HelpCircle, LogOut, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStatsSalidas } from '../services/SalidasService';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { userData } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const fetchPendientes = async () => {
      const data = userData?.Data || userData?.data;
      const matriculaPreceptor = data?.employee?.[0]?.MATRICULA;
      if (!matriculaPreceptor) return;
      try {
        const stats = await getStatsSalidas(String(matriculaPreceptor));
        setPendingCount(stats.Pendientes || 0);
      } catch (error) {
        setPendingCount(0);
      }
    };
    fetchPendientes();
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu((prev) => !prev);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Solo maquetado: mostrar la imagen localmente
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
      setShowProfileMenu(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic(null);
    setShowProfileMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-3 flex justify-end items-center">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 rounded-lg px-4 py-2 focus:outline-none group"
        >
          <div className="relative">
            {/* Avatar más pequeño en la barra superior */}
            {profilePic ? (
              <img
                src={profilePic}
                alt="Foto de perfil"
                className="h-10 w-10 rounded-full object-cover border-2 border-yellow-400"
              />
            ) : (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full p-1 flex items-center justify-center h-10 w-10">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
            )}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{userInfo.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{userInfo.email}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-2 z-50">
            <div className="px-4 py-3 border-b dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  {/* Avatar pequeño y editable en el menú desplegable */}
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Foto de perfil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-5 w-5 text-white" />
                      )}
                      <button
                        className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full p-0.5 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={handleEditClick}
                        tabIndex={-1}
                        style={{ transform: 'translate(25%, 25%)' }}
                      >
                        <Pencil className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                      </button>
                      {/* Menú contextual */}
                      {showProfileMenu && (
                        <div className="absolute z-50 left-20 top-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-44 flex flex-col">
                          <button
                            className="px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Subir foto de perfil
                          </button>
                          {profilePic && (
                            <button
                              className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={handleRemovePhoto}
                            >
                              Eliminar foto de perfil
                            </button>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">¡Hola, {userInfo.name}!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{userInfo.email}</p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 group transition-colors duration-200"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300" />
                )}
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {isDarkMode ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                </span>
              </button>

              <button
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 group transition-colors duration-200"
                onClick={() => navigate('/dashboard/universitario-m/salidas', { state: { status: 'pendiente' } })}
              >
                <Bell className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300" />
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Notificaciones</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {pendingCount > 0
                      ? `Tienes ${pendingCount} salidas pendientes de revisión`
                      : 'Sin notificaciones nuevas'}
                  </span>
                </div>
                {pendingCount > 0 && (
                  <span className="ml-auto bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 group transition-colors duration-200">
                <HelpCircle className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300" />
                <div className="flex flex-col">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Centro de ayuda</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Guías y soporte</span>
                </div>
              </button>
            </div>

            <div className="border-t dark:border-gray-700 py-2">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/10 group transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300" />
                <div className="flex flex-col">
                  <span className="text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">Cerrar sesión</span>
                  <span className="text-xs text-red-400 dark:text-red-500">Finalizar sesión actual</span>
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