import { ReactNode, useState } from 'react';
import AuthContext from '../hooks/useAuth';

interface User {
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
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 