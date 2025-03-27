import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-600">{message}</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ErrorMessage;