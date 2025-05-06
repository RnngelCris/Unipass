export const API_URL = 'https://unipass.isdapps.uk';

// Constantes para estados de documentos
export const DOCUMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
} as const;

// Tipos de documentos
export const DOCUMENT_TYPES = {
    IDENTIFICATION: 'identification',
    ACADEMIC_RECORD: 'academic_record',
    PROOF_OF_ADDRESS: 'proof_of_address',
    OTHER: 'other'
} as const; 