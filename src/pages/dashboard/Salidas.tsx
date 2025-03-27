import React, { useState } from 'react';
import { DoorClosed, Search, Calendar } from 'lucide-react';

interface SalidaItem {
  estudiante: string;
  matricula: string;
  tipo: string;
  salida: string;
  retorno: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

const Salidas = () => {
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const texts = {
      pendiente: 'Pendiente',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada'
    };
    return texts[status] || status;
  };

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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">ESTUDIANTE</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">MATRÍCULA</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">TIPO</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">SALIDA</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">RETORNO</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">ESTADO</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {salidas.map((salida, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-4">{salida.estudiante}</td>
                  <td className="p-4 text-gray-600">{salida.matricula}</td>
                  <td className="p-4">{salida.tipo}</td>
                  <td className="p-4 text-gray-600">{salida.salida}</td>
                  <td className="p-4 text-gray-600">{salida.retorno}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(salida.estado)}`}>
                      {getStatusText(salida.estado)}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Mostrando 1 a 10 de 20 resultados</span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50 text-gray-600">
                Anterior
              </button>
              <div className="flex items-center space-x-1">
                <button className="px-3 py-1 bg-gray-800 text-white rounded">1</button>
                <button className="px-3 py-1 hover:bg-gray-50 rounded">2</button>
                <button className="px-3 py-1 hover:bg-gray-50 rounded">3</button>
              </div>
              <button className="px-3 py-1 border rounded hover:bg-gray-50 text-gray-600">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Salidas;