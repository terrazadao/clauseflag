// Brand colors from colors.css
export const Colors = {
  navy: '#1E3A8A',
  red: '#EF4444',
  orange: '#F97316',
  gray: '#64748B',
  light: '#F8FAFC',
  dark: '#0F172A',
  white: '#FFFFFF',
  black: '#000000',
};

// Risk levels
export const RiskLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const RiskColors = {
  [RiskLevels.LOW]: '#22C55E',
  [RiskLevels.MEDIUM]: '#F97316',
  [RiskLevels.HIGH]: '#EF4444',
};

// Jurisdictions
export const Jurisdictions = {
  US: 'us',
  EU: 'eu',
  UAE: 'uae',
} as const;

// Clause types
export const ClauseTypes = {
  TERMINATION: 'termination',
  LIABILITY: 'liability',
  INDEMNITY: 'indemnity',
  AUTO_RENEWAL: 'auto_renewal',
  PAYMENT_PENALTIES: 'payment_penalties',
  GOVERNING_LAW: 'governing_law',
  INTELLECTUAL_PROPERTY: 'intellectual_property',
  NON_COMPETE: 'non_compete',
} as const;

// API endpoints
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// File limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Pricing
export const PRICE_PER_CONTRACT = 10; // $10
