import axios from 'axios';

export interface TutorInfo {
  nombre: string;
  apellidos: string;
  telefono: string;
  movil: string;
  email: string;
}

export async function getTutorInfo(matricula: string): Promise<TutorInfo | null> {
  try {
    const response = await axios.get(`https://ulvdb.isdapps.uk/api/datos/${matricula}`);
    const tutor = response.data?.Data?.Tutor?.[0];
    if (!tutor) return null;
    return {
      nombre: tutor.NOMBRE_TUTOR?.trim() || '',
      apellidos: tutor.APELLIDOS_TUTOR?.trim() || '',
      telefono: tutor.TELETONO_TUTOR || '',
      movil: tutor.MOVIL_TUTOR || '',
      email: tutor.EMAIL_TUTOR || '',
    };
  } catch (error) {
    console.error('Error al obtener información del tutor:', error);
    return null;
  }
} 