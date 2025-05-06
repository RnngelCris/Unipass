import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User } from 'lucide-react';
import UniversityLogo from '../components/UniversityLogo';
import UserService from '../services/UserService';
import OtpService from '../services/OtpService';
import { UserData, UserDataResponse } from '../types/user';
import ErrorMessage from '../components/ErrorMessage';
import UserInfoPreview from '../components/UserInfoPreview';
import logoMovil from '../assets/images/LogoMovil.png';

const GooglePlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-5 w-5">
    <path
      d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"
      fill="currentColor"
    />
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="h-5 w-5">
    <path 
      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      fill="currentColor"
    />
  </svg>
);

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
  const [isStudent, setIsStudent] = useState(false);
  const [isVigilancia, setIsVigilancia] = useState(false);
  const [isNonPreceptorEmployee, setIsNonPreceptorEmployee] = useState(false);

  const isButtonDisabled = () => {
    switch (step) {
      case 1:
        return !formData.matricula || formData.matricula.length === 0;
      case 2:
        return formData.verificationCode.some(code => !code);
      case 3:
        return !userData;
      case 4:
        return !formData.password || !formData.confirmPassword || formData.password.length < 8;
      default:
        return false;
    }
  };

  const handleSubmitMatricula = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.matricula.length === 0) {
        throw new Error('La matrícula es requerida');
      }

      const response = await UserService.getDatosUser(formData.matricula);
      const responseData = response.Data || response.data;
      
      if (!responseData) {
        throw new Error('No se encontraron datos del usuario');
      }

      // Validar si es un empleado y verificar su ID_DEPARATAMENTO
      if (responseData.type === 'EMPLEADO') {
        const employee = responseData.employee?.[0];
        if (!employee) {
          throw new Error('No se encontraron datos del empleado');
        }

        const preceptorIds = [315, 316, 317, 318];
        if (!preceptorIds.includes(employee.ID_DEPARATAMENTO)) {
          setIsNonPreceptorEmployee(true);
          return;
        }
      }
      
      // Check if user is a student or vigilancia
      if (responseData.type === 'ALUMNO' || responseData.type === 'VIGILANCIA') {
        setIsStudent(responseData.type === 'ALUMNO');
        setIsVigilancia(responseData.type === 'VIGILANCIA');
        return;
      }

      const userData: UserData = {
        student: responseData.student,
        type: responseData.type,
        Tutor: responseData.Tutor,
        work: responseData.work,
        employee: responseData.employee
      };

      setUserData(userData);

      // Obtener el correo institucional dependiendo del tipo de usuario
      let email: string | undefined;
      if (responseData.type === 'EMPLEADO' && responseData.employee?.[0]) {
        email = responseData.employee[0].EMAIl_INSTITUCIONAL;
      } else if (responseData.student?.[0]) {
        email = responseData.student[0].CORREO_INSTITUCIONAL;
      }

      if (!email) {
        throw new Error('No se encontró el correo institucional asociado a esta matrícula');
      }

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
    if (!/^\d*$/.test(value)) return;

    const newCode = [...formData.verificationCode];
    newCode[index] = value;
    
    setFormData({
      ...formData,
      verificationCode: newCode
    });

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
    if (!userData || !userData.student || userData.student.length === 0) {
      setError('No se encontraron datos del usuario');
      return;
    }

    const student = userData.student[0];
    
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
      if (!userData) {
        throw new Error('Datos de usuario no encontrados');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }

      let registerData;
      
      if (userData.type === 'EMPLEADO' && userData.employee?.[0]) {
        const employee = userData.employee[0];
        registerData = {
          Matricula: formData.matricula,
          Contraseña: formData.password,
          Correo: employee.EMAIl_INSTITUCIONAL,
          Nombre: employee.NOMBRES,
          Apellidos: employee.APELLIDOS,
          TipoUser: userData.type,
          NivelAcademico: "EMPLEADO",
          Sexo: employee.SEXO,
          FechaNacimiento: employee.FECHA_NACIMIENTO || new Date().toISOString(),
          Celular: employee.CELULAR || "",
          StatusActividad: 1,
          Dormitorio: 5
        };
      } else if (userData.student?.[0]) {
        const student = userData.student[0];
        registerData = {
          Matricula: formData.matricula,
          Contraseña: formData.password,
          Correo: student.CORREO_INSTITUCIONAL,
          Nombre: student.NOMBRE,
          Apellidos: student.APELLIDOS,
          TipoUser: userData.type,
          NivelAcademico: student.NIVEL_EDUCATIVO,
          Sexo: student.SEXO,
          FechaNacimiento: student.FECHA_NACIMIENTO,
          Celular: student.CELULAR,
          StatusActividad: 1,
          Dormitorio: student.RESIDENCIA === 'INTERNO' ? 1 : 0
        };
      } else {
        throw new Error('No se encontraron datos del usuario');
      }

      await UserService.registerUser(registerData);
      navigate('/');
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  if (isStudent || isVigilancia) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[384px] w-full bg-white p-8 rounded-lg shadow-md">
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
              Para aprovechar al máximo los servicios {isStudent ? 'estudiantiles' : 'de vigilancia'}, descarga nuestra aplicación móvil UNIPASS
            </p>

            <div className="flex flex-col space-y-3 w-full mb-6">
              <a
                href="https://play.google.com/store/apps/details?id=com.irvingdesarrolla.UNIPASS&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-[#F4C430] text-gray-900 py-3 px-6 rounded-lg hover:bg-[#E3B420] transition-colors w-full"
              >
                <GooglePlayIcon />
                <span>Descargar en Play Store</span>
              </a>

              <button
                disabled
                className="flex items-center justify-center space-x-2 bg-[#D1D5DB] text-gray-700 py-3 px-6 rounded-lg transition-colors w-full disabled:cursor-not-allowed"
              >
                <AppleIcon />
                <span>Próximamente en App Store</span>
              </button>
            </div>

            <Link 
              to="/" 
              className="text-sm text-[#06426a] hover:text-[#06426a]/80"
            >
              Volver a Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isNonPreceptorEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[384px] w-full bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col items-center text-center">
            <UniversityLogo />
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mt-6 mb-8">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                Acceso Restringido
              </h2>
              <p className="text-yellow-700">
                Lo sentimos, esta sección es solo para preceptores y coordinación. Por favor, utilice la sección correspondiente para su departamento.
              </p>
            </div>

            <Link 
              to="/" 
              className="text-sm text-[#06426a] hover:text-[#06426a]/80"
            >
              Volver a Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[384px] w-full bg-white p-8 rounded-lg shadow-md">
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
                    Matrícula del empleado
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
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isButtonDisabled()}
                  className={`w-full py-2.5 px-4 rounded-md transition duration-200 mb-6 ${
                    isLoading || isButtonDisabled()
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
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
                      Enviando...
                    </div>
                  ) : (
                    'Enviar código de verificación'
                  )}
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
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isButtonDisabled()}
                  className={`w-full py-2.5 px-4 rounded-md transition duration-200 mb-6 ${
                    isLoading || isButtonDisabled()
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
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
                      Verificando...
                    </div>
                  ) : (
                    'Verificar código'
                  )}
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
                disabled={isLoading || isButtonDisabled()}
                className={`w-full py-2.5 px-4 rounded-md transition duration-200 mt-8 mb-6 ${
                  isLoading || isButtonDisabled()
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
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
                    Procesando...
                  </div>
                ) : (
                  'Continuar'
                )}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isButtonDisabled()}
                    className={`w-full py-2.5 px-4 rounded-md transition duration-200 mt-8 mb-6 ${
                      isLoading || isButtonDisabled()
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
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
                        Creando cuenta...
                      </div>
                    ) : (
                      'Crear cuenta'
                    )}
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