import { ReactNode, createContext, useState, useContext } from 'react';

interface User {
  Data?: {
    employee: {
      MATRICULA: number;
      CAMPUS: string;
      NOMBRES: string;
      APELLIDOS: string;
      FECHA_NACIMIENTO: string;
      EDAD: number;
      SEXO: string;
      CELULAR: string;
      EMAIl_INSTITUCIONAL: string;
      ID_DEPARATAMENTO: number;
      DEPARTAMENTO: string;
    }[];
    type: string;
  };
  data?: {
    employee: {
      MATRICULA: number;
      CAMPUS: string;
      NOMBRES: string;
      APELLIDOS: string;
      FECHA_NACIMIENTO: string;
      EDAD: number;
      SEXO: string;
      CELULAR: string;
      EMAIl_INSTITUCIONAL: string;
      ID_DEPARATAMENTO: number;
      DEPARTAMENTO: string;
    }[];
    type: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: User | null;
  login: (data: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [userData, setUserData] = useState<User | null>(null);

  const login = (data: User) => {
    setUserData(data);
  };

  const logout = () => {
    setUserData(null);
    localStorage.removeItem('tipoUser');
    localStorage.removeItem('nivelAcademico');
  };

  const value = {
    isAuthenticated: !!userData,
    userData,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 