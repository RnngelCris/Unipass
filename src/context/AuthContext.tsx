import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDataResponse } from '../types/user';

interface AuthContextType {
  userData: UserDataResponse | null;
  setUserData: (data: UserDataResponse | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserDataResponse | null>(null);

  useEffect(() => {
    // Recuperar datos del usuario del localStorage al cargar la aplicación
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      try {
        setUserData(JSON.parse(savedUserData));
      } catch (error) {
        console.error('Error al recuperar datos del usuario:', error);
      }
    }
  }, []);

  const logout = () => {
    setUserData(null);
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        setUserData,
        isAuthenticated: !!userData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 