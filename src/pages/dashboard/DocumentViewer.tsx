import React, { useState } from 'react';
import { ArrowLeft, Download, AlertCircle } from 'lucide-react';
import { API_URL } from '../../config/constants';

interface DocumentViewerProps {
  url: string;
  onClose: () => void;
  title?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, onClose, title = 'Visualizar Documento' }) => {
  const fullUrl = `${API_URL}${url}`;
  const fileType = url.toLowerCase().split('.').pop() || '';
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    window.open(fullUrl, '_blank');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderContent = () => {
    switch (fileType) {
      case 'pdf':
        return (
          <object
            data={`${fullUrl}#toolbar=0`}
            type="application/pdf"
            className="w-full h-full rounded-lg bg-white"
          >
            <embed
              src={`${fullUrl}#toolbar=0`}
              type="application/pdf"
              className="w-full h-full"
            />
            <p className="text-center mt-4">
              Si no puedes ver el PDF,{' '}
              <button onClick={handleDownload} className="text-blue-600 hover:underline">
                haz clic aquí para abrirlo en una nueva pestaña
              </button>
            </p>
          </object>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        if (imageError) {
          return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  No se puede mostrar la imagen en el visor
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Abrir en nueva pestaña
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <img
              src={fullUrl}
              alt={title}
              className="max-w-full max-h-full object-contain"
              onError={handleImageError}
              crossOrigin="anonymous"
            />
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                No se puede previsualizar este tipo de archivo
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Abrir en nueva pestaña
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full md:w-4/5 md:h-5/6 rounded-lg flex flex-col">
        <div className="bg-[#06426A] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="text-[#FAC600] hover:text-[#FAC600]/80 mr-4"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <button
            onClick={handleDownload}
            className="text-[#FAC600] hover:text-[#FAC600]/80 flex items-center gap-2"
          >
            <Download size={20} />
            <span>Abrir</span>
          </button>
        </div>
        
        <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer; 