import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import UniversityLogo from '../components/UniversityLogo';
import otpService from '../services/OtpService';
import authService from '../services/AuthService';

const RecoverPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    matricula: '',
    email: '',
    verificationCode: ['', '', '', ''],
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const resetVerificationCode = () => {
    setFormData(prev => ({
      ...prev,
      verificationCode: ['', '', '', '']
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      switch (step) {
        case 1:
          const userData = await authService.getInfoMatricula(formData.matricula);
          if (!userData) {
            setError('Usuario no encontrado');
            return;
          }

          const email = userData.Correo;
          await otpService.forgotPassword(email);
          setFormData({ ...formData, email });
          setStep(2);
          break;

        case 2:
          const otpCode = formData.verificationCode.join('');
          if (otpCode.length !== 4) {
            setError('Por favor ingresa el código completo');
            return;
          }
          try {
            const isValidOtp = await otpService.verifyOTP(otpCode, formData.email);
            if (isValidOtp) {
              setStep(3);
            } else {
              setError('Código de verificación incorrecto');
              resetVerificationCode();
            }
          } catch (error: any) {
            setError('Código de verificación incorrecto');
            resetVerificationCode();
          }
          break;

        case 3:
          if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
          }

          if (formData.newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
          }

          const otpCodeFinal = formData.verificationCode.join('');
          
          try {
            const isPasswordUpdated = await authService.updatePassword(
              formData.email,
              formData.newPassword
            );

            if (isPasswordUpdated) {
              alert('Contraseña actualizada exitosamente');
              navigate('/');
            } else {
              setError('No se pudo actualizar la contraseña');
              setStep(2);
              resetVerificationCode();
            }
          } catch (error: any) {
            setError('Error al actualizar la contraseña. Por favor, verifica el código e intenta nuevamente.');
            setStep(2);
            resetVerificationCode();
          }
          break;
      }
    } catch (error: any) {
      setError(error.message || 'Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
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

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      await otpService.forgotPassword(formData.email);
      resetVerificationCode();
      setError('Se ha enviado un nuevo código a tu correo');
    } catch (error: any) {
      setError('Error al reenviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = () => {
    switch (step) {
      case 1:
        return !formData.matricula;
      case 2:
        return formData.verificationCode.some(code => !code);
      case 3:
        return !formData.newPassword || !formData.confirmPassword || formData.newPassword.length < 8;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const errorMessage = error && (
      <div className="text-red-500 text-sm text-center mb-4">
        {error}
      </div>
    );

    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-[#06426a] mb-2">UniPass</h2>
            <h3 className="text-lg mb-2">Recuperar Contraseña</h3>
            <p className="text-sm text-center text-gray-600 mb-8">
              Ingresa tu matrícula institucional para recuperar tu contraseña
            </p>

            {errorMessage}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrícula institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ejemplo: 221208"
                    className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-[#06426a] focus:border-transparent"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    disabled={isLoading}
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
                  'Continuar'
                )}
              </button>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-[#06426a] mb-2">Verificación</h2>
            <p className="text-sm text-center text-gray-600 mb-8">
              Ingresa el código de verificación enviado a {formData.email}
            </p>

            {errorMessage}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-8">
                <div className="flex justify-center space-x-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      className="w-14 h-14 text-center text-2xl font-semibold border rounded-lg focus:ring-2 focus:ring-[#06426a] focus:border-transparent"
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
                className={`w-full py-2.5 px-4 rounded-md transition duration-200 mb-4 ${
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

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full text-[#06426a] text-sm hover:underline mb-4"
              >
                ¿No recibiste el código? Enviar nuevo código
              </button>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-[#06426a] mb-2">Nueva contraseña</h2>
            <p className="text-sm text-center text-gray-600 mb-8">
              Establece tu nueva contraseña
            </p>

            {errorMessage}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#06426a] focus:border-transparent"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#06426a] focus:border-transparent"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
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
                    Actualizando...
                  </div>
                ) : (
                  'Actualizar contraseña'
                )}
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-[384px] bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <UniversityLogo />
          {renderStep()}
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

export default RecoverPassword;