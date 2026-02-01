
# ClauseFlag – Contract Clause Risk Scanner
## MicroSaaS Build Blueprint (Vibe Coding Ready)

---

## 1. Product Overview

**Product Name:** ClauseFlag (working name)  
**One-liner:** Spot risky contract clauses in 60 seconds. No legal jargon.

**Problem:**  
SMBs, founders, agencies, and freelancers regularly sign contracts they do not fully understand. Legal reviews are slow, expensive, and often skipped—leading to financial and legal risk.

**Solution:**  
ClauseFlag highlights only *high-risk clauses* in a contract and explains them in plain English, without pretending to replace a lawyer.

---

## 2. Target Market & ICP

### Primary Customers
- SMB founders
- Digital agencies
- Freelancers & consultants
- Startup operators

### Geography
- United States
- European Union (Germany, Netherlands, France, Nordics)
- United Arab Emirates

### Trigger Moment
User has just received a contract and is expected to sign it quickly.

---

## 3. Core Value Proposition

Not “AI legal analysis”  
But:

> “We highlight clauses that could hurt you — and explain why, in plain English.”

Key drivers:
- Fear-driven urgency
- Speed (results in < 1 minute)
- Simplicity (red flags only)

---

## 4. MVP Scope (Do NOT Overbuild)

### 4.1 Contract Upload
- PDF and DOCX support
- File size limit (e.g., 10 MB)
- English only (v1)

### 4.2 Clause Detection Engine
Only detect and analyze **high-risk clauses**:
- Termination
- Liability limitation
- Indemnity
- Auto-renewal
- Payment penalties
- Governing law & jurisdiction
- Intellectual property ownership
- Non-compete / exclusivity

### 4.3 Risk Output UI
For each flagged clause:
- Risk level: Low / Medium / High
- Plain-English explanation
- “Why this matters” section

### 4.4 Jurisdiction Selector
User selects:
- US
- EU
- UAE

Used to slightly adjust wording and risk interpretation (NOT legal advice).

### 4.5 Legal Disclaimer
Highly visible disclaimer:
“This tool provides information only and does not constitute legal advice.”

---

## 5. Clause Analysis Logic

1. Extract text from document
2. Split document into clauses (rule-based + AI)
3. For each clause:
   - Identify clause type
   - Determine if risky (Yes / No)
   - Assign risk level
   - Generate explanation
4. Return **only risky clauses**

This keeps results short, cheap, and high-value.

---

## 6. Technology Stack

### Frontend
- Next.js / React
- Tailwind CSS
- Simple file upload + results UI

### Backend
- Node.js or Python
- PDF parsing: pdfplumber / unstructured
- DOCX parsing: python-docx

### AI Layer
- OpenAI or Claude
- Low temperature, deterministic prompts
- One prompt per clause

### Infrastructure
- Supabase (auth, database)
- Stripe (payments)
- Vercel / Render (hosting)

---

## 7. AI Prompting Strategy (High Level)

System prompt goals:
- Classify clause type
- Detect risk
- Explain in plain English
- Avoid legal advice tone
- Be conservative and clear

Return JSON only.

---

## 8. Pricing Strategy

### Phase 1 (Launch)
- $10 per contract
- No signup required before upload
- Email required to receive full report

### Phase 2 (After Validation)
- $29/month → 5 contracts
- $79/month → unlimited contracts

---

## 9. 7-Day Build Plan

**Day 1**
- Landing page
- Stripe payment setup
- Upload UI

**Day 2**
- Document parsing
- Clause splitting logic

**Day 3**
- AI clause classification
- Risk scoring

**Day 4**
- Explanation generation
- Jurisdiction toggle

**Day 5**
- UI polish
- Error handling
- Disclaimer + legal pages

**Day 6**
- Payment gating
- Email delivery
- Logging

**Day 7**
- Real contract testing
- Fix hallucinations
- Deploy

---

## 10. Go-To-Market (First 50 Users)

### Channels
- Founder & freelancer communities
- Indie Hacker forums
- LinkedIn (search posts about contracts)

### Hook
“Before you sign that contract, scan it for red flags in 60 seconds.”

---

## 11. Defensibility & Expansion

### Short-Term
- Jurisdiction tuning
- Clause library improvements
- Better explanations

### Long-Term
- Clause comparison (before/after)
- AI redline suggestions
- Team dashboards
- Expansion into compliance tools (GDPR / AI Act)

---

## 12. Success Metrics

- Time to value < 60 seconds
- Conversion rate (upload → pay)
- Repeat usage
- Cost per analysis

---

## 13. Key Principles

- Simplicity beats completeness
- Red flags > full analysis
- Fear-driven UX converts
- Disclaimer everywhere

---

END OF DOCUMENT
