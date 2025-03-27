export class OtpService {
  private API_URL = 'https://api-otp.app.syswork.online/api/v1';
  private token: string | null = null;

  private async login(): Promise<string> {
    try {
      const response = await fetch(`${this.API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'irving.patricio@ulv.edu.mx',
          password: 'irya0904'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al autenticar con el servicio OTP');
      }

      const data = await response.json();
      return data.token;
    } catch (error: any) {
      console.error('Error en login:', error);
      throw new Error('Error al conectar con el servicio OTP');
    }
  }

  private async getToken(): Promise<string> {
    if (!this.token) {
      this.token = await this.login();
    }
    return this.token;
  }

  async sendOTP(email: string): Promise<void> {
    if (!email) {
      throw new Error('El correo electrónico es requerido');
    }

    try {
      const token = await this.getToken();

      const response = await fetch(`${this.API_URL}/otp_app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'x-access-token': token
        },
        body: JSON.stringify({
          email: email,
          subject: "Verificacion de Email",
          message: "Verifica tu email con el código de abajo",
          duration: 1
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Error al enviar OTP';
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data._id) {
        throw new Error('Error al generar el código de verificación');
      }
    } catch (error: any) {
      console.error('Error en sendOTP:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  async verifyOTP(otp: string, email: string): Promise<boolean> {
    if (!otp || !email) {
      throw new Error('El código OTP y el correo electrónico son requeridos');
    }

    try {
      const response = await fetch(`${this.API_URL}/email_verification/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          otp
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Error al verificar OTP';
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.verified === true;
    } catch (error: any) {
      console.error('Error en verifyOTP:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    if (!email) {
      throw new Error('El correo electrónico es requerido');
    }

    try {
      const token = await this.getToken();

      const response = await fetch(`${this.API_URL}/forgot_password_app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'x-access-token': token,
          'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Error al enviar OTP de recuperación';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error en forgotOTP:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    if (!email || !otp || !newPassword) {
      throw new Error('Correo, OTP y nueva contraseña son requeridos');
    }

    try {
      const token = await this.getToken();

      const response = await fetch(`${this.API_URL}/forgot_password_app/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'x-access-token': token,
          'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Error al restablecer contraseña';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return true;
    } catch (error: any) {
      console.error('Error en resetPassword:', error);
      if (error.message === 'Failed to fetch') {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }
}

export default new OtpService();