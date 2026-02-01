"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, FileType, X, CheckCircle, AlertCircle } from "lucide-react";
import { Language } from "@clauseflag/shared";
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from "@clauseflag/shared";

interface ContractUploadProps {
    language: Language;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    error?: string;
    disabled?: boolean;
}

const translations = {
    en: {
        dropzone: "Drop your contract here or click to browse",
        support: "Supports PDF and DOCX up to 10MB",
        uploaded: "File uploaded successfully",
        remove: "Remove file",
        errors: {
            tooLarge: "File is too large. Maximum size is 10MB",
            invalidType: "Invalid file type. Only PDF and DOCX are supported",
            required: "Please upload a file"
        }
    },
    hi: {
        dropzone: "अपना अनुबंध यहाँ छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
        support: "10MB तक PDF और DOCX समर्थित",
        uploaded: "फ़ाइल सफलतापूर्वक अपलोड की गई",
        remove: "फ़ाइल हटाएं",
        errors: {
            tooLarge: "फ़ाइल बहुत बड़ी है। अधिकतम आकार 10MB है",
            invalidType: "अमान्य फ़ाइल प्रकार। केवल PDF और DOCX समर्थित हैं",
            required: "कृपया एक फ़ाइल अपलोड करें"
        }
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function ContractUpload({
    language,
    onFileSelect,
    onFileRemove,
    error,
    disabled = false
}: ContractUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [validationError, setValidationError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const t = translations[language];

    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return t.errors.tooLarge;
        }
        if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
            return t.errors.invalidType;
        }
        return null;
    };

    const handleFile = (selectedFile: File) => {
        const error = validateFile(selectedFile);
        if (error) {
            setValidationError(error);
            setFile(null);
            return;
        }

        setValidationError("");
        setFile(selectedFile);
        onFileSelect(selectedFile);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFile(droppedFiles[0]);
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            handleFile(selectedFiles[0]);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setValidationError("");
        onFileRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClick = () => {
        if (!disabled && !file) {
            fileInputRef.current?.click();
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType === 'application/pdf') {
            return <FileText className="w-8 h-8 text-red-500" />;
        }
        return <FileType className="w-8 h-8 text-blue-500" />;
    };

    const displayError = error || validationError;

    return (
        <div className="w-full">
            {!file ? (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragging
                            ? 'border-blue-600 bg-blue-50 border-solid'
                            : displayError
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={t.dropzone}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick();
                        }
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={disabled}
                        aria-label="File upload input"
                    />

                    <div className="flex flex-col items-center gap-4">
                        <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${isDragging ? 'bg-blue-100' : displayError ? 'bg-red-100' : 'bg-gray-100'}
            `}>
                            {displayError ? (
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            ) : (
                                <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-600'}`} />
                            )}
                        </div>

                        <div>
                            <p className={`text-lg font-semibold mb-1 ${displayError ? 'text-red-700' : 'text-gray-700'}`}>
                                {t.dropzone}
                            </p>
                            <p className="text-sm text-gray-500">
                                {t.support}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6 transition-all duration-200">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            {getFileIcon(file.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>

                                <button
                                    onClick={handleRemove}
                                    disabled={disabled}
                                    className="flex-shrink-0 p-2 rounded-lg hover:bg-red-100 transition-colors group"
                                    aria-label={t.remove}
                                >
                                    <X className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">
                                    {t.uploaded}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {displayError && (
                <div className="mt-3 flex items-start gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{displayError}</p>
                </div>
            )}
        </div>
    );
}
