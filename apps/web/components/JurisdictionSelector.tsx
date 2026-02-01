"use client";

import { Language, Jurisdiction } from "@clauseflag/shared";
import { Check, Info } from "lucide-react";
import Tooltip from "./Tooltip";

interface JurisdictionSelectorProps {
    selectedJurisdiction: Jurisdiction;
    onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
    language: Language;
    disabled?: boolean;
}

const translations = {
    en: {
        heading: "Jurisdiction",
        description: "Where will this contract be enforced?",
        tooltip: "We'll adjust risk interpretations based on typical practices in this region",
        options: {
            US: "United States",
            EU: "European Union",
            UAE: "UAE",
            IN: "India"
        }
    },
    hi: {
        heading: "क्षेत्राधिकार",
        description: "यह अनुबंध कहाँ लागू होगा?",
        tooltip: "हम इस क्षेत्र की सामान्य प्रथाओं के आधार पर जोखिम व्याख्या को समायोजित करेंगे",
        options: {
            US: "संयुक्त राज्य अमेरिका",
            EU: "यूरोपीय संघ",
            UAE: "यूएई",
            IN: "भारत"
        }
    }
};

const jurisdictionOptions: { value: Jurisdiction; flag: string }[] = [
    { value: 'US', flag: '🇺🇸' },
    { value: 'EU', flag: '🇪🇺' },
    { value: 'UAE', flag: '🇦🇪' },
    { value: 'IN', flag: '🇮🇳' }
];

export default function JurisdictionSelector({
    selectedJurisdiction,
    onJurisdictionChange,
    language,
    disabled = false
}: JurisdictionSelectorProps) {
    const t = translations[language];

    return (
        <div className="w-full">
            <div className="mb-4 flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {t.heading}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {t.description}
                    </p>
                </div>

                <Tooltip content={t.tooltip}>
                    <button
                        className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Information about jurisdiction"
                    >
                        <Info className="w-5 h-5 text-gray-400" />
                    </button>
                </Tooltip>
            </div>

            <div
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
                role="radiogroup"
                aria-label={t.heading}
            >
                {jurisdictionOptions.map((option) => {
                    const isSelected = selectedJurisdiction === option.value;
                    const label = t.options[option.value];

                    return (
                        <button
                            key={option.value}
                            onClick={() => !disabled && onJurisdictionChange(option.value)}
                            disabled={disabled}
                            role="radio"
                            aria-checked={isSelected}
                            className={`
                relative p-4 rounded-xl border-2 text-center
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isSelected
                                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }
                ${!disabled && 'hover:scale-102'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <div className="bg-blue-600 rounded-full p-1">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-4xl">{option.flag}</span>
                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
