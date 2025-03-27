export interface Student {
  MATRICULA: string;
  NOMBRE: string;
  APELLIDOS: string;
  RESIDENCIA: string;
  FECHA_NACIMIENTO: string;
  SEXO: string;
  EDAD: number;
  TEL_FIJO: string;
  CELULAR: string;
  CORREO_PERSONAL: string;
  CORREO_INSTITUCIONAL: string;
  PAIS: string;
  ESTADO: string;
  CIUDAD: string;
  DIRECCION: string;
  CP: string;
  CURP: string;
  NIVEL_EDUCATIVO: string;
  CAMPO: string;
  LeNombreEscuelaOficial: string;
  CURSO_ESCOLAR: string;
}

export interface Tutor {
  NOMBRE_TUTOR: string;
  APELLIDOS_TUTOR: string;
  TELETONO_TUTOR: string;
  DIRECCION_TUTOR: string;
  PAIS_TUTOR: string;
  ESTADO_TUTOR: string;
  CIUDAD_TUTOR: string;
  CP_TUTOR: string;
  MOVIL_TUTOR: string;
  EMAIL_TUTOR: string;
}

export interface Work {
  'ID DEPTO': number;
  'DEPARTAMENTO': string;
  'ID JEFE': number;
  'JEFE DEPARTAMENTO': string;
}

export interface UserData {
  student: Student[];
  type: string;
  Tutor: Tutor[];
  work: Work[];
}