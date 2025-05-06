export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface Document {
  id: string;
  name: string;
  fileName: string;
  type: 'pdf';
  size: string;
  uploadDate: string;
  status: DocumentStatus;
  description?: string;
  author: string;
  studentId: string;
  icon: 'reglamento' | 'dormitorio' | 'antidoping' | 'salida';
  rejectionReason?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface DocumentoAPI {
  id: string;
  TipoDocumento: string;
  Archivo: string;
  status: DocumentStatus;
  fileName?: string;
  description?: string;
  uploadDate?: string;
  fileSize?: string;
}

export const mapDocumentoAPIToDocument = (doc: DocumentoAPI): Document => ({
  id: doc.id,
  name: doc.TipoDocumento,
  fileName: doc.fileName || doc.TipoDocumento,
  type: 'pdf',
  size: doc.fileSize || '0 KB',
  uploadDate: doc.uploadDate || new Date().toISOString(),
  status: doc.status,
  description: doc.description,
  author: 'Sistema',
  studentId: '',
  icon: mapTipoToIcon(doc.TipoDocumento),
  downloadUrl: doc.Archivo,
  previewUrl: doc.Archivo
});

function mapTipoToIcon(tipo: string): Document['icon'] {
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('reglamento')) return 'reglamento';
  if (tipoLower.includes('dormitorio')) return 'dormitorio';
  if (tipoLower.includes('antidoping')) return 'antidoping';
  if (tipoLower.includes('salida')) return 'salida';
  return 'reglamento';
} 