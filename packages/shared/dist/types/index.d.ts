export type Language = 'en' | 'hi';
export type Jurisdiction = 'US' | 'EU' | 'UAE' | 'IN';
export declare const CLAUSE_TYPES: {
    readonly TERMINATION: "termination";
    readonly LIABILITY_LIMITATION: "liability_limitation";
    readonly INDEMNITY: "indemnity";
    readonly AUTO_RENEWAL: "auto_renewal";
    readonly PAYMENT_PENALTIES: "payment_penalties";
    readonly GOVERNING_LAW: "governing_law";
    readonly IP_OWNERSHIP: "ip_ownership";
    readonly NON_COMPETE: "non_compete";
};
export type ClauseType = typeof CLAUSE_TYPES[keyof typeof CLAUSE_TYPES];
export type RiskLevel = 'Low' | 'Medium' | 'High';
export interface Clause {
    id: string;
    text: string;
    language: Language;
    sectionTitle?: string;
    clauseNumber?: string;
    startIndex?: number;
    endIndex?: number;
}
export interface ClauseAnalysis {
    clauseId: string;
    isRisky: boolean;
    clauseType?: ClauseType;
    riskLevel?: RiskLevel;
    explanation?: string;
    whyItMatters?: string;
    jurisdictionNote?: string;
}
export interface AnalysisResult {
    id: string;
    totalClauses: number;
    riskyClausesFound: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    analyses: (Clause & ClauseAnalysis)[];
    processingTime: number;
    language: Language;
    jurisdiction: Jurisdiction;
    createdAt: Date;
}
export interface UploadedFile {
    name: string;
    size: number;
    type: 'pdf' | 'docx';
    url?: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
