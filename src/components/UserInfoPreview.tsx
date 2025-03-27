import React from 'react';
import { UserData } from '../types/user';

interface UserInfoPreviewProps {
  userData: UserData;
}

const UserInfoPreview: React.FC<UserInfoPreviewProps> = ({ userData }) => {
  const student = userData.student[0];
  const tutor = userData.Tutor[0];
  const work = userData.work[0];

  const checkEmpty = (value: string | undefined | null) => {
    return value || 'N/A';
  };

  return (
    <div className="w-full space-y-4">
      {/* Información Personal */}
      <div>
        <h3 className="text-sm font-semibold text-[#003B5C] mb-2">
          Información Personal
        </h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Nombre</span>
            <span className="text-xs">{checkEmpty(student.NOMBRE)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Apellidos</span>
            <span className="text-xs">{checkEmpty(student.APELLIDOS)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Tipo de usuario</span>
            <span className="text-xs">{checkEmpty(userData.type)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Correo Institucional</span>
            <span className="text-xs">{checkEmpty(student.CORREO_INSTITUCIONAL)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Celular</span>
            <span className="text-xs">{checkEmpty(student.CELULAR)}</span>
          </div>
          {userData.type === 'ALUMNO' && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Nivel Académico</span>
              <span className="text-xs">{checkEmpty(student.NIVEL_EDUCATIVO)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Información del Tutor (Solo para alumnos) */}
      {userData.type === 'ALUMNO' && tutor && (
        <div>
          <h3 className="text-sm font-semibold text-[#003B5C] mb-2">
            Información del Tutor
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Nombre</span>
              <span className="text-xs">
                {`${checkEmpty(tutor.NOMBRE_TUTOR)} ${checkEmpty(tutor.APELLIDOS_TUTOR)}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Celular</span>
              <span className="text-xs">{checkEmpty(tutor.MOVIL_TUTOR)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Información del Departamento */}
      {work && (
        <div>
          <h3 className="text-sm font-semibold text-[#003B5C] mb-2">
            Información del Departamento
          </h3>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Departamento</span>
              <span className="text-xs">{checkEmpty(work.DEPARTAMENTO)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Jefe de Departamento</span>
              <span className="text-xs">{checkEmpty(work['JEFE DEPARTAMENTO'])}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoPreview;