import { UserData } from '../types/user';

export class UserService {
  private API_URL = 'https://ulvdb.isdapps.uk/api';
  private UNIPASS_URL = 'https://unipass.isdapps.uk';

  async getDatosUser(matricula: string): Promise<UserData> {
    try {
      const response = await fetch(`${this.API_URL}/datos/${matricula}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Matrícula no encontrada');
        }
        
        const text = await response.text();
        let errorMessage = 'Error al obtener datos del usuario';
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parsing response:', text);
        throw new Error('Error al procesar la respuesta del servidor');
      }
      
      if (!data.Data) {
        throw new Error('Formato de respuesta inválido');
      }

      return data.Data;
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }

  private async getPreceptor(dormitorioId: number): Promise<number | null> {
    try {
      const response = await fetch(`${this.API_URL}/preceptor/${dormitorioId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.matricula || null;
    } catch {
      return null;
    }
  }

  private async getJefeVigilancia(matricula: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/jefe-vigilancia/${matricula}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.isJefeVigilancia || false;
    } catch {
      return false;
    }
  }

  private async obtenerDormitorio(nivelAcademico: string, sexo: string): Promise<number> {
    // Lógica para determinar el dormitorio basado en nivel académico y sexo
    if (nivelAcademico === 'UNIVERSITARIO') {
      return sexo === 'M' ? 1 : 2; // 1 para hombres, 2 para mujeres
    } else {
      return sexo === 'M' ? 3 : 4; // 3 para hombres, 4 para mujeres de otros niveles
    }
  }

  async registerUser(userData: {
    Matricula: string;
    Contraseña: string;
    Correo: string;
    Nombre: string;
    Apellidos: string;
    TipoUser: string;
    Sexo: string;
    FechaNacimiento: string;
    Celular: string;
    StatusActividad: number;
    Dormitorio: number;
  }): Promise<void> {
    try {
      // Determinar el tipo de usuario y dormitorio
      const dormitorios = [315, 316, 317, 318];
      let tipoUsuario = userData.TipoUser;
      let dormitorio = userData.Dormitorio;

      // Verificar si es preceptor
      for (const dormitorioId of dormitorios) {
        const preceptorMatricula = await this.getPreceptor(dormitorioId);
        if (preceptorMatricula === parseInt(userData.Matricula)) {
          tipoUsuario = 'PRECEPTOR';
          dormitorio = dormitorioId - 314; // Convertir 315-318 a 1-4
          break;
        }
      }

      // Verificar si es jefe de vigilancia
      const isJefeVigilancia = await this.getJefeVigilancia(userData.Matricula);
      if (isJefeVigilancia) {
        tipoUsuario = 'VIGILANCIA';
        dormitorio = 5; // Dormitorio especial para vigilancia
      }

      // Si es alumno, determinar dormitorio basado en nivel académico y sexo
      if (tipoUsuario === 'ALUMNO') {
        dormitorio = await this.obtenerDormitorio(userData.TipoUser, userData.Sexo);
      } else if (tipoUsuario === 'EMPLEADO' || tipoUsuario === 'VIGILANCIA') {
        dormitorio = 5;
      }

      const registerData = {
        Matricula: userData.Matricula,
        Contraseña: userData.Contraseña,
        Correo: userData.Correo,
        Nombre: userData.Nombre,
        Apellidos: userData.Apellidos,
        TipoUser: tipoUsuario,
        Sexo: userData.Sexo,
        FechaNacimiento: userData.FechaNacimiento,
        Celular: userData.Celular,
        StatusActividad: 1,
        Dormitorio: dormitorio
      };

      const response = await fetch(`${this.UNIPASS_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Error al registrar usuario';
        
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      throw error;
    }
  }
}

export default new UserService();