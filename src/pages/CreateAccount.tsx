import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User } from 'lucide-react';
import UniversityLogo from '../components/UniversityLogo';
import UserService from '../services/UserService';
import OtpService from '../services/OtpService';
import { UserData } from '../types/user';
import ErrorMessage from '../components/ErrorMessage';
import UserInfoPreview from '../components/UserInfoPreview';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    matricula: '',
    verificationCode: ['', '', '', ''],
    password: '',
    confirmPassword: ''
  });
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleSubmitMatricula = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validar formato de matrícula
      if (!/^\d{6}$/.test(formData.matricula)) {
        throw new Error('La matrícula debe contener 6 dígitos');
      }

      // Obtener datos del usuario
      const data = await UserService.getDatosUser(formData.matricula);
      setUserData(data);

      // Obtener el correo institucional
      const email = data.student?.[0]?.CORREO_INSTITUCIONAL;

      if (!email) {
        throw new Error('No se encontró el correo institucional asociado a esta matrícula');
      }

      // Enviar OTP
      await OtpService.sendOTP(email);
      setStep(2);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const otp = formData.verificationCode.join('');
      const email = userData?.student?.[0]?.CORREO_INSTITUCIONAL;

      if (!email) {
        throw new Error('No se encontró el correo institucional');
      }

      const isValid = await OtpService.verifyOTP(otp, email);
      
      if (isValid) {
        setStep(3);
      } else {
        throw new Error('Código de verificación inválido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const newCode = [...formData.verificationCode];
    newCode[index] = value;
    
    setFormData({
      ...formData,
      verificationCode: newCode
    });

    // Mover al siguiente input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formData.verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleContinue = () => {
    if (!userData) {
      setError('No se encontraron datos del usuario');
      return;
    }

    const student = userData.student[0];
    
    // Validar si es alumno interno
    if (userData.type === 'ALUMNO' && student.RESIDENCIA !== 'INTERNO') {
      setError('Solo los alumnos internos pueden crear una cuenta');
      return;
    }

    setStep(4);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!userData?.student?.[0]) {
        throw new Error('Datos de usuario no encontrados');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      const student = userData.student[0];
      
      await UserService.registerUser({
        Matricula: formData.matricula,
        Contraseña: formData.password,
        Correo: student.CORREO_INSTITUCIONAL,
        Nombre: student.NOMBRE,
        Apellidos: student.APELLIDOS,
        TipoUser: userData.type,
        Sexo: student.SEXO,
        FechaNacimiento: student.FECHA_NACIMIENTO,
        Celular: student.CELULAR,
        StatusActividad: 1,
        Dormitorio: student.RESIDENCIA === 'INTERNO' ? 1 : 0
      });

      // Redirigir al login
      navigate('/');
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-[384px] bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <UniversityLogo />
          
          {error && (
            <ErrorMessage 
              message={error} 
              onClose={() => setError(null)}
            />
          )}

          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-[#003B5C] mb-2">Crear cuenta</h2>
              <p className="text-sm text-center text-gray-600 mb-8">
                Ingresa tu matrícula institucional
              </p>

              <form onSubmit={handleSubmitMatricula} className="w-full">
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula de estudiante o empleado
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
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.matricula.length !== 6}
                  className="w-full bg-[#F4C430] text-gray-900 py-2.5 px-4 rounded-md hover:bg-[#E3B420] transition duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Enviar código de verificación'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-[#003B5C] mb-2">Verificación</h2>
              <p className="text-sm text-center text-gray-600 mb-8">
                Ingresa el código de verificación enviado a tu correo institucional
              </p>

              <form onSubmit={handleVerifyOTP} className="w-full">
                <div className="mb-8">
                  <div className="flex justify-center space-x-3">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        maxLength={1}
                        className="w-14 h-14 text-center text-2xl font-semibold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.verificationCode[index]}
                        onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        required
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.verificationCode.some(code => !code)}
                  className="w-full bg-[#F4C430] text-gray-900 py-2.5 px-4 rounded-md hover:bg-[#E3B420] transition duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verificando...' : 'Verificar código'}
                </button>
              </form>
            </>
          )}

          {step === 3 && userData && (
            <>
              <h2 className="text-2xl font-bold text-[#003B5C] mb-2">Confirmar información</h2>
              <p className="text-sm text-center text-gray-600 mb-8">
                Verifica que tus datos sean correctos
              </p>

              <UserInfoPreview userData={userData} />

              <button
                onClick={handleContinue}
                className="w-full bg-[#F4C430] text-gray-900 py-2.5 px-4 rounded-md hover:bg-[#E3B420] transition duration-200 mt-8 mb-6"
              >
                Continuar
              </button>
            </>
          )}

          {step === 4 && userData && (
            <>
              <h2 className="text-2xl font-bold text-[#003B5C] mb-2">Crear cuenta</h2>
              <p className="text-sm text-center text-gray-600 mb-8">
                Establece tu contraseña
              </p>

              <div className="w-full mb-8">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="bg-yellow-400 rounded-full p-2">
                    <User className="h-5 w-5 text-gray-800" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usuario</p>
                    <p className="font-medium">{formData.matricula}</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAccount}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        minLength={8}
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        La contraseña debe tener al menos 8 caracteres
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        minLength={8}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !formData.password || !formData.confirmPassword}
                    className="w-full bg-[#F4C430] text-gray-900 py-2.5 px-4 rounded-md hover:bg-[#E3B420] transition duration-200 mt-8 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>
              </div>
            </>
          )}

          <div className="text-center">
            <Link 
              to="/" 
              className="text-sm text-[#06426a] hover:text-[#06426a]/80"
            >
              Volver a Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;