// src/app/components/manuscript/manuscript-editor/layout/manuscript-header.tsx
// ✅ UPDATED: Use navigationComponent prop to replace title area

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
  // ✅ NEW: Navigation component to replace title area
  navigationComponent?: React.ReactNode;
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
  navigationComponent,
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
    <div className="sticky top-0 z-40 border-b border-gray-700 bg-gray-800">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          {/* ✅ LEFT: Navigation component OR fallback to title */}
          {navigationComponent ? (
            <div className="flex-1 min-w-0">{navigationComponent}</div>
          ) : (
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-400 truncate">{subtitle}</p>
              )}
            </div>
          )}

          {/* ✅ RIGHT: View Mode Controls */}
          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              {[
                { id: "scene" as const, label: "Scene" },
                { id: "chapter" as const, label: "Chapter" },
                { id: "act" as const, label: "Act" },
              ].map((mode) => {
                const isActive = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onViewModeChange(mode.id)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-600"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* Content Display Mode Toggle */}
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
===== CHANGES MADE =====

✅ SIMPLIFIED PROPS:
- Removed all individual navigation props
- Added single navigationComponent?: React.ReactNode prop

✅ CLEAN RENDERING LOGIC:
- If navigationComponent is provided, render it in place of title
- Otherwise fallback to original title + subtitle display
- Keep all view mode controls on the right unchanged

✅ MAINTAINED FUNCTIONALITY:
- All existing view mode controls preserved
- All existing styling and layout preserved
- Clean integration with navigation component

This approach is much cleaner and more flexible!
*/
