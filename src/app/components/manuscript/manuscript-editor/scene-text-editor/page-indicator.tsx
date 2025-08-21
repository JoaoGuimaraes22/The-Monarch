// src/app/components/manuscript/manuscript-editor/scene-text-editor/page-indicator.tsx
// ✨ NEW: Page break indicators for manuscript text editor

import React from "react";

interface PageIndicatorProps {
  wordCount: number;
  wordsPerPage?: number;
  className?: string;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  wordCount,
  wordsPerPage = 250, // Fiction standard
  className = "",
}) => {
  const pageCount = Math.floor(wordCount / wordsPerPage);
  const wordsIntoCurrentPage = wordCount % wordsPerPage;
  const progressPercentage = (wordsIntoCurrentPage / wordsPerPage) * 100;

  if (wordCount < wordsPerPage) {
    // Don't show anything until we have at least one page worth
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Page break indicators */}
      {Array.from({ length: pageCount }, (_, index) => (
        <div
          key={index}
          className="page-break-indicator"
          style={{
            position: "absolute",
            top: `${(((index + 1) * wordsPerPage) / wordCount) * 100}%`,
            left: 0,
            right: 0,
            height: "1px",
            borderTop: "2px dotted #6b7280",
            backgroundColor: "transparent",
            zIndex: 10,
          }}
        >
          {/* Page number label */}
          <div className="absolute -top-3 right-2 bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-400 border border-gray-600">
            Page {index + 2}
          </div>
        </div>
      ))}

      {/* Current page progress indicator (optional) */}
      <div className="absolute top-2 right-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-gray-400 border border-gray-600">
        <div className="flex items-center space-x-2">
          <span>Page {pageCount + 1}</span>
          <div className="w-16 h-1 bg-gray-600 rounded overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span>
            {wordsIntoCurrentPage}/{wordsPerPage}
          </span>
        </div>
      </div>
    </div>
  );
};

// ✨ Enhanced version with different page standards
interface AdvancedPageIndicatorProps {
  wordCount: number;
  pageStandard?: "fiction" | "academic" | "manuscript";
  showProgress?: boolean;
  className?: string;
}

export const AdvancedPageIndicator: React.FC<AdvancedPageIndicatorProps> = ({
  wordCount,
  pageStandard = "fiction",
  showProgress = true,
  className = "",
}) => {
  const pageStandards = {
    fiction: { wordsPerPage: 250, label: "Fiction Page" },
    academic: { wordsPerPage: 500, label: "Academic Page" },
    manuscript: { wordsPerPage: 250, label: "MS Page" },
  };

  const { wordsPerPage, label } = pageStandards[pageStandard];
  const pageCount = Math.floor(wordCount / wordsPerPage);
  const wordsIntoCurrentPage = wordCount % wordsPerPage;
  const progressPercentage = (wordsIntoCurrentPage / wordsPerPage) * 100;

  return (
    <div className={`relative ${className}`}>
      {/* Page break lines */}
      {Array.from({ length: pageCount }, (_, index) => {
        const pageNumber = index + 2;
        return (
          <div
            key={index}
            className="absolute left-0 right-0 flex items-center z-10"
            style={{
              top: `${
                (((index + 1) * wordsPerPage) /
                  Math.max(wordCount, wordsPerPage)) *
                100
              }%`,
            }}
          >
            {/* Dotted line */}
            <div className="flex-1 border-t-2 border-dotted border-gray-500"></div>

            {/* Page label */}
            <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300 border border-gray-600 mx-2 shadow-sm">
              {label} {pageNumber}
            </div>

            {/* Dotted line */}
            <div className="flex-1 border-t-2 border-dotted border-gray-500"></div>
          </div>
        );
      })}

      {/* Current page indicator */}
      {showProgress && wordCount > 0 && (
        <div className="absolute top-4 right-4 bg-gray-800/95 px-3 py-2 rounded-lg border border-gray-600 shadow-lg">
          <div className="flex items-center space-x-3 text-xs text-gray-300">
            <span className="font-medium">
              {label} {pageCount + 1}
            </span>

            {wordCount >= wordsPerPage && (
              <>
                <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-gray-400">
                  {wordsIntoCurrentPage}/{wordsPerPage}
                </span>
              </>
            )}
          </div>

          {/* Total word count */}
          <div className="text-xs text-gray-500 mt-1">
            {wordCount.toLocaleString()} words total
          </div>
        </div>
      )}
    </div>
  );
};

// ✨ Usage example for SceneTextEditor integration
// export const withPageIndicators = (
//   EditorComponent: React.ComponentType<any>
// ) => {
//   return (props: any) => {
//     const wordCount = props.content
//       ? props.content.split(/\s+/).filter(Boolean).length
//       : 0;

//     return (
//       <div className="relative">
//         <EditorComponent {...props} />
//         <AdvancedPageIndicator
//           wordCount={wordCount}
//           pageStandard="fiction"
//           showProgress={true}
//           className="absolute inset-0 pointer-events-none"
//         />
//       </div>
//     );
//   };
// };
