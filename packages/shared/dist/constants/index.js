"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANALYSIS_TIMEOUT = exports.MAX_CLAUSE_LENGTH = exports.MIN_CLAUSE_LENGTH = exports.MAX_CLAUSES_PER_DOCUMENT = exports.SUPPORTED_JURISDICTIONS = exports.SUPPORTED_LANGUAGES = exports.SUPPORTED_FILE_TYPES = exports.MAX_FILE_SIZE = void 0;
exports.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
exports.SUPPORTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
exports.SUPPORTED_LANGUAGES = ['en', 'hi'];
exports.SUPPORTED_JURISDICTIONS = ['US', 'EU', 'UAE', 'IN'];
exports.MAX_CLAUSES_PER_DOCUMENT = 100;
exports.MIN_CLAUSE_LENGTH = 20;
exports.MAX_CLAUSE_LENGTH = 500;
exports.ANALYSIS_TIMEOUT = 60000; // 60 seconds
