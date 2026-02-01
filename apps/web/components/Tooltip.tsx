"use client";

import { useState } from "react";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsVisible(!isVisible);
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label="Show tooltip"
            >
                {children}
            </div>

            {isVisible && (
                <>
                    {/* Backdrop for mobile tap-outside */}
                    <div
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setIsVisible(false)}
                    />

                    {/* Tooltip */}
                    <div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
                        role="tooltip"
                    >
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-lg">
                            {content}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                <div className="border-4 border-transparent border-t-gray-900" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
