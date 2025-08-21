// src/app/components/manuscript/manuscript-editor/layout/manuscript-header.tsx
// ✅ UPDATED: Always compact view with smaller buttons and icons only

import React from "react";
import { LayoutGrid, FileText } from "lucide-react";

export type ContentDisplayMode = "document" | "grid";

export type ViewMode = "scene" | "chapter" | "act";

interface ManuscriptHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  contentDisplayMode: ContentDisplayMode;
  onContentDisplayModeChange: (mode: ContentDisplayMode) => void;
  title: string;
  subtitle: string;
  hasSelectedScene: boolean;
  isReadOnly: boolean;
}

export const ManuscriptHeader: React.FC<ManuscriptHeaderProps> = ({
  viewMode,
  onViewModeChange,
  contentDisplayMode,
  onContentDisplayModeChange,
  title,
  subtitle,
  hasSelectedScene,
  isReadOnly,
}) => {
  // Only show grid toggle for chapter and act views
  const showGridToggle = viewMode === "chapter" || viewMode === "act";

  // Only show read-only for grid views or when actually read-only
  const shouldShowReadOnlyWarning =
    isReadOnly &&
    hasSelectedScene &&
    viewMode === "scene" && // Only show for scene mode if truly read-only
    contentDisplayMode === "grid"; // Or for grid view

  return (
    <div className="border-b border-gray-700 bg-gray-800">
      {/* ✨ ALWAYS COMPACT: No collapse toggle, details below title */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            {/* ✨ COMPACT LAYOUT: Title with details below */}
            <div>
              <h3 className="text-lg font-semibold text-white truncate">
                {title}
              </h3>
              {/* ✨ SMALLER SUBTITLE: More compact details */}
              <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            {/* Smaller View Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
              {[
                { id: "scene" as const, label: "Scene", icon: "📄" },
                { id: "chapter" as const, label: "Chapter", icon: "📖" },
                { id: "act" as const, label: "Act", icon: "👥" },
              ].map((mode) => {
                const isActive = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onViewModeChange(mode.id)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* Content Display Mode Toggle - Icons Only */}
            {showGridToggle && (
              <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => onContentDisplayModeChange("document")}
                  className={`p-2 rounded text-sm transition-colors ${
                    contentDisplayMode === "document"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                  title="Document View"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onContentDisplayModeChange("grid")}
                  className={`p-2 rounded text-sm transition-colors ${
                    contentDisplayMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-600"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Read-only warning (if needed) */}
        {shouldShowReadOnlyWarning && (
          <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700 rounded px-2 py-1">
            ⚠️ Read-only view
          </div>
        )}
      </div>
    </div>
  );
};

/*
===== COMPACT HEADER CHANGES =====

✅ REMOVED:
- Collapse/expand toggle button
- ChevronDown/ChevronUp icons
- isCollapsed state management
- Conditional subtitle rendering

✅ IMPROVED:
- Always shows compact view
- Title and subtitle always visible
- Tighter spacing with mt-1 on subtitle
- Better responsive design with truncate
- Cleaner layout without toggle clutter

✅ MAINTAINED:
- All existing functionality
- View mode selector
- Content display mode toggle
- Read-only warnings
- Responsive breakpoints

===== VISUAL RESULT =====

Before:
ACT I: The Island and the Boy...  [▼]
Act view • 7,076 words • 13 scenes

After:
ACT I: The Island and the Boy...
Act view • 7,076 words • 13 scenes

Much cleaner and more space-efficient! 🎉
*/
