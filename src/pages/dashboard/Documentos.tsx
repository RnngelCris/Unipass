import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, Eye, Download, FileText, Check, X, 
  ScrollText, FileCheck, FilePlus, FileWarning, User,
  GraduationCap, MapPin, AlertCircle, ChevronDown,
  Users, Clock, Calendar, ExternalLink
} from 'lucide-react';
import DocumentService, { Expediente, DocumentoEstudiante, DocumentoParaEliminar } from '../../services/DocumentService';
import DocumentViewer from './DocumentViewer';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const documentIcons = {
  'Reglamento HVU': <ScrollText className="h-6 w-6 text-blue-600" />,
  'Convenio de salidas': <FileCheck className="h-6 w-6 text-green-600" />,
  'Imagen Perfil': <User className="h-6 w-6 text-purple-600" />,
  'INE Tutor': <GraduationCap className="h-6 w-6 text-orange-600" />,
  'Justificante': <FileWarning className="h-6 w-6 text-red-600" />
};

const Documentos = () => {
  const { userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Expediente | null>(null);
  const [studentDocuments, setStudentDocuments] = useState<DocumentoEstudiante[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [filteredExpedientes, setFilteredExpedientes] = useState<Expediente[]>([]);
  const [dormitorioId, setDormitorioId] = useState<number | null>(null);
  const [expedientesConDocumentos, setExpedientesConDocumentos] = useState<Map<string, DocumentoEstudiante[]>>(new Map());
  const [selectedDocument, setSelectedDocument] = useState<DocumentoEstudiante | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState([
    { label: 'Documentos Pendientes', value: 0 },
    { label: 'Documentos Aprobados', value: 0 },
    { label: 'Total de Documentos', value: 0 },
    { label: 'Tasa de Aprobación', value: '0' }
  ]);

  const data = userData?.Data || userData?.data;
  const empleado = data?.employee?.[0];
  const esCoordinacion = empleado?.ID_DEPARATAMENTO === 351;

  // Obtener estadísticas globales del preceptor al cargar la página
  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const data = userData?.Data || userData?.data;
        const matriculaPreceptor = data?.employee?.[0]?.MATRICULA;
        if (!matriculaPreceptor) return;
        const response = await axios.get(`https://unipass.isdapps.uk/dashboardDocumentos/${matriculaPreceptor}`);
        const statsData = Array.isArray(response.data) ? response.data[0] : response.data;
        const total = statsData.Total || 0;
        const aprobados = statsData.Aprobado || 0;
        const pendientes = statsData.Pendiente || 0;
        const tasa = total > 0 ? Math.round((aprobados / total) * 100) : 0;
        setStats([
          { label: 'Documentos Pendientes', value: pendientes },
          { label: 'Documentos Aprobados', value: aprobados },
          { label: 'Total de Documentos', value: total },
          { label: 'Tasa de Aprobación', value: tasa > 0 ? `${tasa}%` : '0' }
        ]);
      } catch (error) {
        console.error('Error al obtener estadísticas globales:', error);
      }
    };
    fetchGlobalStats();
  }, [userData]);

  const fetchStats = async (matricula: string) => {
    try {
      const response = await axios.get(`https://unipass.isdapps.uk/dashboardPermission/${matricula}`);
      const data = response.data;
      setStats([
        { label: 'Documentos Pendientes', value: data.Pendientes },
        { label: 'Documentos Aprobados', value: data.Aprobadas },
        { label: 'Total de Documentos', value: data.Total },
        { label: 'Tasa de Aprobación', value: data.Total > 0 ? `${Math.round((data.Aprobadas / data.Total) * 100)}%` : '0%' }
      ]);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (esCoordinacion) {
          // Obtener todos los expedientes globales
          const expedientesData = await DocumentService.getExpedientesGlobal();
          setExpedientes(expedientesData);
          // Obtener documentos para cada expediente usando matrícula, nombre y apellidos
          const documentosMap = new Map<string, DocumentoEstudiante[]>();
          for (const expediente of expedientesData) {
            const docs = await DocumentService.getArchivosAlumno(
              5, // 5 es el id global para coordinación
              expediente.Nombre,
              expediente.Apellidos,
              esCoordinacion ? expediente.Matricula : undefined
            );
            documentosMap.set(`${expediente.Nombre}-${expediente.Apellidos}`, docs);
          }
          setExpedientesConDocumentos(documentosMap);
          filterExpedientes('', 'all', expedientesData, documentosMap);
        } else {
          // Lógica actual por dormitorio
          const dormitorioId = localStorage.getItem('idDormitorio');
          if (!dormitorioId) {
            console.error('No se encontró el ID del dormitorio');
            return;
          }
          setDormitorioId(Number(dormitorioId));
          const expedientesData = await DocumentService.getExpedientesPorDormitorio(Number(dormitorioId));
          setExpedientes(expedientesData);
          // Obtener documentos para cada expediente
          const documentosMap = new Map<string, DocumentoEstudiante[]>();
          for (const expediente of expedientesData) {
            const docs = await DocumentService.getArchivosAlumno(
              Number(dormitorioId),
              expediente.Nombre,
              expediente.Apellidos,
              esCoordinacion ? expediente.Matricula : undefined
            );
            documentosMap.set(`${expediente.Nombre}-${expediente.Apellidos}`, docs);
          }
          setExpedientesConDocumentos(documentosMap);
          filterExpedientes('', 'all', expedientesData, documentosMap);
        }
      } catch (error) {
        console.error('Error al inicializar datos:', error);
      }
    };
    fetchData();
  }, [userData, esCoordinacion]);

  const getExpedienteStatus = (documentos: DocumentoEstudiante[]) => {
    if (!documentos || documentos.length === 0) return 'pendiente';
    return documentos.some(doc => doc.StatusRevision.toLowerCase() === 'pendiente') ? 'pendiente' : 'aprobado';
  };

  const filterExpedientes = (
    query: string,
    status: string = selectedStatus,
    expedientesList = expedientes,
    docsMap = expedientesConDocumentos
  ) => {
    let filtered = expedientesList;

    // Filtrar por estado si no es 'all'
    if (status !== 'all') {
      filtered = filtered.filter(expediente => {
        const docs = docsMap.get(`${expediente.Nombre}-${expediente.Apellidos}`);
        const estadoEstudiante = calcularEstadoEstudiante(docs);
        return estadoEstudiante === status;
      });
    }

    // Filtrar por búsqueda si hay query
    if (query.trim()) {
      filtered = filtered.filter(expediente => {
        const nombreCompleto = `${expediente.Nombre} ${expediente.Apellidos}`.toLowerCase();
        const matricula = expediente.Matricula?.toLowerCase() || '';
        return (
          nombreCompleto.includes(query.toLowerCase()) ||
          matricula.includes(query.toLowerCase())
        );
      });
    }

    setFilteredExpedientes(filtered);
  };

  useEffect(() => {
    filterExpedientes(searchQuery, selectedStatus);
  }, [searchQuery, selectedStatus, expedientes, expedientesConDocumentos]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    filterExpedientes(searchQuery, status);
  };

  const handleStudentSelect = async (expediente: Expediente) => {
    const id = esCoordinacion ? 5 : dormitorioId;
    if (!id) return;

    setIsLoading(true);
    setSearchError(null);
    if (esCoordinacion) setDormitorioId(5); // Asegura que el estado tenga el id correcto para coordinación
    try {
      const documents = await DocumentService.getArchivosAlumno(
        Number(id),
        expediente.Nombre,
        expediente.Apellidos,
        esCoordinacion ? expediente.Matricula : undefined
      );
      
      if (documents && documents.length > 0) {
        setStudentDocuments(documents);
        setSelectedStudent(expediente);
      } else {
        setSearchError('No se encontraron documentos para este estudiante');
      }
    } catch (error) {
      console.error('Error al buscar estudiante:', error);
      setSearchError('Error al buscar estudiante. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentClick = (doc: DocumentoEstudiante) => {
    if (doc.Archivo.toLowerCase().endsWith('.pdf') || 
        doc.Archivo.toLowerCase().endsWith('.jpg') || 
        doc.Archivo.toLowerCase().endsWith('.jpeg') || 
        doc.Archivo.toLowerCase().endsWith('.png')) {
      setSelectedDocument(doc);
    } else {
      downloadDocument(doc);
    }
  };

  const downloadDocument = (doc: DocumentoEstudiante) => {
    const link = document.createElement('a');
    link.href = `${API_URL}${doc.Archivo}`;
    link.target = '_blank';
    link.download = `${doc.TipoDocumento}${doc.Archivo.substring(doc.Archivo.lastIndexOf('.'))}`;
    document.body.appendChild(link);
    console.log('URL solicitada:', `${API_URL}${doc.Archivo}`);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyles = (estado?: string) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado.toLowerCase()) {
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'aprobado_con_pendientes':
        return 'bg-blue-100 text-blue-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (estado?: string) => {
    if (!estado) return 'Sin estado';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  };

  // Función para determinar si mostrar estudiantes según el departamento del preceptor
  const shouldShowStudent = (studentNivel: string) => {
    const data = userData?.Data || userData?.data;
    if (!data?.employee?.[0]?.DEPARTAMENTO) {
      return true; // Temporalmente mostramos todos si no hay departamento
    }
    
    const preceptorDept = data.employee[0].DEPARTAMENTO.toUpperCase();
    
    // Mapeo de departamentos a niveles educativos
    if (preceptorDept === 'H.V.N.U') {
      return studentNivel === 'Universidad';
    }
    if (preceptorDept === 'COLIVI') {
      return studentNivel === 'Preparatoria';
    }
    
    return false;
  };

  const filteredStudents = expedientes.filter(student => {
    const fullName = `${student.Nombre} ${student.Apellidos}`.toLowerCase();
    const matricula = student.Matricula?.toLowerCase() || '';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || matricula.includes(searchLower);
    const matchesNivel = shouldShowStudent(student.Nivel || 'Universidad');
    
    return matchesSearch && matchesNivel;
  });

  const handleAprobarDocumento = async (doc: DocumentoEstudiante) => {
    try {
      setIsProcessing(true);
      await DocumentService.aprobarDocumento(doc);
      
      // Actualizar la lista de documentos
      if (selectedStudent && dormitorioId) {
        const updatedDocs = await DocumentService.getArchivosAlumno(
          Number(dormitorioId),
          selectedStudent.Nombre,
          selectedStudent.Apellidos,
          esCoordinacion ? selectedStudent.Matricula : undefined
        );
        setStudentDocuments(updatedDocs);
        
        // Actualizar el mapa de documentos
        const newMap = new Map(expedientesConDocumentos);
        const key = `${selectedStudent.Nombre}-${selectedStudent.Apellidos}`;
        newMap.set(key, updatedDocs);
        setExpedientesConDocumentos(newMap);
      }
      
      alert('Documento aprobado exitosamente');
    } catch (error) {
      console.error('Error detallado al aprobar documento:', error);
      alert('Error al aprobar el documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  const calcularEstadoEstudiante = (documentos: DocumentoEstudiante[] | undefined): 'aprobado' | 'aprobado_con_pendientes' | 'pendiente' | 'rechazado' => {
    if (!documentos || documentos.length === 0) return 'pendiente';
    const docsClave = ['Convenio de salidas', 'Reglamento HVU', 'INE Tutor'];
    let aprobados = 0;
    let totalClave = 0;
    docsClave.forEach(tipo => {
      const doc = documentos.find(d => d.TipoDocumento === tipo);
      if (doc) {
        totalClave++;
        if (doc.StatusRevision === 'aprobado') aprobados++;
      }
    });
    if (aprobados === 3) return 'aprobado';
    if (aprobados > 0) return 'aprobado_con_pendientes';
    return 'pendiente';
  };

  const handleEliminarDocumento = async (doc: DocumentoEstudiante) => {
    if (!doc.IdLogin || !doc.IdDocumento) {
      console.error('Faltan datos necesarios:', { IdLogin: doc.IdLogin, IdDocumento: doc.IdDocumento });
      alert('Error: No se puede eliminar el documento porque faltan datos necesarios');
      return;
    }

    if (!confirm('¿Está seguro de eliminar este documento?')) {
      return;
    }

    try {
      setIsProcessing(true);
      setActiveDocumentId(null); // Cerrar el menú desplegable

      const documentoParaEliminar: DocumentoParaEliminar = {
        IdLogin: doc.IdLogin,
        IdDocumento: doc.IdDocumento
      };

      await DocumentService.eliminarDocumento(documentoParaEliminar);

      // Actualizar la lista de documentos
      if (selectedStudent && dormitorioId) {
        const updatedDocs = await DocumentService.getArchivosAlumno(
          Number(dormitorioId),
          selectedStudent.Nombre,
          selectedStudent.Apellidos,
          esCoordinacion ? selectedStudent.Matricula : undefined
        );
        setStudentDocuments(updatedDocs);
        
        // Actualizar el mapa de documentos
        const newMap = new Map(expedientesConDocumentos);
        const key = `${selectedStudent.Nombre}-${selectedStudent.Apellidos}`;
        newMap.set(key, updatedDocs);
        setExpedientesConDocumentos(newMap);
      }
    } catch (error) {
      console.error('Error detallado:', error);
      alert('Error al eliminar el documento: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="bg-yellow-400 rounded-lg p-3">
          <FileText className="h-6 w-6 text-gray-800" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestión de Documentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Administra y supervisa los documentos requeridos de los estudiantes</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas generales debajo del título */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col items-start border border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 text-lg mb-2">{stat.label}</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
                <button 
                onClick={() => handleStatusChange('all')}
                className={`px-4 py-2 rounded-lg ${
                  selectedStatus === 'all' 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
                    : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Todos
                </button>
                <button 
                onClick={() => handleStatusChange('pendiente')}
                className={`px-4 py-2 rounded-lg ${
                  selectedStatus === 'pendiente' 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
                    : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Pendientes
                </button>
                <button 
                onClick={() => handleStatusChange('aprobado_con_pendientes')}
                className={`px-4 py-2 rounded-lg ${
                  selectedStatus === 'aprobado_con_pendientes' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Aprobados con pendientes
                </button>
                <button 
                onClick={() => handleStatusChange('aprobado')}
                className={`px-4 py-2 rounded-lg ${
                  selectedStatus === 'aprobado' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Aprobados
                </button>
              </div>
          </div>

          <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar estudiante por nombre o matrícula..."
                    className="pl-10 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {!selectedStudent && !isLoading && (
            <div className="mt-4">
              {filteredExpedientes.map((student) => {
                const documents = expedientesConDocumentos.get(`${student.Nombre}-${student.Apellidos}`);
                const status = calcularEstadoEstudiante(documents);
                
                return (
                  <button
                    key={`${student.Nombre}-${student.Apellidos}`}
                    onClick={() => handleStudentSelect(student)}
                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-yellow-400 rounded-full p-2">
                          <User className="h-5 w-5 text-gray-800" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {`${student.Nombre} ${student.Apellidos}`}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Matrícula: {student.Matricula || 'No disponible'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        status === 'aprobado' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : status === 'aprobado_con_pendientes'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : status === 'pendiente'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {status === 'aprobado_con_pendientes' ? 'Aprobado con pendientes' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {searchError && (
            <div className="text-center py-12">
              <p className="text-red-500">{searchError}</p>
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
              <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentDocuments([]);
                    setSearchQuery('');
                    setSearchError(null);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Volver
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-400 rounded-full p-2">
                    <User className="h-6 w-6 text-gray-800" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{`${selectedStudent.Nombre} ${selectedStudent.Apellidos}`}</h2>
                    <p className="text-sm text-gray-500">Matrícula: {selectedStudent.Matricula || 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtrar documentos según el estado seleccionado */}
            {(() => {
              let documentosFiltrados = studentDocuments;
              if (selectedStatus !== 'all') {
                documentosFiltrados = studentDocuments.filter(doc => doc.StatusRevision.toLowerCase() === selectedStatus);
              }
              if (documentosFiltrados.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentosFiltrados.map((doc) => (
                      <div 
                        key={`${doc.id}-${doc.TipoDocumento}`}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              {documentIcons[doc.TipoDocumento as keyof typeof documentIcons] || 
                               <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{doc.TipoDocumento}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(doc.FechaSubida).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doc.StatusRevision === 'aprobado'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : doc.StatusRevision === 'pendiente'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {doc.StatusRevision.charAt(0).toUpperCase() + doc.StatusRevision.slice(1)}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-end space-x-2">
                          {(() => {
                            const esPendiente = doc.StatusRevision?.toLowerCase() === 'pendiente';
                            
                            return esPendiente ? (
                              <>
                                {doc.id ? (
                                  <div className="relative">
                                    <button
                                      onClick={() => setActiveDocumentId(activeDocumentId === doc.id ? null : doc.id)}
                                      className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-200 hover:text-gray-700 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                      <span>Acciones</span>
                                      <ChevronDown size={16} />
                                    </button>
                                    
                                    {activeDocumentId === doc.id && (
                                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAprobarDocumento(doc);
                                            setActiveDocumentId(null);
                                          }}
                                          disabled={isProcessing}
                                          className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 w-full"
                                        >
                                          <Check size={16} />
                                          <span>Aprobar</span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Botón de eliminar clickeado');
                                            handleEliminarDocumento(doc);
                                          }}
                                          disabled={isProcessing}
                                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 w-full"
                                        >
                                          <X size={16} />
                                          <span>{isProcessing ? 'Eliminando...' : 'Eliminar'}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    Error: ID de documento no disponible
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {doc.StatusRevision === 'aprobado' ? 'Documento aprobado' : 'Documento rechazado'}
                              </span>
                            );
                          })()}
                          <button
                            onClick={() => handleDocumentClick(doc)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                            <span>Previsualizar</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Download size={16} />
                            <span>Descargar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } else {
                return (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <FileWarning className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No hay documentos</h3>
                    <p className="text-gray-500 mt-1">Este estudiante aún no tiene documentos cargados</p>
                  </div>
                );
              }
            })()}
          </div>
        )}
        </div>

      {selectedDocument && (
        <DocumentViewer
          url={selectedDocument.Archivo}
          title={selectedDocument.TipoDocumento}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default Documentos;