import React, { useState } from 'react';
import { DoorClosed, Search, Calendar } from 'lucide-react';
import { DashboardProps } from '../../types/dashboard';

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

  const stats = [
    { label: 'Salidas Pendientes', value: 5, change: '+2', color: 'text-yellow-600' },
    { label: 'Salidas Aprobadas', value: 12, change: '+8', color: 'text-green-600' },
    { label: 'Salidas Rechazadas', value: 3, change: '-1', color: 'text-red-600' },
    { label: 'Total del Mes', value: 20, change: '+15%', color: 'text-blue-600' }
  ];

  const salidas: SalidaItem[] = [
    {
      estudiante: 'Juan Pérez',
      matricula: '2024001',
      tipo: 'Salida a casa',
      salida: '2024-03-15 15:30',
      retorno: '2024-03-17 18:00',
      estado: 'pendiente'
    },
    {
      estudiante: 'María González',
      matricula: '2024002',
      tipo: 'Salida al pueblo',
      salida: '2024-03-16 10:00',
      retorno: '2024-03-16 14:00',
      estado: 'aprobada'
    }
  ];

  const getStatusStyle = (status: EstadoSalida) => {
    const styles: Record<EstadoSalida, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800'
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
    const matchesSearch = salida.estudiante.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         salida.matricula.includes(searchQuery);
    const matchesDate = !selectedDate || salida.salida.includes(selectedDate);
    const matchesStatus = selectedStatus === 'todos' || salida.estado === selectedStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <DoorClosed className="h-6 w-6 text-gray-800" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Control de Salidas</h1>
          <p className="text-gray-600">Gestiona y monitorea las solicitudes de salida de los estudiantes</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-4 border">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                <span className={`text-sm ${stat.color}`}>{stat.change}</span>
              </div>
              <span className="text-2xl font-semibold mt-2">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o matrícula..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <select
                className="pl-4 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent appearance-none bg-white"
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matrícula
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salida
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retorno
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSalidas.map((salida, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {salida.estudiante}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salida.matricula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salida.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salida.salida}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {salida.retorno}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(salida.estado)}`}>
                          {getStatusText(salida.estado)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salidas;