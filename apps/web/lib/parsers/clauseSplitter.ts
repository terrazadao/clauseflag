import { v4 as uuidv4 } from 'uuid';
import {
    Language,
    Clause,
    MIN_CLAUSE_LENGTH,
    MAX_CLAUSE_LENGTH,
    MAX_CLAUSES_PER_DOCUMENT
} from '@clauseflag/shared';

// Section headers for different languages
const SECTION_HEADERS = {
    en: [
        'termination',
        'liability',
        'indemnification',
        'indemnity',
        'renewal',
        'payment',
        'intellectual property',
        'ip rights',
        'confidentiality',
        'non-compete',
        'governing law',
        'jurisdiction',
        'warranties',
        'representations',
        'dispute resolution',
        'assignment',
        'force majeure',
        'severability'
    ],
    hi: [
        'समाप्ति',
        'दायित्व',
        'क्षतिपूर्ति',
        'नवीनीकरण',
        'भुगतान',
        'बौद्धिक संपदा',
        'गोपनीयता',
        'प्रतिस्पर्धा निषेध',
        'शासी कानून',
        'क्षेत्राधिकार',
        'वारंटी',
        'विवाद समाधान'
    ]
};

// Risky keywords for prioritization
const RISKY_KEYWORDS = {
    en: [
        'terminate', 'termination', 'cancel', 'cancellation',
        'liable', 'liability', 'damages', 'loss',
        'indemnify', 'indemnification', 'hold harmless',
        'renew', 'renewal', 'auto-renew', 'automatically renew', 'automatic renewal',
        'penalty', 'late fee', 'interest', 'fine',
        'governing law', 'jurisdiction', 'venue', 'arbitration',
        'intellectual property', 'ip', 'ownership', 'copyright', 'patent', 'trademark',
        'non-compete', 'non-competition', 'exclusive', 'exclusivity', 'restrictive covenant'
    ],
    hi: [
        'समाप्त', 'समाप्ति', 'रद्द',
        'उत्तरदायी', 'दायित्व', 'हानि', 'नुकसान',
        'क्षतिपूर्ति',
        'नवीनीकरण', 'स्वतः नवीनीकरण',
        'जुर्माना', 'विलंब शुल्क', 'ब्याज',
        'शासी कानून', 'क्षेत्राधिकार', 'मध्यस्थता',
        'बौद्धिक संपदा', 'स्वामित्व', 'कॉपीराइट',
        'प्रतिस्पर्धा निषेध', 'विशेष', 'विशेषाधिकार'
    ]
};

interface ClauseCandidate extends Clause {
    priority: number;
    keywords: string[];
}

/**
 * Detect risky keywords in text
 */
export function detectKeywords(text: string, language: Language): string[] {
    const keywords = RISKY_KEYWORDS[language];
    const lowerText = text.toLowerCase();
    const detected: string[] = [];

    for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
            detected.push(keyword);
        }
    }

    return detected;
}

/**
 * Normalize clause text
 */
function normalizeClauseText(text: string): string {
    let normalized = text.trim();

    // Remove excessive whitespace
    normalized = normalized.replace(/\s+/g, ' ');

    // Capitalize first letter
    if (normalized.length > 0) {
        normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }

    // Ensure proper punctuation at the end
    if (normalized.length > 0 && !/[.!?।]$/.test(normalized)) {
        normalized += '.';
    }

    // Remove special characters that might break parsing
    normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return normalized;
}

/**
 * Calculate priority score for a clause
 */
function calculatePriority(
    text: string,
    language: Language,
    sectionTitle?: string
): { priority: number; keywords: string[] } {
    let priority = 0;
    const keywords = detectKeywords(text, language);

    // Keywords boost priority
    priority += keywords.length * 10;

    // Section title matching risky types
    if (sectionTitle) {
        const lowerTitle = sectionTitle.toLowerCase();
        const headers = SECTION_HEADERS[language];
        if (headers.some(h => lowerTitle.includes(h))) {
            priority += 20;
        }
    }

    // Length preference (medium-length clauses)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 20 && wordCount <= 200) {
        priority += 15;
    } else if (wordCount > 200 && wordCount <= 500) {
        priority += 10;
    } else if (wordCount < 20) {
        priority -= 10;
    }

    return { priority, keywords };
}

/**
 * Split text by section headers
 */
function splitBySectionHeaders(text: string, language: Language): ClauseCandidate[] | null {
    const headers = SECTION_HEADERS[language];
    const clauses: ClauseCandidate[] = [];

    // Create regex pattern for section headers
    const headerPattern = headers.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(?:^|\\n)\\s*(?:\\d+\\.?\\s*)?(?:${headerPattern})\\s*:?\\s*`, 'gi');

    const matches = Array.from(text.matchAll(regex));

    if (matches.length === 0) {
        return null;
    }

    console.log(`Splitting text into clauses using strategy: Section Headers (found ${matches.length} headers)`);

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const startIndex = match.index!;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : text.length;

        const sectionTitle = match[0].trim().replace(/^\d+\.?\s*/, '').replace(/:$/, '');
        const clauseText = text.substring(startIndex + match[0].length, endIndex).trim();

        if (clauseText.length > 0) {
            const { priority, keywords } = calculatePriority(clauseText, language, sectionTitle);

            clauses.push({
                id: uuidv4(),
                text: normalizeClauseText(clauseText),
                language,
                sectionTitle,
                startIndex,
                endIndex,
                priority,
                keywords
            });
        }
    }

    return clauses.length > 0 ? clauses : null;
}

/**
 * Split text by numbered clauses
 */
function splitByNumberedClauses(text: string, language: Language): ClauseCandidate[] | null {
    const clauses: ClauseCandidate[] = [];

    // Match patterns like "1.", "1.1", "Article 1", "Section 1", "Clause 1", "(a)", "(i)"
    const patterns = [
        /(?:^|\n)\s*(\d+(?:\.\d+)*)\.\s+/g,
        /(?:^|\n)\s*(?:Article|Section|Clause)\s+(\d+(?:\.\d+)?)\s*:?\s*/gi,
        /(?:^|\n)\s*\(([a-z]|[ivx]+)\)\s+/gi
    ];

    let bestSplit: { matches: RegExpMatchArray[]; pattern: RegExp } | null = null;
    let maxMatches = 0;

    // Find the pattern with most matches
    for (const pattern of patterns) {
        const matches = Array.from(text.matchAll(pattern));
        if (matches.length > maxMatches) {
            maxMatches = matches.length;
            bestSplit = { matches, pattern };
        }
    }

    if (!bestSplit || maxMatches < 2) {
        return null;
    }

    console.log(`Splitting text into clauses using strategy: Numbered Clauses (found ${maxMatches} markers)`);

    const matches = bestSplit.matches;

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const startIndex = match.index!;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : text.length;

        const clauseNumber = match[1] || match[0].trim();
        const clauseText = text.substring(startIndex + match[0].length, endIndex).trim();

        if (clauseText.length > 0) {
            const { priority, keywords } = calculatePriority(clauseText, language);

            clauses.push({
                id: uuidv4(),
                text: normalizeClauseText(clauseText),
                language,
                clauseNumber,
                startIndex,
                endIndex,
                priority,
                keywords
            });
        }
    }

    return clauses.length > 0 ? clauses : null;
}

/**
 * Split text by paragraph breaks
 */
function splitByParagraphs(text: string, language: Language): ClauseCandidate[] {
    console.log('Splitting text into clauses using strategy: Paragraph Breaks');

    const paragraphs = text.split(/\n\s*\n+/);
    const clauses: ClauseCandidate[] = [];
    let currentIndex = 0;

    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (trimmed.length > 0) {
            const startIndex = text.indexOf(trimmed, currentIndex);
            const endIndex = startIndex + trimmed.length;

            const { priority, keywords } = calculatePriority(trimmed, language);

            clauses.push({
                id: uuidv4(),
                text: normalizeClauseText(trimmed),
                language,
                startIndex,
                endIndex,
                priority,
                keywords
            });

            currentIndex = endIndex;
        }
    }

    return clauses;
}

/**
 * Filter clauses based on quality criteria
 */
function filterClauses(clauses: ClauseCandidate[]): ClauseCandidate[] {
    const filtered = clauses.filter(clause => {
        const wordCount = clause.text.split(/\s+/).length;

        // Filter out too short clauses
        if (wordCount < MIN_CLAUSE_LENGTH) {
            return false;
        }

        // Filter out likely headers with no content
        if (wordCount < 5 && clause.text.match(/^[A-Z\s]+:?$/)) {
            return false;
        }

        // Filter out likely page numbers or TOC entries
        if (clause.text.match(/^(?:Page\s+)?\d+(?:\s+of\s+\d+)?$/i)) {
            return false;
        }

        return true;
    });

    // Remove duplicates (exact text match)
    const seen = new Set<string>();
    const unique = filtered.filter(clause => {
        const normalized = clause.text.toLowerCase().trim();
        if (seen.has(normalized)) {
            return false;
        }
        seen.add(normalized);
        return true;
    });

    console.log(`After filtering: ${unique.length} clauses remaining (from ${clauses.length})`);

    return unique;
}

/**
 * Split long clauses by sentence boundaries
 */
function splitLongClauses(clauses: ClauseCandidate[]): ClauseCandidate[] {
    const result: ClauseCandidate[] = [];

    for (const clause of clauses) {
        const wordCount = clause.text.split(/\s+/).length;

        if (wordCount <= MAX_CLAUSE_LENGTH) {
            result.push(clause);
            continue;
        }

        // Split by sentence boundaries
        const sentences = clause.text.split(/(?<=[.!?।])\s+/);
        let currentChunk = '';
        const chunkStartIndex: number = clause.startIndex ?? 0;
        let chunkOffset = 0;

        for (const sentence of sentences) {
            const potentialChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
            const potentialWordCount = potentialChunk.split(/\s+/).length;

            if (potentialWordCount > MAX_CLAUSE_LENGTH && currentChunk) {
                // Save current chunk
                const { priority, keywords } = calculatePriority(currentChunk, clause.language, clause.sectionTitle);
                result.push({
                    id: uuidv4(),
                    text: normalizeClauseText(currentChunk),
                    language: clause.language,
                    sectionTitle: clause.sectionTitle,
                    startIndex: chunkStartIndex + chunkOffset,
                    endIndex: chunkStartIndex + chunkOffset + currentChunk.length,
                    priority,
                    keywords
                });

                chunkOffset += currentChunk.length + 1;
                currentChunk = sentence;
            } else {
                currentChunk = potentialChunk;
            }
        }

        // Add remaining chunk
        if (currentChunk) {
            const { priority, keywords } = calculatePriority(currentChunk, clause.language, clause.sectionTitle);
            result.push({
                id: uuidv4(),
                text: normalizeClauseText(currentChunk),
                language: clause.language,
                sectionTitle: clause.sectionTitle,
                startIndex: chunkStartIndex + chunkOffset,
                endIndex: clause.endIndex ?? (chunkStartIndex + chunkOffset + currentChunk.length),
                priority,
                keywords
            });
        }
    }

    return result;
}

/**
 * Prioritize and limit clauses
 */
function prioritizeAndLimit(clauses: ClauseCandidate[]): Clause[] {
    // Sort by priority (descending)
    const sorted = [...clauses].sort((a, b) => b.priority - a.priority);

    // Limit to MAX_CLAUSES_PER_DOCUMENT
    const limited = sorted.slice(0, MAX_CLAUSES_PER_DOCUMENT);

    // Log keywords for top clauses
    const topKeywords = new Set<string>();
    limited.forEach(c => c.keywords.forEach(k => topKeywords.add(k)));
    console.log(`Keywords detected: ${Array.from(topKeywords).join(', ')}`);

    console.log(`Prioritized and limited to ${limited.length} clauses`);

    // Remove priority and keywords from final output
    return limited.map(({ priority, keywords, ...clause }) => clause);
}

/**
 * Main clause splitting function
 */
export async function splitIntoClauses(text: string, language: Language): Promise<Clause[]> {
    try {
        console.log(`Starting clause splitting for ${language} text (${text.length} characters)`);

        let clauses: ClauseCandidate[] | null = null;

        // Strategy A: Section Headers
        clauses = splitBySectionHeaders(text, language);

        // Strategy B: Numbered Clauses
        if (!clauses || clauses.length < 2) {
            clauses = splitByNumberedClauses(text, language);
        }

        // Strategy C: Paragraph Breaks
        if (!clauses || clauses.length < 2) {
            clauses = splitByParagraphs(text, language);
        }

        // Ensure we have at least something
        if (!clauses || clauses.length === 0) {
            console.log('No clauses found, returning full text as single clause');
            const { priority, keywords } = calculatePriority(text, language);
            return [{
                id: uuidv4(),
                text: normalizeClauseText(text),
                language,
                startIndex: 0,
                endIndex: text.length
            }];
        }

        console.log(`Found ${clauses.length} potential clauses`);

        // Filter clauses
        const filtered = filterClauses(clauses);

        // Split long clauses
        const split = splitLongClauses(filtered);

        // Prioritize and limit
        const final = prioritizeAndLimit(split);

        return final;

    } catch (error) {
        console.error('Error splitting clauses:', error);

        // Fallback: return full text as single clause
        return [{
            id: uuidv4(),
            text: normalizeClauseText(text),
            language,
            startIndex: 0,
            endIndex: text.length
        }];
    }
}
