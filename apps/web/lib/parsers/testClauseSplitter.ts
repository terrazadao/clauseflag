/**
 * Test script for clause splitter
 */

import { splitIntoClauses, detectKeywords } from './clauseSplitter';
import { Language } from '@clauseflag/shared';

// Sample English contract with numbered sections
const SAMPLE_EN_NUMBERED = `
1. TERMINATION
Either party may terminate this Agreement upon thirty (30) days written notice to the other party. In the event of termination, all rights and obligations shall cease immediately.

2. LIABILITY LIMITATION
In no event shall either party be liable for any indirect, incidental, special, or consequential damages arising out of or related to this Agreement, including but not limited to loss of profits, revenue, or data.

3. INDEMNIFICATION
Each party agrees to indemnify, defend, and hold harmless the other party from any claims, damages, or expenses arising from their breach of this Agreement.

4. AUTOMATIC RENEWAL
This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.

5. PAYMENT TERMS
All payments are due within thirty (30) days of invoice date. Late payments shall accrue interest at the rate of 1.5% per month or the maximum rate permitted by law, whichever is less.

6. INTELLECTUAL PROPERTY
All intellectual property created under this Agreement shall be the sole property of the Company. Contractor hereby assigns all rights, title, and interest in such IP to the Company.

7. NON-COMPETE
During the term of this Agreement and for a period of two (2) years thereafter, Contractor shall not engage in any business that competes with the Company within a 50-mile radius.

8. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
`;

// Sample English contract with section headers
const SAMPLE_EN_HEADERS = `
TERMINATION CLAUSE
This agreement may be terminated by either party with 30 days written notice. Upon termination, all outstanding payments become immediately due and payable.

LIABILITY AND DAMAGES
The Company's total liability under this agreement shall not exceed the total fees paid in the twelve months preceding the claim. This limitation applies to all causes of action in the aggregate.

INDEMNITY PROVISIONS
Client agrees to indemnify and hold harmless the Company from any third-party claims arising from Client's use of the services or breach of this agreement.

RENEWAL TERMS
This contract will automatically renew annually unless cancelled in writing 60 days before renewal date. Pricing may increase up to 10% upon each renewal.

PAYMENT AND PENALTIES
Invoices are due net 30. Late payments incur a 2% monthly penalty. Accounts over 60 days past due may result in service suspension.

INTELLECTUAL PROPERTY RIGHTS
All work product, including but not limited to designs, code, and documentation, shall be owned exclusively by the Company upon full payment.
`;

// Sample Hindi contract
const SAMPLE_HI = `
समाप्ति खंड
यह समझौता किसी भी पक्ष द्वारा 30 दिन की लिखित सूचना के साथ समाप्त किया जा सकता है। समाप्ति पर, सभी बकाया भुगतान तुरंत देय हो जाते हैं।

दायित्व और हानि
इस समझौते के तहत कंपनी की कुल देयता पिछले बारह महीनों में भुगतान की गई कुल फीस से अधिक नहीं होगी।

क्षतिपूर्ति प्रावधान
ग्राहक सेवाओं के उपयोग या इस समझौते के उल्लंघन से उत्पन्न किसी भी तीसरे पक्ष के दावों से कंपनी को क्षतिपूर्ति और सुरक्षित रखने के लिए सहमत है।

नवीनीकरण शर्तें
यह अनुबंध स्वचालित रूप से वार्षिक नवीनीकृत होगा जब तक कि नवीनीकरण तिथि से 60 दिन पहले लिखित रूप में रद्द नहीं किया जाता।

भुगतान और जुर्माना
चालान नेट 30 देय हैं। विलंबित भुगतान पर 2% मासिक जुर्माना लगता है।

बौद्धिक संपदा अधिकार
सभी कार्य उत्पाद, जिसमें डिज़ाइन, कोड और दस्तावेज़ीकरण शामिल हैं, पूर्ण भुगतान पर कंपनी के स्वामित्व में होंगे।
`;

// Unstructured paragraph-based text
const SAMPLE_UNSTRUCTURED = `
This agreement is entered into on this date between the parties. The term of this agreement shall be for a period of one year from the effective date.

The contractor agrees to provide services as described in Exhibit A. All services must be performed in a professional and timely manner according to industry standards.

Payment shall be made monthly based on hours worked at the agreed rate. Invoices must be submitted by the 5th of each month for the previous month's work.

Either party may terminate this agreement with 30 days notice. Upon termination, contractor must return all company property and confidential information.

The contractor shall not compete with the company during the term and for 12 months after termination. This includes soliciting company clients or employees.

All work product created under this agreement becomes the exclusive property of the company. The contractor waives all moral rights to such work.

This agreement is governed by California law. Any disputes shall be resolved through binding arbitration in San Francisco.
`;

interface TestCase {
    name: string;
    text: string;
    language: Language;
}

const testCases: TestCase[] = [
    {
        name: 'English - Numbered Sections',
        text: SAMPLE_EN_NUMBERED,
        language: 'en'
    },
    {
        name: 'English - Section Headers',
        text: SAMPLE_EN_HEADERS,
        language: 'en'
    },
    {
        name: 'Hindi - Section Headers',
        text: SAMPLE_HI,
        language: 'hi'
    },
    {
        name: 'English - Unstructured Paragraphs',
        text: SAMPLE_UNSTRUCTURED,
        language: 'en'
    }
];

async function runTest(testCase: TestCase): Promise<void> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Test: ${testCase.name}`);
    console.log(`${'='.repeat(70)}\n`);

    try {
        const clauses = await splitIntoClauses(testCase.text, testCase.language);

        console.log(`\n✅ Successfully split into ${clauses.length} clauses\n`);

        clauses.forEach((clause, index) => {
            console.log(`--- Clause ${index + 1} ---`);
            if (clause.sectionTitle) {
                console.log(`Section: ${clause.sectionTitle}`);
            }
            if (clause.clauseNumber) {
                console.log(`Number: ${clause.clauseNumber}`);
            }
            console.log(`Text: ${clause.text.substring(0, 150)}${clause.text.length > 150 ? '...' : ''}`);

            const keywords = detectKeywords(clause.text, testCase.language);
            if (keywords.length > 0) {
                console.log(`Keywords: ${keywords.join(', ')}`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

async function runAllTests(): Promise<void> {
    console.log('\n🧪 Starting Clause Splitter Tests\n');

    for (const testCase of testCases) {
        await runTest(testCase);
    }

    console.log('\n✨ All tests completed\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

export { runAllTests, runTest };
