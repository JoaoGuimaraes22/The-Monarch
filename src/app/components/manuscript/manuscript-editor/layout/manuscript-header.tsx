import React, { useState } from "react";
import {
  ViewModeSelector,
  ViewMode,
} from "@/app/components/manuscript/manuscript-editor/controls/";
import { LayoutGrid, FileText, ChevronDown, ChevronUp } from "lucide-react";

export type ContentDisplayMode = "document" | "grid";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show grid toggle for chapter and act views
  const showGridToggle = viewMode === "chapter" || viewMode === "act";

  // ✅ FIXED: Remove read-only indicator for chapter/act document views
  // Only show read-only for grid views or when actually read-only
  const shouldShowReadOnlyWarning =
    isReadOnly &&
    hasSelectedScene &&
    viewMode === "scene" && // Only show for scene mode if truly read-only
    contentDisplayMode === "grid"; // Or for grid view

  return (
    <div className="border-b border-gray-700 bg-gray-800">
      {/* ✨ NEW: Collapsible Header Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Title and Subtitle */}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {!isCollapsed && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>

            {/* ✨ NEW: Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title={isCollapsed ? "Expand header" : "Collapse header"}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Controls - Always visible for functionality */}
          <div className="flex items-center space-x-3">
            {/* View Mode Selector */}
            <ViewModeSelector
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              disabled={!hasSelectedScene}
            />

            {/* Grid/Document Toggle (only for chapter/act views) */}
            {showGridToggle && !isCollapsed && (
              <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1 border border-gray-600">
                <button
                  onClick={() => onContentDisplayModeChange("document")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
                    contentDisplayMode === "document"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Document view - editable scenes"
                >
                  <FileText className="w-4 h-4" />
                  <span>Document</span>
                </button>
                <button
                  onClick={() => onContentDisplayModeChange("grid")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
                    contentDisplayMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Grid view - scene cards"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Grid</span>
                </button>
              </div>
            )}

            {/* Compact Grid Toggle for Collapsed State */}
            {showGridToggle && isCollapsed && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onContentDisplayModeChange("document")}
                  className={`p-2 rounded transition-colors ${
                    contentDisplayMode === "document"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Document view"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onContentDisplayModeChange("grid")}
                  className={`p-2 rounded transition-colors ${
                    contentDisplayMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ FIXED: Only show read-only warning when actually needed */}
        {shouldShowReadOnlyWarning && !isCollapsed && (
          <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded inline-block">
            Click any scene card to edit
          </div>
        )}
      </div>
    </div>
  );
};
