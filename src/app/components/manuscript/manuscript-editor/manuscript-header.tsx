import React from "react";
import {
  ViewModeSelector,
  ViewMode,
} from "@/app/components/manuscript/view-mode-selector";
import { LayoutGrid, FileText } from "lucide-react";

export type ContentDisplayMode = "document" | "grid";

interface ManuscriptHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  contentDisplayMode: ContentDisplayMode; // ✨ NEW
  onContentDisplayModeChange: (mode: ContentDisplayMode) => void; // ✨ NEW
  title: string;
  subtitle: string;
  hasSelectedScene: boolean;
  isReadOnly: boolean;
}

export const ManuscriptHeader: React.FC<ManuscriptHeaderProps> = ({
  viewMode,
  onViewModeChange,
  contentDisplayMode, // ✨ NEW
  onContentDisplayModeChange, // ✨ NEW
  title,
  subtitle,
  hasSelectedScene,
  isReadOnly,
}) => {
  // Only show grid toggle for chapter and act views
  const showGridToggle = viewMode === "chapter" || viewMode === "act";

  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Selector */}
          <ViewModeSelector
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            disabled={!hasSelectedScene}
          />

          {/* ✨ NEW: Grid/Document Toggle (only for chapter/act views) */}
          {showGridToggle && (
            <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1 border border-gray-600">
              <button
                onClick={() => onContentDisplayModeChange("document")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${
                  contentDisplayMode === "document"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
                title="Document view - stacked scenes"
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
        </div>
      </div>

      {/* Read-only indicator (updated to account for grid view) */}
      {isReadOnly && hasSelectedScene && (
        <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded inline-block">
          {contentDisplayMode === "grid"
            ? "Click any scene card to edit"
            : "Read-only view • Switch to Scene mode to edit"}
        </div>
      )}
    </div>
  );
};
