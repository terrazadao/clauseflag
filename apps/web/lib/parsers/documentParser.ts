import mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import { UploadedFile } from '@clauseflag/shared';

export interface ParsedDocument {
  text: string;
  fileType: 'pdf' | 'docx';
  fileName: string;
}

export class DocumentParserError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DocumentParserError';
  }
}

export const ERROR_CODES = {
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',
  PARSE_FAILED: 'PARSE_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  EMPTY_DOCUMENT: 'EMPTY_DOCUMENT',
  CORRUPTED_PDF: 'CORRUPTED_PDF',
  PASSWORD_PROTECTED: 'PASSWORD_PROTECTED',
} as const;

export async function parseDocument(file: UploadedFile): Promise<ParsedDocument> {
  try {
    if (file.type === 'pdf') {
      const pdfData = await fetch(file.url!).then(res => res.arrayBuffer());
      const pdf = await (pdfParse as any).default(pdfData);

      return {
        text: pdf.text,
        fileType: 'pdf',
        fileName: file.name
      };
    } else if (file.type === 'docx') {
      const docxData = await fetch(file.url!).then(res => res.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer: Buffer.from(docxData) });

      return {
        text: result.value,
        fileType: 'docx',
        fileName: file.name
      };
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}