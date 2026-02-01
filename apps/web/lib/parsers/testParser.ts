/**
 * Test script for document parser
 * 
 * Usage: Create test files and run this script to verify parsing functionality
 */

import { parseDocument, DocumentParserError, ERROR_CODES } from './documentParser';
import { readFileSync } from 'fs';
import { join } from 'path';

interface TestCase {
    name: string;
    filePath: string;
    fileType: 'pdf' | 'docx';
    shouldFail?: boolean;
    expectedError?: string;
}

const testCases: TestCase[] = [
    {
        name: 'Valid PDF',
        filePath: './test-files/sample.pdf',
        fileType: 'pdf'
    },
    {
        name: 'Valid DOCX',
        filePath: './test-files/sample.docx',
        fileType: 'docx'
    },
    {
        name: 'Empty PDF',
        filePath: './test-files/empty.pdf',
        fileType: 'pdf',
        shouldFail: true,
        expectedError: ERROR_CODES.EMPTY_DOCUMENT
    },
    {
        name: 'Corrupted PDF',
        filePath: './test-files/corrupted.pdf',
        fileType: 'pdf',
        shouldFail: true,
        expectedError: ERROR_CODES.CORRUPTED_PDF
    },
    {
        name: 'Password Protected PDF',
        filePath: './test-files/protected.pdf',
        fileType: 'pdf',
        shouldFail: true,
        expectedError: ERROR_CODES.PASSWORD_PROTECTED
    }
];

async function runTest(testCase: TestCase): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);

    try {
        // Read file
        const buffer = readFileSync(join(__dirname, testCase.filePath));

        // Parse document
        const result = await parseDocument(buffer, testCase.fileType);

        if (testCase.shouldFail) {
            console.error('❌ FAILED: Expected error but parsing succeeded');
            return;
        }

        console.log('✅ SUCCESS: Document parsed successfully');
        console.log('\nResults:');
        console.log(`  - File Type: ${result.detectedFileType}`);
        console.log(`  - Language: ${result.language}`);
        console.log(`  - Word Count: ${result.wordCount}`);
        console.log(`  - Character Count: ${result.characterCount}`);
        console.log(`  - Text Preview: ${result.text.substring(0, 200)}...`);

    } catch (error) {
        if (error instanceof DocumentParserError) {
            if (testCase.shouldFail) {
                if (testCase.expectedError && error.code === testCase.expectedError) {
                    console.log(`✅ SUCCESS: Got expected error [${error.code}]`);
                    console.log(`  Message: ${error.message}`);
                } else {
                    console.error(`❌ FAILED: Got error [${error.code}] but expected [${testCase.expectedError}]`);
                    console.error(`  Message: ${error.message}`);
                }
            } else {
                console.error(`❌ FAILED: Unexpected error [${error.code}]`);
                console.error(`  Message: ${error.message}`);
            }
        } else {
            console.error('❌ FAILED: Unexpected error type');
            console.error(error);
        }
    }
}

async function runAllTests(): Promise<void> {
    console.log('\n🧪 Starting Document Parser Tests\n');

    for (const testCase of testCases) {
        try {
            await runTest(testCase);
        } catch (error) {
            console.error('Test execution failed:', error);
        }
    }

    console.log('\n\n✨ All tests completed\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

export { runAllTests, runTest };
