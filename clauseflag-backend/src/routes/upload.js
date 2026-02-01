const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const supabase = require('../utils/supabase');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  },
});

async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { jurisdiction } = req.body;
    if (!jurisdiction || !['us', 'eu', 'uae'].includes(jurisdiction)) {
      return res.status(400).json({ error: 'Invalid jurisdiction' });
    }

    // Extract text from document
    const extractedText = await extractText(req.file.buffer, req.file.mimetype);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Could not extract text from document' });
    }

    // Upload file to Supabase Storage
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Save contract record
    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .insert({
        filename: req.file.originalname,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        storage_path: uploadData.path,
        extracted_text: extractedText,
        jurisdiction,
        status: 'uploaded',
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    res.json({
      success: true,
      contractId: contract.id,
      filename: contract.filename,
      textLength: extractedText.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to process upload',
      message: error.message,
    });
  }
});

module.exports = router;
