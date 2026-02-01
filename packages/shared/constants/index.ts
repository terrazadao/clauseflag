export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const SUPPORTED_LANGUAGES = ['en', 'hi'] as const;
export const SUPPORTED_JURISDICTIONS = ['US', 'EU', 'UAE', 'IN'] as const;
export const MAX_CLAUSES_PER_DOCUMENT = 100;
export const MIN_CLAUSE_LENGTH = 20;
export const MAX_CLAUSE_LENGTH = 500;
export const ANALYSIS_TIMEOUT = 60000; // 60 seconds
