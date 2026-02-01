import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { UploadedFile } from '@clauseflag/shared';

export interface ParsedDocument {
  text: string;
  fileType: 'pdf' | 'docx';
  fileName: string;
}

export async function parseDocument(file: UploadedFile): Promise<ParsedDocument> {
  try {
    if (file.type === 'pdf') {
      const pdfData = await fetch(file.url!).then(res => res.arrayBuffer());
      const pdf = await pdfParse(pdfData);

      return {
        text: pdf.text,
        fileType: 'pdf',
        fileName: file.name
      };
    } else if (file.type === 'docx') {
      const docxData = await fetch(file.url!).then(res => res.arrayBuffer());
      const result = await mammoth.extractRawText({ arrayBuffer: () => Promise.resolve(docxData) });

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