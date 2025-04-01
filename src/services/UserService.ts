import { UserData } from '../types/user';

export class UserService {
  private API_URL = 'https://ulvdb.isdapps.uk/api';
  private UNIPASS_URL = 'https://unipass.isdapps.uk';

  async getDatosUser(matricula: string): Promise<UserData> {
    try {
      console.log('Solicitando datos para matrícula:', matricula);
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

  private async obtenerDormitorio(nivelEducativo: string, sexo: string): Promise<number | null> {
    try {
      const sexoNormalizado = sexo.toUpperCase();
      const nivelNormalizado = nivelEducativo === 'UNIVERSITARIO' ? 'UNIVERSITARIO' : 'NIVEL MEDIO';
      const url = `${this.UNIPASS_URL}/dormitorio/${sexoNormalizado}/${nivelNormalizado}`;
      console.log('URL de dormitorio:', url);
      
      const response = await fetch(url);
      console.log('Estado de respuesta para dormitorio:', response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (data && typeof data.IdBedroom === 'number') {
          console.log('Retornando IdBedroom:', data.IdBedroom);
          return data.IdBedroom;
        } else {
          console.error('Formato de respuesta inesperado:', data);
          return null;
        }
      } else {
        console.error('Fallo al obtener el id del dormitorio. Status code:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error en obtenerDormitorio:', error);
      return null;
    }
  }

  async registerUser(userData: {
    Matricula: string;
    Contraseña: string;
    Correo: string;
    Nombre: string;
    Apellidos: string;
    TipoUser: string;
    NivelAcademico: string;
    Sexo: string;
    FechaNacimiento: string;
    Celular: string;
    StatusActividad: number;
    Dormitorio: number;
  }): Promise<void> {
    try {
      let tipoUsuario: string = userData.TipoUser;
      let dormitorio: number;

      // Asignar dormitorio basado en el tipo de usuario
      if (tipoUsuario === 'ALUMNO') {
        // Obtener los datos actualizados del usuario
        const datosUsuario = await this.getDatosUser(userData.Matricula);
        
        console.log('Datos para obtener dormitorio:', {
          nivelEducativo: datosUsuario.student[0].NIVEL_EDUCATIVO,
          sexo: datosUsuario.student[0].SEXO
        });
        
        const dormitorioAsignado = await this.obtenerDormitorio(
          datosUsuario.student[0].NIVEL_EDUCATIVO,
          datosUsuario.student[0].SEXO
        );
        
        console.log('Dormitorio asignado:', dormitorioAsignado);
        
        if (dormitorioAsignado === null) {
          throw new Error('No se pudo obtener el dormitorio del servidor');
        }
        
        dormitorio = dormitorioAsignado;
      } else {
        dormitorio = 5; // Para EMPLEADO o VIGILANCIA
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