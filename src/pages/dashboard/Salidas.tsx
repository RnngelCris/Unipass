import React, { useState, useEffect } from 'react';
import { DoorClosed, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardProps } from '../../types/dashboard';
import { getStatsSalidas, getSalidasAlumnos } from '../../services/SalidasService';
import { useAuth } from '../../context/AuthContext';
import { getTutorInfo, TutorInfo } from '../../services/AlumnoService';
import { useLocation } from 'react-router-dom';

type EstadoSalida = 'pendiente' | 'aprobada' | 'rechazada';

interface SalidaItem {
  estudiante: string;
  matricula: string;
  tipo: string;
  salida: string;
  retorno: string;
  estado: EstadoSalida;
}

const Salidas: React.FC<DashboardProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [tutorInfo, setTutorInfo] = useState<{ [matricula: string]: TutorInfo | null }>({});
  const { userData } = useAuth();
  const location = useLocation();

  // Estado para las tarjetas de estadísticas
  const [stats, setStats] = useState([
    { label: 'Salidas Pendientes', value: 0 },
    { label: 'Salidas Aprobadas', value: 0 },
    { label: 'Salidas Rechazadas', value: 0 },
    { label: 'Totales', value: 0 }
  ]);

  const [salidas, setSalidas] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const data = userData?.Data || userData?.data;
  const empleado = data?.employee?.[0];
  const esCoordinacion = empleado?.ID_DEPARATAMENTO === 351;

  useEffect(() => {
    const matricula = empleado?.MATRICULA;
    if (!matricula) return;
    getStatsSalidas(String(matricula)).then((statsData) => {
      setStats([
        { label: 'Salidas Pendientes', value: statsData.Pendientes || 0 },
        { label: 'Salidas Aprobadas', value: statsData.Aprobadas || 0 },
        { label: 'Salidas Rechazadas', value: statsData.Rechazadas || 0 },
        { label: 'Totales', value: statsData.Total || 0 }
      ]);
    });
    getSalidasAlumnos(String(matricula)).then(setSalidas);
  }, [userData]);

  useEffect(() => {
    if (location.state && location.state.status) {
      setSelectedStatus(location.state.status);
    }
  }, [location.state]);

  const getStatusStyle = (status: EstadoSalida) => {
    const styles: Record<EstadoSalida, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      aprobada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rechazada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return styles[status];
  };

  const getStatusText = (status: EstadoSalida) => {
    const texts: Record<EstadoSalida, string> = {
      pendiente: 'Pendiente',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada'
    };
    return texts[status];
  };

  const filteredSalidas = salidas.filter(salida => {
    const nombreCompleto = `${salida.Nombre} ${salida.Apellidos}`.toLowerCase();
    const matchesSearch = nombreCompleto.includes(searchQuery.toLowerCase()) ||
                          (salida.Matricula && salida.Matricula.includes(searchQuery));
    const matchesDate = !selectedDate || (salida.FechaSalida && salida.FechaSalida.includes(selectedDate));
    const matchesStatus = selectedStatus === 'todos' || salida.StatusPermission?.toLowerCase() === selectedStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  // Calcular los elementos a mostrar según la página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSalidas = filteredSalidas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSalidas.length / itemsPerPage);

  // Cambiar de página
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Resetear a la página 1 si cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDate, selectedStatus]);

  const handleRowClick = async (index: number, matricula: string) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    if (!tutorInfo[matricula]) {
      const info = await getTutorInfo(matricula);
      setTutorInfo(prev => ({ ...prev, [matricula]: info }));
    }
  };

  const getBasePath = () => {
    if (esCoordinacion) {
      return '/dashboard';
    }
    if (empleado && empleado.SEXO && empleado.DEPARTAMENTO) {
      const sexo = empleado.SEXO.toLowerCase();
      const departamento = empleado.DEPARTAMENTO.toUpperCase();
      const nivel = departamento === 'H.V.N.U' ? 'universitario' : 'nivel-medio';
      return `/dashboard/${nivel}-${sexo}`;
    }
    return '/dashboard';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <DoorClosed className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Control de Salidas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona y monitorea las solicitudes de salida de los estudiantes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
            <span className="text-3xl font-bold mt-2 block text-gray-900 dark:text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o matrícula..."
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <select
                className="pl-4 pr-8 py-2 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Retorno
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentSalidas.map((salida, index) => (
                    <React.Fragment key={index}>
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-150"
                        onClick={() => handleRowClick(index, salida.Matricula)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            {expandedIndex === index ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                            <span>{salida.Nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {salida.Matricula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {salida.Descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(salida.FechaSalida).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(salida.FechaRegreso).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(salida.StatusPermission?.toLowerCase())}`}>
                            {getStatusText(salida.StatusPermission?.toLowerCase())}
                          </span>
                        </td>
                      </tr>
                      {expandedIndex === index && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">Detalles de la Salida</h4>
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Motivo:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{salida.Motivo || 'No especificado'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Observaciones:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{salida.Observaciones || 'No hay observaciones'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fecha solicitada:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {salida.FechaSolicitada ? new Date(salida.FechaSolicitada).toLocaleString() : 'No disponible'}
                                    </span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de salida:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {salida.FechaSalida ? new Date(salida.FechaSalida).toLocaleString() : 'No disponible'}
                                    </span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de regreso:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {salida.FechaRegreso ? new Date(salida.FechaRegreso).toLocaleString() : 'No disponible'}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">Datos del Estudiante</h4>
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Nombre completo:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{salida.Nombre} {salida.Apellidos}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Correo:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{salida.Correo || 'No disponible'}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Celular:</span>{' '}
                                    <span className="text-gray-600 dark:text-gray-400">{salida.Celular || 'No disponible'}</span>
                                  </p>
                                </div>
                                {tutorInfo[salida.Matricula] && (
                                  <div className="space-y-2 mt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">Información del Tutor</h4>
                                    <div className="space-y-1">
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Nombre:</span>{' '}
                                        <span className="text-gray-600 dark:text-gray-400">
                                          {tutorInfo[salida.Matricula]?.nombre} {tutorInfo[salida.Matricula]?.apellidos}
                                        </span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Teléfono:</span>{' '}
                                        <span className="text-gray-600 dark:text-gray-400">{tutorInfo[salida.Matricula]?.telefono}</span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Móvil:</span>{' '}
                                        <span className="text-gray-600 dark:text-gray-400">{tutorInfo[salida.Matricula]?.movil}</span>
                                      </p>
                                      <p className="text-sm">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{' '}
                                        <span className="text-gray-600 dark:text-gray-400">{tutorInfo[salida.Matricula]?.email}</span>
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          Mostrando {filteredSalidas.length === 0 ? 0 : indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredSalidas.length)} de {filteredSalidas.length} resultados
        </span>
        <div className="flex items-center space-x-2">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700'}`}>Anterior</button>
          {(() => {
            const pages = [];
            if (currentPage > 1) pages.push(currentPage - 1);
            pages.push(currentPage);
            if (currentPage < totalPages) pages.push(currentPage + 1);
            return pages.map(page => (
              <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1 rounded ${currentPage === page ? 'bg-gray-900 dark:bg-gray-200 text-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700'}`}>{page}</button>
            ));
          })()}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700'}`}>Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default Salidas;