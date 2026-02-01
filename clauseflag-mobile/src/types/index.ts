export type Jurisdiction = 'us' | 'eu' | 'uae';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ClauseType = 
  | 'termination'
  | 'liability'
  | 'indemnity'
  | 'auto_renewal'
  | 'payment_penalties'
  | 'governing_law'
  | 'intellectual_property'
  | 'non_compete';

export interface Clause {
  id: string;
  type: ClauseType;
  riskLevel: RiskLevel;
  text: string;
  explanation: string;
  whyMatters: string;
  startIndex?: number;
  endIndex?: number;
}

export interface AnalysisResult {
  id: string;
  contractId: string;
  jurisdiction: Jurisdiction;
  clauses: Clause[];
  summary: {
    totalClauses: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface Contract {
  id: string;
  filename: string;
  fileSize: number;
  fileType: string;
  jurisdiction: Jurisdiction;
  extractedText?: string;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error';
  createdAt: string;
  userEmail?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Jurisdiction: undefined;
  Upload: { jurisdiction: Jurisdiction };
  Payment: { contractId: string; amount: number };
  Loading: { contractId: string };
  Results: { analysisId: string };
  Email: { analysisId: string };
};
