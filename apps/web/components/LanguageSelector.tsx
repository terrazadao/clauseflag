"use client";

import { Language } from "@clauseflag/shared";
import { Check } from "lucide-react";

interface LanguageSelectorProps {
    selectedLanguage: Language;
    onLanguageChange: (language: Language) => void;
    uiLanguage: Language;
    disabled?: boolean;
}

const translations = {
    en: {
        heading: "Contract Language",
        description: "Select the language of your contract",
        options: {
            en: "English",
            hi: "Hindi"
        }
    },
    hi: {
        heading: "अनुबंध की भाषा",
        description: "अपने अनुबंध की भाषा चुनें",
        options: {
            en: "अंग्रेज़ी",
            hi: "हिंदी"
        }
    }
};

const languageOptions: { value: Language; flag: string; labelEn: string; labelHi: string }[] = [
    { value: 'en', flag: '🇬🇧', labelEn: 'English', labelHi: 'अंग्रेज़ी' },
    { value: 'hi', flag: '🇮🇳', labelEn: 'Hindi', labelHi: 'हिंदी' }
];

export default function LanguageSelector({
    selectedLanguage,
    onLanguageChange,
    uiLanguage,
    disabled = false
}: LanguageSelectorProps) {
    const t = translations[uiLanguage];

    return (
        <div className="w-full">
            <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {t.heading}
                </h3>
                <p className="text-sm text-gray-600">
                    {t.description}
                </p>
            </div>

            <div
                className="inline-flex rounded-xl bg-gray-100 p-1 w-full sm:w-auto"
                role="radiogroup"
                aria-label={t.heading}
            >
                {languageOptions.map((option) => {
                    const isSelected = selectedLanguage === option.value;
                    const label = uiLanguage === 'en' ? option.labelEn : option.labelHi;

                    return (
                        <button
                            key={option.value}
                            onClick={() => !disabled && onLanguageChange(option.value)}
                            disabled={disabled}
                            role="radio"
                            aria-checked={isSelected}
                            className={`
                flex-1 px-6 py-3 rounded-lg font-medium text-sm
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isSelected
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 hover:text-gray-900'
                                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="text-lg">{option.flag}</span>
                                <span>{label}</span>
                                {isSelected && <Check className="w-4 h-4 ml-1" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
