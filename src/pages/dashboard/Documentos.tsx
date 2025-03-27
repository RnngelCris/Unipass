import React, { useState, useRef } from 'react';
import { 
  Upload, Search, Filter, Eye, Download, Trash2, FileText,
  Check, X, MoreVertical, ScrollText, Home, Stethoscope, DoorOpen,
  AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  User, GraduationCap, MapPin
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  fileName: string;
  type: 'pdf';
  size: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  author: string;
  studentId: string;
  icon: keyof typeof documentIcons;
  rejectionReason?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

const documentIcons = {
  reglamento: <ScrollText size={32} className="text-blue-600" />,
  dormitorio: <Home size={32} className="text-green-600" />,
  antidoping: <Stethoscope size={32} className="text-red-600" />,
  salida: <DoorOpen size={32} className="text-yellow-600" />
};

const Documentos = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Reglamento ULV',
      fileName: 'Reglamento_ULV_2024.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2024-03-15 14:30',
      status: 'approved',
      description: 'Reglamento general de la Universidad Linda Vista',
      author: 'Juan Pérez',
      studentId: '2024001',
      icon: 'reglamento',
      downloadUrl: '/documents/reglamento.pdf',
      previewUrl: '/previews/reglamento.pdf'
    },
    {
      id: '2',
      name: 'Reglamento del Dormitorio',
      fileName: 'Reglamento_Dormitorio_2024.pdf',
      type: 'pdf',
      size: '1.8 MB',
      uploadDate: '2024-03-14 09:15',
      status: 'approved',
      description: 'Normativas y políticas del dormitorio estudiantil',
      author: 'María López',
      studentId: '2024002',
      icon: 'dormitorio',
      downloadUrl: '/documents/dormitorio.pdf',
      previewUrl: '/previews/dormitorio.pdf'
    },
    {
      id: '3',
      name: 'Antidoping',
      fileName: 'Antidoping_2024.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadDate: '2024-03-13 11:30',
      status: 'pending',
      description: 'Formato de consentimiento para prueba antidoping',
      author: 'Pedro Ramírez',
      studentId: '2024003',
      icon: 'antidoping',
      downloadUrl: '/documents/antidoping.pdf',
      previewUrl: '/previews/antidoping.pdf'
    },
    {
      id: '4',
      name: 'Acuerdo de Salida',
      fileName: 'Acuerdo_Salida_2024.pdf',
      type: 'pdf',
      size: '1.5 MB',
      uploadDate: '2024-03-12 15:45',
      status: 'pending',
      description: 'Acuerdo y condiciones para salidas del campus',
      author: 'Ana García',
      studentId: '2024004',
      icon: 'salida',
      downloadUrl: '/documents/salida.pdf',
      previewUrl: '/previews/salida.pdf'
    }
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [previewScale, setPreviewScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const totalPages = 3;

  const menuRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: 'Documentos Pendientes', value: 8, change: '+2' },
    { label: 'Documentos Aprobados', value: 45, change: '+5' },
    { label: 'Total de Documentos', value: 53, change: '+7' },
    { label: 'Tasa de Aprobación', value: '85%', change: '+3%' }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const icons = {
      pending: <AlertCircle size={16} className="mr-1" />,
      approved: <Check size={16} className="mr-1" />,
      rejected: <X size={16} className="mr-1" />
    };
    return (
      <span className={`flex items-center px-2 py-1 rounded-full text-xs ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const newDoc: Document = {
      id: (documents.length + 1).toString(),
      name: files[0].name.split('.')[0],
      fileName: files[0].name,
      type: 'pdf',
      size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      author: 'Usuario Actual',
      studentId: '2024003',
      icon: 'reglamento'
    };
    setDocuments([...documents, newDoc]);
    setShowUploadModal(false);
  };

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.downloadUrl || '#';
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (doc: Document) => {
    if (doc.previewUrl) {
      window.open(doc.previewUrl, '_blank');
    } else {
      setSelectedDocument(doc);
      setShowPreviewModal(true);
    }
  };

  const handleApprove = (doc: Document) => {
    if (window.confirm('¿Estás seguro de que deseas aprobar este documento?')) {
      setDocuments(documents.map(d => 
        d.id === doc.id ? { ...d, status: 'approved' } : d
      ));
      setShowActionsMenu(null);
    }
  };

  const handleReject = (doc: Document) => {
    if (!rejectionReason.trim()) {
      alert('Por favor, ingrese un motivo de rechazo');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas rechazar este documento?')) {
      setDocuments(documents.map(d => 
        d.id === doc.id ? { ...d, status: 'rejected', rejectionReason } : d
      ));
      setShowRejectModal(false);
      setShowActionsMenu(null);
      setRejectionReason('');
    }
  };

  const handleDelete = (docId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
      setDocuments(documents.filter(doc => doc.id !== docId));
      setShowActionsMenu(null);
    }
  };

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const closeAllModals = () => {
    setShowActionsMenu(null);
    setShowRejectModal(false);
    setShowPreviewModal(false);
    setShowUploadModal(false);
  };

  const filteredDocuments = documents.filter(doc => {
    if (selectedFilter !== 'all' && doc.status !== selectedFilter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const renderActionsMenu = (doc: Document) => (
    <div 
      className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border py-1 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          handlePreview(doc);
          setShowActionsMenu(null);
        }}
        className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50"
      >
        <Eye className="h-4 w-4 mr-2 text-gray-600" />
        <span>Ver documento</span>
      </button>
      
      <button
        onClick={() => {
          handleDownload(doc);
          setShowActionsMenu(null);
        }}
        className="w-full px-4 py-2 text-left flex items-center hover:bg-gray-50"
      >
        <Download className="h-4 w-4 mr-2 text-gray-600" />
        <span>Descargar</span>
      </button>

      {doc.status === 'pending' && (
        <>
          <button
            onClick={() => {
              handleApprove(doc);
              setShowActionsMenu(null);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-green-50 text-green-600"
          >
            <Check className="h-4 w-4 mr-2" />
            <span>Aprobar documento</span>
          </button>

          <button
            onClick={() => {
              setSelectedDocument(doc);
              setShowRejectModal(true);
              setShowActionsMenu(null);
            }}
            className="w-full px-4 py-2 text-left flex items-center hover:bg-red-50 text-red-600"
          >
            <X className="h-4 w-4 mr-2" />
            <span>Rechazar documento</span>
          </button>
        </>
      )}

      <button
        onClick={() => {
          handleDelete(doc.id);
          setShowActionsMenu(null);
        }}
        className="w-full px-4 py-2 text-left flex items-center hover:bg-red-50 text-red-600"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        <span>Eliminar documento</span>
      </button>
    </div>
  );

  const renderDocumentCard = (doc: Document) => (
    <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {documentIcons[doc.icon]}
          </div>
          <div>
            <h3 className="font-medium">{doc.name}</h3>
            <p className="text-sm text-gray-500">{doc.fileName}</p>
          </div>
          {getStatusBadge(doc.status)}
        </div>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowActionsMenu(showActionsMenu === doc.id ? null : doc.id);
            }}
            className="p-2 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {showActionsMenu === doc.id && renderActionsMenu(doc)}
        </div>
      </div>
      <div className="mt-2 flex items-center text-sm text-gray-500">
        <span>{doc.author} • {doc.studentId}</span>
        <span className="mx-2">•</span>
        <span>{doc.uploadDate}</span>
        <span className="mx-2">•</span>
        <span>{doc.size}</span>
      </div>
      {doc.description && (
        <p className="mt-2 text-sm text-gray-600">
          {doc.description}
        </p>
      )}
      {doc.status === 'rejected' && doc.rejectionReason && (
        <p className="mt-2 text-sm text-red-600">
          Motivo de rechazo: {doc.rejectionReason}
        </p>
      )}
    </div>
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {selectedStudent && (
        <>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-yellow-400 rounded-full p-2">
              <User className="h-6 w-6 text-gray-800" />
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="flex items-center text-gray-600">
                <GraduationCap className="h-4 w-4 mr-1" />
                {selectedStudent.id}
              </span>
              <span className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {selectedStudent.dormitory}
              </span>
            </div>
          </div>
        </>
      )}

      {!selectedStudent && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Documentos Estudiantiles</h1>
              <p className="text-gray-600">Gestión y seguimiento de documentación requerida</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-[#003B5C] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#002B44] transition-colors"
            >
              <Upload size={20} />
              <span>Subir Documento</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-green-600 text-sm">{stat.change}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-4 mb-4">
                <button 
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 ${selectedFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setSelectedFilter('pending')}
                  className={`px-4 py-2 ${selectedFilter === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setSelectedFilter('approved')}
                  className={`px-4 py-2 ${selectedFilter === 'approved' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  Aprobados
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o matrícula..."
                    className="pl-10 w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <Filter size={16} />
                  <span>Filtros</span>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {filteredDocuments.map(renderDocumentCard)}
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Subir Documento</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                accept=".pdf"
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={40} className="text-gray-400 mb-2" />
                <p className="text-gray-600">Arrastra y suelta archivos aquí o</p>
                <p className="text-blue-600 font-medium">selecciona un archivo</p>
                <p className="text-sm text-gray-500 mt-2">Solo archivos PDF</p>
              </label>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {documentIcons[selectedDocument.icon]}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-600">{selectedDocument.fileName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div 
                  style={{ 
                    transform: `scale(${previewScale})`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                  className="bg-white shadow-lg rounded-lg w-[800px] h-[1000px] flex items-center justify-center"
                >
                  <p className="text-gray-500">Vista previa del documento - Página {currentPage}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      disabled={previewScale <= 0.5}
                    >
                      <ZoomOut size={20} />
                    </button>
                    <span className="text-sm text-gray-600">
                      {Math.round(previewScale * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      disabled={previewScale >= 2}
                    >
                      <ZoomIn size={20} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePrevPage}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(selectedDocument)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Download size={20} className="mr-2" />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rechazar Documento</h3>
            <p className="text-gray-600 mb-4">
              Por favor, indique el motivo por el cual se rechaza el documento "{selectedDocument.name}"
            </p>
            <textarea
              className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Ingrese el motivo del rechazo..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedDocument)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentos;