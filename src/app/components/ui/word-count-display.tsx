// src/app/components/ui/word-count-display.tsx
// Reusable word count display component with consistent formatting

import React from "react";
import { FileText, Clock } from "lucide-react";

interface WordCountDisplayProps {
  count: number;
  variant?: "default" | "compact" | "detailed" | "card";
  showIcon?: boolean;
  showReadingTime?: boolean;
  readingSpeed?: number; // words per minute
  className?: string;
  label?: string;
}

export const WordCountDisplay: React.FC<WordCountDisplayProps> = ({
  count,
  variant = "default",
  showIcon = false,
  showReadingTime = false,
  readingSpeed = 200,
  className = "",
  label,
}) => {
  // Format word count consistently
  const formatWordCount = (wordCount: number): string => {
    if (wordCount === 0) return "0 words";
    if (wordCount === 1) return "1 word";
    if (wordCount < 1000) return `${wordCount} words`;
    if (wordCount < 1000000) return `${(wordCount / 1000).toFixed(1)}k words`;
    return `${(wordCount / 1000000).toFixed(1)}M words`;
  };

  // Calculate reading time
  const getReadingTime = (wordCount: number): string => {
    if (wordCount === 0) return "No content";

    const minutes = Math.ceil(wordCount / readingSpeed);

    if (minutes < 1) return "< 1 min read";
    if (minutes === 1) return "1 min read";
    if (minutes < 60) return `${minutes} min read`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 1 && remainingMinutes === 0) return "1 hour read";
    if (remainingMinutes === 0) return `${hours} hours read`;
    if (hours === 1) return `1 hr ${remainingMinutes} min read`;

    return `${hours} hrs ${remainingMinutes} min read`;
  };

  const formattedCount = formatWordCount(count);
  const readingTime = getReadingTime(count);

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center space-x-1 text-xs text-gray-500 ${className}`}
      >
        {showIcon && <FileText className="w-2.5 h-2.5" />}
        <span className="text-xs">{formattedCount}</span>
      </span>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`flex flex-col space-y-1 ${className}`}>
        <div className="flex items-center space-x-2">
          {showIcon && <FileText className="w-3 h-3 text-gray-400" />}
          <span className="text-xs font-medium text-gray-300">
            {label && `${label}: `}
            {formattedCount}
          </span>
        </div>
        {showReadingTime && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-2.5 h-2.5" />
            <span className="text-xs">{readingTime}</span>
          </div>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-gray-800 rounded-lg p-2 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-3 h-3 text-blue-400" />
            <div>
              <div className="text-xs font-medium text-white">
                {formattedCount}
              </div>
              {label && <div className="text-xs text-gray-400">{label}</div>}
            </div>
          </div>
          {showReadingTime && (
            <div className="text-right">
              <div className="text-xs text-gray-400">{readingTime}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <span
      className={`inline-flex items-center space-x-1 text-xs text-gray-400 ${className}`}
    >
      {showIcon && <FileText className="w-3 h-3" />}
      <span className="text-xs">
        {label && `${label}: `}
        {formattedCount}
      </span>
      {showReadingTime && (
        <>
          <span>•</span>
          <Clock className="w-2.5 h-2.5" />
          <span className="text-xs">{readingTime}</span>
        </>
      )}
    </span>
  );
};
