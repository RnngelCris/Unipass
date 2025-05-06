import axios from 'axios';
import { API_URL } from '../config/constants';

export interface DocumentoEstudiante {
  id: number;
  IdDoctos?: number;
  IdDocumento?: number;
  Archivo: string;
  StatusDoctos?: string;
  IdLogin?: number;
  StatusRevision: string;
  TipoDocumento: string;
  Estado: string;
  FechaSubida: string;
}

export interface DocumentoParaEliminar {
  IdLogin: number;
  IdDocumento: number;
}

export interface Expediente {
  Nombre: string;
  Apellidos: string;
  Nivel: string;
  Dormitorio?: number;
  Matricula?: string;
  Carrera?: string;
  Semestre?: string;
  Status?: 'activo' | 'inactivo';
}

export class DocumentService {
  static async getExpedientesPorDormitorio(dormitorioId: number): Promise<Expediente[]> {
    try {
      const response = await axios.get(`${API_URL}/getExpediente/${dormitorioId}`);
      const expedientes = response.data;
      
      // Obtener el nivel educativo para cada expediente
      const expedientesConNivel = await Promise.all(
        expedientes.map(async (expediente: Expediente) => {
          try {
            const nivelResponse = await axios.get(
              `${API_URL}/getNivelEducativo/${expediente.Matricula}`
            );
            return {
              ...expediente,
              Nivel: nivelResponse.data.nivel || 'Universidad' // Default a Universidad si no hay respuesta
            };
          } catch (error) {
            console.error('Error al obtener nivel educativo:', error);
            return {
              ...expediente,
              Nivel: 'Universidad' // Default a Universidad en caso de error
            };
          }
        })
      );
      
      return expedientesConNivel;
    } catch (error) {
      console.error('Error en getExpedientesPorDormitorio:', error);
      throw error;
    }
  }

  static async getArchivosAlumno(
    dormitorio: number,
    nombre: string,
    apellidos: string
  ): Promise<DocumentoEstudiante[]> {
    try {
      const response = await axios.get(
        `${API_URL}/getArchivos/${dormitorio}/${encodeURIComponent(nombre)}/${encodeURIComponent(apellidos)}`
      );
      console.log('Respuesta del servidor (getArchivosAlumno):', response.data);
      
      // Normalizar los datos y guardar todos los campos relevantes
      return response.data.map((doc: any) => ({
        id: doc.IdDoctos || doc.id, // Asegurarnos de obtener el ID correcto
        IdDoctos: doc.IdDoctos,
        IdDocumento: doc.IdDocumento,
        Archivo: doc.Archivo,
        StatusDoctos: doc.StatusDoctos,
        IdLogin: doc.IdLogin,
        StatusRevision: (doc.StatusRevision || 'pendiente').toLowerCase(),
        TipoDocumento: doc.TipoDocumento,
        Estado: doc.Estado?.toLowerCase() || 'pendiente',
        FechaSubida: doc.FechaSubida,
        // Otros campos si los hay
      }));
    } catch (error) {
      console.error('Error al obtener documentos del estudiante:', error);
      throw error;
    }
  }

  static async getDocumentosPorTipoPreceptor(tipoPreceptor: string): Promise<number[]> {
    try {
      const response = await axios.get(`${API_URL}/documentos-preceptor/${tipoPreceptor}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de documentos:', error);
      return [1, 5, 6, 7, 8]; // Fallback a documentos por defecto
    }
  }

  static async aprobarDocumento(documento: DocumentoEstudiante): Promise<void> {
    try {
      const idLogin = documento.IdLogin;
      if (!idLogin) throw new Error('No se encontró el IdLogin del estudiante en el documento');
      await axios.put(
        `https://unipass.isdapps.uk/statusRevision/${idLogin}`,
        { IdDocumento: documento.IdDocumento },
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error al aprobar documento:', error);
      throw error;
    }
  }

  static async eliminarDocumento(documento: DocumentoParaEliminar): Promise<void> {
    try {
      const idLogin = documento.IdLogin;
      if (!idLogin) throw new Error('No se encontró el IdLogin del estudiante en el documento');
      await axios.delete(
        `https://unipass.isdapps.uk/doctosMul/${idLogin}`, 
        { data: { IdDocumento: documento.IdDocumento },
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  /*static async eliminarDocumento(idLogin: number, idDocumento: number): Promise<void> {
    try {
      const url = `https://unipass.isdapps.uk/doctosMul/${idLogin}`;
      const data = { IdDocumento: idDocumento };
      
      console.log('=== INICIO DE ELIMINACIÓN DE DOCUMENTO ===');
      console.log('URL:', url);
      console.log('Datos a enviar:', data);

      // Configuración de axios
      const config = {
        method: 'delete',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: data
      };

      console.log('Configuración de la petición:', config);

      // Realizar la petición
      const response = await axios(config);

      console.log('=== RESPUESTA DEL SERVIDOR ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);

      if (response.status !== 200) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      if (response.data.message !== 'DATO ELIMINADO') {
        throw new Error('Error inesperado al eliminar el documento');
      }

      console.log('=== DOCUMENTO ELIMINADO EXITOSAMENTE ===');
      return response.data;
    } catch (error) {
      console.error('=== ERROR EN LA ELIMINACIÓN ===');
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data,
            headers: error.config?.headers
          }
        });
      } else {
        console.error('Error no relacionado con axios:', error);
      }
      throw new Error('No se pudo eliminar el documento');
    }
  }*/

}

export default DocumentService; 