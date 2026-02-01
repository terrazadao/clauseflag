export type Language = 'en' | 'hi';

export type Jurisdiction = 'US' | 'EU' | 'UAE' | 'IN';

export const CLAUSE_TYPES = {
    TERMINATION: 'termination',
    LIABILITY_LIMITATION: 'liability_limitation',
    INDEMNITY: 'indemnity',
    AUTO_RENEWAL: 'auto_renewal',
    PAYMENT_PENALTIES: 'payment_penalties',
    GOVERNING_LAW: 'governing_law',
    IP_OWNERSHIP: 'ip_ownership',
    NON_COMPETE: 'non_compete'
} as const;

export type ClauseType = typeof CLAUSE_TYPES[keyof typeof CLAUSE_TYPES];

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ContractStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

// ============================================
// Database Entity Types
// ============================================

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    preferred_language: Language;
    created_at: Date;
    updated_at: Date;
}

export interface Contract {
    id: string;
    user_id: string;
    file_url: string;
    original_filename: string;
    file_type: 'pdf' | 'docx';
    file_size: number;
    status: ContractStatus;
    jurisdiction: Jurisdiction;
    language: Language;
    total_clauses: number;
    risky_clauses_found: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
    processing_time_ms?: number;
    error_message?: string;
    created_at: Date;
    completed_at?: Date;
}

export interface Clause {
    id: string;
    contract_id: string;
    clause_type: ClauseType;
    risk_level?: RiskLevel;
    text: string;
    section_title?: string;
    clause_number?: string;
    start_index?: number;
    end_index?: number;
    explanation_en?: string;
    explanation_hi?: string;
    why_it_matters_en?: string;
    why_it_matters_hi?: string;
    jurisdiction_note_en?: string;
    jurisdiction_note_hi?: string;
    is_risky: boolean;
    detected_at: Date;
}

export interface AnalysisCredits {
    id: string;
    user_id: string;
    credits_remaining: number;
    total_purchased: number;
    last_purchase_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface PaymentHistory {
    id: string;
    user_id: string;
    credits_granted: number;
    stripe_payment_intent_id: string;
    stripe_customer_id?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    error_message?: string;
    created_at: Date;
    completed_at?: Date;
}

// ============================================
// API/UI Types
// ============================================

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

// ============================================
// Database Query Types (for Supabase)
// ============================================

export interface ContractsFilters {
    status?: ContractStatus;
    jurisdiction?: Jurisdiction;
    language?: Language;
    startDate?: Date;
    endDate?: Date;
}

export interface ClausesFilters {
    clause_type?: ClauseType;
    risk_level?: RiskLevel;
    is_risky?: boolean;
}

export interface PaymentFilters {
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// Credit System Types
// ============================================

export interface CreditTransaction {
    user_id: string;
    credits_change: number;
    reason: 'purchase' | 'analysis' | 'refund' | 'bonus';
    contract_id?: string;
    payment_id?: string;
}

// ============================================
// Analysis Request/Response Types
// ============================================

export interface AnalyzeContractRequest {
    contract_id: string;
    language: Language;
    jurisdiction: Jurisdiction;
}

export interface AnalyzeContractResponse {
    contract: Contract;
    clauses: Clause[];
    summary: {
        totalClauses: number;
        riskyClausesFound: number;
        highRiskCount: number;
        mediumRiskCount: number;
        lowRiskCount: number;
    };
}

export interface CreatePaymentIntentRequest {
    credits_to_purchase: number;
    currency?: string;
}

export interface CreatePaymentIntentResponse {
    client_secret: string;
    payment_intent_id: string;
    amount: number;
    currency: string;
}

// ============================================
// Webhook Types (Stripe)
// ============================================

export interface StripeWebhookEvent {
    type: string;
    data: {
        object: {
            id: string;
            metadata: Record<string, string>;
            [key: string]: any;
        };
    };
}
