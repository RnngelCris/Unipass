import React, { useState, useEffect } from 'react';
import { Bell, Eye, PenSquare, Trash2, Users, Calendar, AlertCircle, Check, MessageCircle, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardProps } from '../../types/dashboard';

interface Aviso {
  id: number;
  titulo: string;
  contenido: string;
  prioridad: 'Normal' | 'High' | 'Urgent';
  destinatarios: string;
  fechaExpiracion: string;
  fechaPublicacion: string;
  autor: string;
}

type PrioridadAviso = 'Normal' | 'High' | 'Urgent';

const Avisos: React.FC<DashboardProps> = () => {
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [avisos, setAvisos] = useState<Aviso[]>([
    {
      id: 1,
      titulo: 'Nueva regla de salidas a casa',
      contenido: 'Se ha actualizado el reglamento de salidas a casa. Todos los estudiantes deben registrar su salida con al menos 24 horas de anticipación. Es importante seguir el nuevo protocolo para garantizar la seguridad y organización adecuada.',
      prioridad: 'High',
      destinatarios: 'Todos los dormitorios',
      fechaExpiracion: '2024-05-20',
      fechaPublicacion: '20 Mayo, 2024',
      autor: 'Preceptor'
    },
    {
      id: 2,
      titulo: 'Requisito para prácticas',
      contenido: 'Todos los estudiantes deben presentar su documentación actualizada antes del inicio de las prácticas profesionales. Los documentos requeridos incluyen certificado médico y seguro de gastos médicos vigente.',
      prioridad: 'Urgent',
      destinatarios: 'Hombres',
      fechaExpiracion: '2024-05-18',
      fechaPublicacion: '18 Mayo, 2024',
      autor: 'Coordinador'
    }
  ]);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    prioridad: 'Normal' as PrioridadAviso,
    destinatarios: 'Todos los dormitorios',
    fechaExpiracion: ''
  });

  const cardsPerPage = 3;
  const totalPages = Math.ceil(avisos.length / cardsPerPage);

  useEffect(() => {
    const timer = setInterval(() => {
      if (avisos.length > cardsPerPage) {
        handleNextPage();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentPage, avisos.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAviso: Aviso = {
      id: avisos.length + 1,
      ...formData,
      fechaPublicacion: new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      autor: 'Preceptor'
    };

    setAvisos([newAviso, ...avisos]);
    setFormData({
      titulo: '',
      contenido: '',
      prioridad: 'Normal',
      destinatarios: 'Todos los dormitorios',
      fechaExpiracion: ''
    });
  };

  const getPrioridadStyle = (prioridad: PrioridadAviso) => {
    const styles: Record<PrioridadAviso, string> = {
      High: 'bg-yellow-100 text-yellow-800',
      Urgent: 'bg-red-100 text-red-800',
      Normal: 'bg-blue-100 text-blue-800'
    };
    return styles[prioridad];
  };

  const handleEdit = (aviso: Aviso) => {
    setFormData({
      titulo: aviso.titulo,
      contenido: aviso.contenido,
      prioridad: aviso.prioridad,
      destinatarios: aviso.destinatarios,
      fechaExpiracion: aviso.fechaExpiracion
    });
  };

  const handleDelete = (aviso: Aviso) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este aviso?')) {
      setAvisos(avisos.filter(a => a.id !== aviso.id));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(avisos.length / cardsPerPage) - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPage(0);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const renderAvisos = () => {
    const startIndex = currentPage * cardsPerPage;
    const visibleAvisos = avisos.slice(startIndex, startIndex + cardsPerPage);

    return (
      <div 
        className={`grid grid-cols-3 gap-6 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {visibleAvisos.map((aviso) => (
          <div 
            key={aviso.id}
            className="bg-white rounded-xl overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl h-[280px] flex flex-col border border-gray-100"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPrioridadStyle(aviso.prioridad)}`}>
                  {aviso.prioridad === 'Urgent' && <AlertCircle size={16} className="inline mr-1" />}
                  {aviso.prioridad === 'High' && <AlertCircle size={16} className="inline mr-1" />}
                  {aviso.prioridad === 'Normal' && <Check size={16} className="inline mr-1" />}
                  {aviso.prioridad}
                </span>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEdit(aviso)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit size={18} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(aviso)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Trash2 size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 text-gray-900">{aviso.titulo}</h3>
              <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">{aviso.contenido}</p>

              <div className="mt-auto">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {aviso.fechaPublicacion}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {aviso.destinatarios}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Por: {aviso.autor}</span>
                  <button 
                    onClick={() => setSelectedAviso(aviso)}
                    className="flex items-center space-x-1 text-[#06426a] hover:text-[#06426a]/80 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Ver más</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-yellow-400 rounded-lg p-3">
          <Bell className="h-6 w-6 text-gray-800" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Avisos</h1>
          <p className="text-gray-600">Administra y comunica información importante a los estudiantes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-yellow-400 rounded-full p-2">
            <Bell className="h-5 w-5 text-gray-800" />
          </div>
          <h2 className="text-xl font-semibold">Crear Nuevo Aviso</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del aviso
            </label>
            <input
              type="text"
              placeholder="Ingresa un título descriptivo"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido del aviso
            </label>
            <textarea
              placeholder="Describe el aviso detalladamente..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as PrioridadAviso })}
              >
                <option value="Normal">Normal</option>
                <option value="High">Alta</option>
                <option value="Urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinatarios
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                value={formData.destinatarios}
                onChange={(e) => setFormData({ ...formData, destinatarios: e.target.value })}
              >
                <option value="Todos los dormitorios">Todos los dormitorios</option>
                <option value="Hombres">Dormitorio de Hombres</option>
                <option value="Mujeres">Dormitorio de Mujeres</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de expiración
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                value={formData.fechaExpiracion}
                onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
          >
            Publicar aviso
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Avisos Publicados
          </h2>
        </div>

        <div className="p-6">
          {renderAvisos()}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {currentPage * cardsPerPage + 1} - {Math.min((currentPage + 1) * cardsPerPage, avisos.length)} de {avisos.length} avisos
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-l-lg border ${
                    currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-2 border-t border-b bg-white">
                  <span className="text-sm font-medium">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`p-2 rounded-r-lg border ${
                    currentPage >= totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Avisos;