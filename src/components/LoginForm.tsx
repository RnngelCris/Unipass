import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Store } from 'lucide-react';
import ErrorMessage from './ErrorMessage';
import authService from '../services/AuthService';
import userService from '../services/UserService';
import UniversityLogo from './UniversityLogo';
import logoMovil from '../assets/images/LogoMovil.png';

interface LoginFormProps {
  onLogin: (type: string, level?: string, gender?: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileApp, setShowMobileApp] = useState(false);
  const [userType, setUserType] = useState<'ALUMNO' | 'VIGILANCIA' | null>(null);
  const [formData, setFormData] = useState({
    matricula: '',
    password: '',
    remember: false
  });

  const saveUserInfo = async (userData: any) => {
    try {
      // Normalizar la estructura de datos
      const data = userData.Data || userData.data;
      
      if (!data) {
        console.error('No se encontraron datos en la respuesta:', userData);
        return;
      }

      if (data.student && data.student.length > 0) {
        // Guardar información de estudiantes
        const student = data.student[0];
        localStorage.setItem('nivelAcademico', student.NIVEL_EDUCATIVO);
        localStorage.setItem('sexo', student.SEXO);
        localStorage.setItem('matricula', student.MATRICULA);
        localStorage.setItem('nombre', student.NOMBRE);
        localStorage.setItem('apellidos', student.APELLIDOS);
        localStorage.setItem('correo', student.CORREO_INSTITUCIONAL);

        if (data.work && data.work.length > 0) {
          const work = data.work[0];
          localStorage.setItem('idDepto', work['ID DEPTO'].toString());
          localStorage.setItem('nombreDepartamento', work['DEPARTAMENTO']);
          localStorage.setItem('idJefe', work['ID JEFE'].toString());
          localStorage.setItem('trabajo', work['JEFE DEPARTAMENTO']);
        }
      } else if (data.employee && data.employee.length > 0) {
        // Guardar información de empleados
        const employee = data.employee[0];
        localStorage.setItem('sexo', employee.SEXO);
        localStorage.setItem('matricula', employee.MATRICULA.toString());
        localStorage.setItem('nombreDepartamento', employee.DEPARTAMENTO);
        localStorage.setItem('nombre', employee.NOMBRES);
        localStorage.setItem('apellidos', employee.APELLIDOS);
        localStorage.setItem('correo', employee.EMAIl_INSTITUCIONAL);
        localStorage.setItem('idDepto', employee.ID_DEPARATAMENTO.toString());
      }
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Authenticate user without MTR prefix
      const result = await authService.authenticateUser(
        formData.matricula,
        formData.matricula,
        formData.password
      );

      if (result.success) {
        const tipoUser = result.user.TipoUser;
        const userId = result.user.Matricula;
        const newUserId = userId.replace('MTR', '');

        // Check if user is student or vigilancia
        if (tipoUser === 'ALUMNO' || tipoUser === 'VIGILANCIA') {
          setUserType(tipoUser as 'ALUMNO' | 'VIGILANCIA');
          setShowMobileApp(true);
          return;
        }

        // Save user type and dormitory info if applicable
        if (tipoUser === 'DEPARTAMENTO' || tipoUser === 'PRECEPTOR') {
          localStorage.setItem('idDormitorio', result.user.Dormitorio.toString());
        }
        localStorage.setItem('tipoUser', tipoUser);

        // Get and save additional user data
        const userData = await userService.getDatosUser(newUserId);
        await saveUserInfo(userData);

        // Check if user is active
        if (result.user.StatusActividad === 1) {
          const data = userData.Data || userData.data;
          if (tipoUser === 'PRECEPTOR' && data?.student && data.student.length > 0) {
            const student = data.student[0];
            const level = student.NIVEL_EDUCATIVO;
            const gender = student.SEXO;
            onLogin(tipoUser, level, gender);
          } else {
            onLogin(tipoUser);
          }
        } else {
          setError('Usuario no activo');
        }
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  if (showMobileApp) {
    return (
      <div className="w-full max-w-[384px]">
        <div className="flex flex-col items-center text-center">
          <UniversityLogo />
          
          <img 
            src={logoMovil} 
            alt="UNIPASS Mobile" 
            className="w-24 h-24 mb-6"
          />
          
          <h2 className="text-2xl font-bold text-[#003B5C] mb-4">
            ¡Descarga nuestra app!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Para aprovechar al máximo los servicios {userType === 'ALUMNO' ? 'estudiantiles' : 'de vigilancia'}, descarga nuestra aplicación móvil UNIPASS
          </p>

          <a
            href="https://play.google.com/store/apps/details?id=com.irvingdesarrolla.UNIPASS&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-[#F4C430] text-gray-900 py-3 px-6 rounded-lg hover:bg-[#E3B420] transition-colors mb-6 w-full"
          >
            <Store className="h-5 w-5" />
            <span>Descargar en Play Store</span>
          </a>

          <button 
            onClick={() => setShowMobileApp(false)}
            className="text-sm text-[#06426a] hover:text-[#06426a]/80"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[384px]">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Matrícula institucional
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <GraduationCap className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Ejemplo: 221007"
            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.matricula}
            onChange={(e) => setFormData({ ...formData, matricula: e.target.value.replace(/\D/g, '') })}
            maxLength={6}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={formData.remember}
            onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
            disabled={isLoading}
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Recordarme
          </label>
        </div>
        <Link 
          to="/recover-password" 
          className="text-sm text-[#06426a] hover:text-[#06426a]/80"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.matricula || !formData.password}
        className={`w-full py-2.5 px-4 rounded-md transition duration-200 mb-6 ${
          isLoading || !formData.matricula || !formData.password
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#F4C430] hover:bg-[#E3B420] text-gray-900'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Iniciando sesión...
          </div>
        ) : (
          'Iniciar sesión'
        )}
      </button>

      <div className="text-center">
        <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
        <Link 
          to="/create-account" 
          className="text-sm text-[#06426a] hover:text-[#06426a]/80"
        >
          Crear cuenta nueva
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;