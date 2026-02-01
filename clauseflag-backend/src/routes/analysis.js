const express = require('express');
const OpenAI = require('openai');
const supabase = require('../utils/supabase');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CLAUSE_TYPES = [
  'termination',
  'liability',
  'indemnity',
  'auto_renewal',
  'payment_penalties',
  'governing_law',
  'intellectual_property',
  'non_compete',
];

const JURISDICTION_CONTEXT = {
  us: 'United States jurisdiction. Consider federal and state law variations.',
  eu: 'European Union jurisdiction. Consider GDPR, consumer protection, and EU directive compliance.',
  uae: 'United Arab Emirates jurisdiction. Consider local commercial law and free zone regulations.',
};

const ANALYSIS_PROMPT = `You are a contract clause analyzer for a legal tech tool. Your task is to identify and analyze ONLY high-risk clauses in the provided contract text.

Analyze the following contract text and identify any risky clauses from these categories:
- termination: Unilateral termination rights, short notice periods, termination for convenience
- liability: Excessive liability caps, broad exclusions, unfair limitation of liability
- indemnity: Broad indemnification clauses, one-sided indemnity obligations
- auto_renewal: Automatic renewal without clear notice requirements, perpetual renewal
- payment_penalties: Late payment fees, interest rates, liquidated damages
- governing_law: Unfavorable jurisdiction selection, forum selection clauses
- intellectual_property: Unclear IP ownership, broad IP assignment, work-for-hire issues
- non_compete: Non-compete clauses, exclusivity requirements, restrictive covenants

For each risky clause found, provide:
1. type: The clause category (from the list above)
2. riskLevel: "low", "medium", or "high" (be conservative - only flag genuinely concerning clauses)
3. text: The exact clause text (truncate if too long, max 500 chars)
4. explanation: Plain English explanation of what this clause means (max 2 sentences)
5. whyMatters: Why this matters to the signer - practical impact (1-2 sentences)

IMPORTANT RULES:
- Only return clauses that are genuinely risky or unfavorable
- Do NOT provide legal advice - only flag potential concerns
- Be conservative - better to miss a minor issue than flag harmless language
- Return empty array if no risky clauses found
- Jurisdiction context: {{JURISDICTION}}

Return ONLY a JSON object in this exact format:
{
  "clauses": [
    {
      "type": "termination",
      "riskLevel": "high",
      "text": "...",
      "explanation": "...",
      "whyMatters": "..."
    }
  ],
  "summary": {
    "totalClauses": 0,
    "lowRisk": 0,
    "mediumRisk": 0,
    "highRisk": 0
  }
}`;

async function analyzeContract(contractId, text, jurisdiction) {
  const startTime = Date.now();

  try {
    // Update contract status
    await supabase
      .from('contracts')
      .update({ status: 'analyzing' })
      .eq('id', contractId);

    // Create analysis record
    const { data: analysis } = await supabase
      .from('analyses')
      .insert({
        contract_id: contractId,
        jurisdiction,
        status: 'processing',
      })
      .select()
      .single();

    // Truncate text if too long (OpenAI token limits)
    const maxChars = 15000;
    const truncatedText = text.length > maxChars 
      ? text.substring(0, maxChars) + '... [truncated]' 
      : text;

    // Call OpenAI
    const prompt = ANALYSIS_PROMPT.replace('{{JURISDICTION}}', JURISDICTION_CONTEXT[jurisdiction]);
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Analyze this contract text:\n\n${truncatedText}` },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    let result;

    try {
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Add IDs to clauses
    const clausesWithIds = result.clauses.map((clause, index) => ({
      ...clause,
      id: `clause-${index}`,
    }));

    // Update summary
    const summary = {
      totalClauses: clausesWithIds.length,
      lowRisk: clausesWithIds.filter(c => c.riskLevel === 'low').length,
      mediumRisk: clausesWithIds.filter(c => c.riskLevel === 'medium').length,
      highRisk: clausesWithIds.filter(c => c.riskLevel === 'high').length,
    };

    // Update analysis record
    const processingTime = Date.now() - startTime;
    
    await supabase
      .from('analyses')
      .update({
        clauses: clausesWithIds,
        summary,
        status: 'completed',
        processing_time_ms: processingTime,
      })
      .eq('id', analysis.id);

    // Update contract status
    await supabase
      .from('contracts')
      .update({ status: 'analyzed' })
      .eq('id', contractId);

    return {
      id: analysis.id,
      clauses: clausesWithIds,
      summary,
    };

  } catch (error) {
    console.error('Analysis error:', error);

    // Update analysis with error
    await supabase
      .from('analyses')
      .update({
        status: 'error',
        error_message: error.message,
      })
      .eq('contract_id', contractId);

    // Update contract status
    await supabase
      .from('contracts')
      .update({ status: 'error' })
      .eq('id', contractId);

    throw error;
  }
}

router.post('/start', async (req, res) => {
  try {
    const { contractId } = req.body;

    if (!contractId) {
      return res.status(400).json({ error: 'Contract ID required' });
    }

    // Get contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error || !contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (!contract.extracted_text) {
      return res.status(400).json({ error: 'No text extracted from contract' });
    }

    // Start analysis (async)
    const result = await analyzeContract(
      contractId,
      contract.extracted_text,
      contract.jurisdiction
    );

    res.json({
      success: true,
      analysisId: result.id,
      summary: result.summary,
    });

  } catch (error) {
    console.error('Start analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze contract',
      message: error.message,
    });
  }
});

router.get('/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;

    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error || !analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({
      id: analysis.id,
      status: analysis.status,
      clauses: analysis.clauses,
      summary: analysis.summary,
      errorMessage: analysis.error_message,
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analysis',
      message: error.message,
    });
  }
});

module.exports = router;
