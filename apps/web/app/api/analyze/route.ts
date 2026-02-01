import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import {
    ApiResponse,
    AnalysisResult,
    Clause,
    ClauseType,
    RiskLevel,
    Jurisdiction,
    Language,
    UploadedFile,
    MAX_FILE_SIZE,
    SUPPORTED_FILE_TYPES
} from '@clauseflag/shared';
import { parseDocument } from '@/lib/parsers/documentParser';
import { splitIntoClauses } from '@/lib/parsers/clauseSplitter';

// Initialize Supabase admin client (bypass RLS for server operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

type ContractStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW };
    }

    if (userLimit.count >= RATE_LIMIT_REQUESTS) {
        return { allowed: false, remaining: 0, resetAt: userLimit.resetAt };
    }

    userLimit.count++;
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - userLimit.count, resetAt: userLimit.resetAt };
}

/**
 * Validate uploaded file
 */
function validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Only PDF and DOCX are supported' };
    }

    return { valid: true };
}

/**
 * Analyze a single clause using OpenAI
 */
async function analyzeClause(
    clause: Clause,
    jurisdiction: Jurisdiction
): Promise<{
    clauseType: ClauseType;
    riskLevel: RiskLevel;
    isRisky: boolean;
    explanation: string;
    whyItMatters: string;
    jurisdictionNote: string;
}> {
    const prompt = `You are a legal expert specializing in contract analysis. Analyze the following contract clause and provide a detailed assessment.

Clause Text:
${clause.text}

Jurisdiction: ${jurisdiction}

Provide your analysis in the following JSON format:
{
  "clauseType": "termination|liability_limitation|indemnity|auto_renewal|payment_penalties|governing_law|ip_ownership|non_compete",
  "riskLevel": "High|Medium|Low",
  "isRisky": true|false,
  "explanation": "Clear explanation of what this clause means in plain language",
  "whyItMatters": "Why this clause matters to the signatory",
  "jurisdictionNote": "Specific notes for ${jurisdiction} jurisdiction if applicable"
}

Respond with ONLY valid JSON.`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.1
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
        throw new Error('Failed to parse OpenAI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
        clauseType: analysis.clauseType as ClauseType,
        riskLevel: analysis.riskLevel as RiskLevel,
        isRisky: analysis.isRisky,
        explanation: analysis.explanation,
        whyItMatters: analysis.whyItMatters || '',
        jurisdictionNote: analysis.jurisdictionNote || ''
    };
}

/**
 * Store contract in Supabase
 */
async function storeContract(
    userId: string,
    file: File,
    fileUrl: string,
    jurisdiction: Jurisdiction,
    language: Language
): Promise<string> {
    const fileType = file.type === 'application/pdf' ? 'pdf' : 'docx';

    const { data, error } = await supabaseAdmin
        .from('contracts')
        .insert({
            user_id: userId,
            file_url: fileUrl,
            original_filename: file.name,
            file_type: fileType,
            file_size: file.size,
            status: 'processing',
            jurisdiction,
            language,
            total_clauses: 0,
            risky_clauses_found: 0,
            high_risk_count: 0,
            medium_risk_count: 0,
            low_risk_count: 0
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error storing contract:', error);
        throw new Error(`Failed to store contract: ${error.message}`);
    }

    return data.id;
}

/**
 * Update contract with analysis results
 */
async function updateContractResults(
    contractId: string,
    clauses: Clause[],
    clauseAnalyses: Awaited<ReturnType<typeof analyzeClause>>[]
): Promise<void> {
    const highRiskCount = clauseAnalyses.filter(a => a.riskLevel === 'High').length;
    const mediumRiskCount = clauseAnalyses.filter(a => a.riskLevel === 'Medium').length;
    const lowRiskCount = clauseAnalyses.filter(a => a.riskLevel === 'Low').length;
    const riskyClausesFound = clauseAnalyses.filter(a => a.isRisky).length;

    const clauseRecords = clauses.map((clause, index) => {
        const analysis = clauseAnalyses[index];
        return {
            contract_id: contractId,
            clause_type: analysis.clauseType,
            risk_level: analysis.riskLevel,
            text: clause.text,
            section_title: clause.sectionTitle,
            clause_number: clause.clauseNumber,
            start_index: clause.startIndex,
            end_index: clause.endIndex,
            explanation_en: analysis.explanation,
            explanation_hi: '',
            why_it_matters_en: analysis.whyItMatters,
            jurisdiction_note_en: analysis.jurisdictionNote,
            is_risky: analysis.isRisky,
            detected_at: new Date().toISOString()
        };
    });

    const { error: clauseError } = await supabaseAdmin.from('clauses').insert(clauseRecords);

    if (clauseError) {
        console.error('Error storing clauses:', clauseError);
        throw new Error(`Failed to store clauses: ${clauseError.message}`);
    }

    const { error: contractError } = await supabaseAdmin
        .from('contracts')
        .update({
            status: 'completed' as ContractStatus,
            total_clauses: clauses.length,
            risky_clauses_found: riskyClausesFound,
            high_risk_count: highRiskCount,
            medium_risk_count: mediumRiskCount,
            low_risk_count: lowRiskCount,
            processing_time_ms: 0,
            completed_at: new Date().toISOString()
        })
        .eq('id', contractId);

    if (contractError) {
        console.error('Error updating contract:', contractError);
        throw new Error(`Failed to update contract: ${contractError.message}`);
    }
}

/**
 * Format analysis result for API response
 */
function formatAnalysisResult(
    contractId: string,
    clauses: Clause[],
    clauseAnalyses: Awaited<ReturnType<typeof analyzeClause>>[],
    language: Language,
    jurisdiction: Jurisdiction,
    processingTime: number
): AnalysisResult {
    const highRiskCount = clauseAnalyses.filter(a => a.riskLevel === 'High').length;
    const mediumRiskCount = clauseAnalyses.filter(a => a.riskLevel === 'Medium').length;
    const lowRiskCount = clauseAnalyses.filter(a => a.riskLevel === 'Low').length;
    const riskyClausesFound = clauseAnalyses.filter(a => a.isRisky).length;

    const analyses = clauses.map((clause, index) => {
        const analysis = clauseAnalyses[index];
        return {
            ...clause,
            clauseId: clause.id,
            isRisky: analysis.isRisky,
            clauseType: analysis.clauseType,
            riskLevel: analysis.riskLevel,
            explanation: analysis.explanation,
            whyItMatters: analysis.whyItMatters,
            jurisdictionNote: analysis.jurisdictionNote
        };
    });

    return {
        id: contractId,
        totalClauses: clauses.length,
        riskyClausesFound,
        highRiskCount,
        mediumRiskCount,
        lowRiskCount,
        analyses,
        processingTime,
        language,
        jurisdiction,
        createdAt: new Date()
    };
}

/**
 * Verify user authentication via Bearer token
 */
async function verifyAuth(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
        return null;
    }

    return user.id;
}

/**
 * POST /api/analyze - Analyze a contract
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let contractId: string | null = null;

    try {
        // Verify authentication
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            }, { status: 401 });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(userId);
        if (!rateLimit.allowed) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetAt).toLocaleTimeString()}`
                }
            }, { 
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                    'X-RateLimit-Reset': rateLimit.resetAt.toString()
                }
            });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const jurisdiction = (formData.get('jurisdiction') as Jurisdiction) || 'US';
        const language = (formData.get('language') as Language) || 'en';

        const validation = validateFile(file);
        if (!validation.valid) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: { code: 'INVALID_FILE', message: validation.error || 'Invalid file' }
            }, { status: 400 });
        }

        const fileExtension = file.name.split('.').pop() || 'pdf';
        const storagePath = `${userId}/${Date.now()}.${fileExtension}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
            .from('contracts')
            .upload(storagePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            console.error('File upload error:', uploadError);
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: { code: 'UPLOAD_FAILED', message: 'Failed to upload file to storage' }
            }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('contracts')
            .getPublicUrl(storagePath);

        contractId = await storeContract(userId, file, publicUrl, jurisdiction, language);

        const fileType = file.type === 'application/pdf' ? 'pdf' : 'docx';
        const uploadedFile: UploadedFile = { name: file.name, size: file.size, type: fileType, url: publicUrl };

        const parsedDocument = await parseDocument(uploadedFile);
        const clauses = await splitIntoClauses(parsedDocument.text, language);

        if (clauses.length === 0) {
            await supabaseAdmin.from('contracts').update({
                status: 'failed' as ContractStatus,
                error_message: 'No clauses could be extracted from the document'
            }).eq('id', contractId);

            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: { code: 'NO_CLAUSES_FOUND', message: 'Could not extract any clauses from the document' }
            }, { status: 400 });
        }

        const clauseAnalyses = await Promise.all(
            clauses.map(clause => 
                analyzeClause(clause, jurisdiction).catch(error => {
                    console.error(`Error analyzing clause ${clause.id}:`, error);
                    return {
                        clauseType: 'termination' as ClauseType,
                        riskLevel: 'Medium' as RiskLevel,
                        isRisky: true,
                        explanation: 'Could not analyze this clause',
                        whyItMatters: 'Manual review recommended',
                        jurisdictionNote: ''
                    };
                })
            )
        );

        await updateContractResults(contractId, clauses, clauseAnalyses);

        const processingTime = Date.now() - startTime;
        const result = formatAnalysisResult(contractId, clauses, clauseAnalyses, language, jurisdiction, processingTime);

        return NextResponse.json<ApiResponse<AnalysisResult>>({
            success: true,
            data: result
        }, { headers: { 'X-RateLimit-Remaining': rateLimit.remaining.toString() } });

    } catch (error) {
        console.error('Analysis error:', error);

        if (contractId) {
            try {
                await supabaseAdmin.from('contracts').update({
                    status: 'failed' as ContractStatus,
                    error_message: error instanceof Error ? error.message : 'Unknown error'
                }).eq('id', contractId);
            } catch (updateError) {
                console.error('Failed to update contract status:', updateError);
            }
        }

        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: 'ANALYSIS_FAILED', message: error instanceof Error ? error.message : 'Failed to analyze contract' }
        }, { status: 500 });
    }
}

/**
 * GET /api/analyze - Get analysis status
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: 'MISSING_PARAMETER', message: 'contractId is required' }
        }, { status: 400 });
    }

    try {
        // Verify authentication
        const userId = await verifyAuth(request);
        
        if (!userId) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
            }, { status: 401 });
        }

        const { data: contract, error: contractError } = await supabaseAdmin
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .eq('user_id', userId)
            .single();

        if (contractError || !contract) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Contract not found' }
            }, { status: 404 });
        }

        if (contract.status === 'completed') {
            const { data: clauses } = await supabaseAdmin
                .from('clauses')
                .select('*')
                .eq('contract_id', contractId);

            if (clauses) {
                return NextResponse.json<ApiResponse<AnalysisResult>>({
                    success: true,
                    data: {
                        id: contract.id,
                        totalClauses: contract.total_clauses,
                        riskyClausesFound: contract.risky_clauses_found,
                        highRiskCount: contract.high_risk_count,
                        mediumRiskCount: contract.medium_risk_count,
                        lowRiskCount: contract.low_risk_count,
                        analyses: clauses.map((clause: any) => ({
                            id: clause.id,
                            clauseId: clause.id,
                            text: clause.text,
                            language: contract.language as Language,
                            isRisky: clause.is_risky,
                            clauseType: clause.clause_type as ClauseType,
                            riskLevel: clause.risk_level as RiskLevel,
                            explanation: clause.explanation_en,
                            whyItMatters: clause.why_it_matters_en,
                            jurisdictionNote: clause.jurisdiction_note_en
                        })),
                        processingTime: contract.processing_time_ms || 0,
                        language: contract.language as Language,
                        jurisdiction: contract.jurisdiction as Jurisdiction,
                        createdAt: new Date(contract.created_at)
                    }
                });
            }
        }

        return NextResponse.json<ApiResponse<{ contract: typeof contract }>>({
            success: true,
            data: { contract } as any
        });

    } catch (error) {
        console.error('Get analysis error:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: 'FETCH_FAILED', message: error instanceof Error ? error.message : 'Failed to fetch analysis' }
        }, { status: 500 });
    }
}
