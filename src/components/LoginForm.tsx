import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    matricula: '',
    password: '',
    remember: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    if (formData.matricula && formData.password) {
      onLogin();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[384px]">
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
            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
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
        className="w-full bg-[#F4C430] text-gray-900 py-2.5 px-4 rounded-md hover:bg-[#E3B420] transition duration-200 mb-6"
      >
        Iniciar sesión
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