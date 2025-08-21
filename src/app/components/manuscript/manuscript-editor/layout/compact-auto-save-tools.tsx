// src/app/components/manuscript/manuscript-editor/layout/compact-auto-save-tools.tsx
// ✨ ENHANCED: Now includes continuous chapter numbering toggle

import React, { useState } from "react";
import {
  Save,
  Power,
  PowerOff,
  Clock,
  Eye,
  EyeOff,
  Upload,
  ChevronDown,
  ChevronUp,
  Hash, // New icon for numbering
} from "lucide-react";
import { DeleteAllManuscriptButton } from "./delete-all-button";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

interface CompactAutoSaveToolsProps {
  // Auto-save props
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isSavingContent: boolean;
  lastSaved: Date | null;
  novelId: string;
  onRefresh: () => void;
  onOpenContextualImport?: () => void;

  // Structure control props
  novel: NovelWithStructure;
  selectedScene: Scene | null;
  selectedChapterId?: string;
  selectedActId?: string;
  expandedActs: Set<string>;
  expandedChapters: Set<string>;
  onExpandAllActs: () => void;
  onCollapseAllActs: () => void;
  onExpandAllChapters: () => void;
  onCollapseAllChapters: () => void;
  getCurrentlySelectedAct: () => Act | null;

  // ✨ NEW: Chapter numbering props
  continuousChapterNumbering: boolean;
  setContinuousChapterNumbering: (enabled: boolean) => void;
}

export const CompactAutoSaveTools: React.FC<CompactAutoSaveToolsProps> = ({
  // Auto-save props
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isSavingContent,
  lastSaved,
  novelId,
  onRefresh,
  onOpenContextualImport,

  // Structure control props
  novel,
  selectedScene,
  selectedChapterId,
  selectedActId,
  expandedActs,
  expandedChapters,
  onExpandAllActs,
  onCollapseAllActs,
  onExpandAllChapters,
  onCollapseAllChapters,
  getCurrentlySelectedAct,

  // ✨ NEW: Chapter numbering props
  continuousChapterNumbering,
  setContinuousChapterNumbering,
}) => {
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showStructureControls, setShowStructureControls] = useState(false);

  const handleManualSaveClick = async () => {
    setIsManualSaving(true);
    try {
      await handleManualSave();
    } finally {
      setIsManualSaving(false);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Auto-Save Section */}
      <div className="space-y-3">
        {/* Primary Controls Row */}
        <div className="flex items-center justify-between">
          {/* Auto-save toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`p-1.5 rounded transition-colors ${
                autoSaveEnabled
                  ? "text-green-400 hover:text-green-300 bg-green-900/20"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              title={autoSaveEnabled ? "Disable auto-save" : "Enable auto-save"}
            >
              {autoSaveEnabled ? (
                <Power className="w-4 h-4" />
              ) : (
                <PowerOff className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-gray-400">
              {autoSaveEnabled ? "Auto" : "Manual"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* Manual save button */}
            <button
              onClick={handleManualSaveClick}
              disabled={isManualSaving || isSavingContent}
              className={`p-1.5 rounded transition-colors ${
                pendingChanges
                  ? "text-amber-400 hover:text-amber-300 bg-amber-900/20"
                  : "text-green-400 hover:text-green-300"
              } ${
                isManualSaving || isSavingContent
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              title={
                pendingChanges ? "Save pending changes" : "Save (up to date)"
              }
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Contextual import button */}
            {onOpenContextualImport && (
              <button
                onClick={onOpenContextualImport}
                className="p-1.5 rounded text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 transition-colors"
                title="Import content"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}

            {/* Details toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1.5 rounded text-gray-400 hover:text-gray-300 transition-colors"
              title={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Status and Last Saved */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isSavingContent
                  ? "bg-blue-400 animate-pulse"
                  : pendingChanges
                  ? "bg-amber-400"
                  : "bg-green-400"
              }`}
            />
            <span className="text-gray-400">
              {isSavingContent
                ? "Saving..."
                : pendingChanges
                ? "Changes pending"
                : "Saved"}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatLastSaved(lastSaved)}</span>
          </div>
        </div>
      </div>

      {/* Collapsible Structure Controls Section */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wider">
            Structure Controls
          </h4>
          <button
            onClick={() => setShowStructureControls(!showStructureControls)}
            className="p-1 rounded text-gray-400 hover:text-gray-300 transition-colors"
            title={
              showStructureControls ? "Collapse controls" : "Expand controls"
            }
          >
            {showStructureControls ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {showStructureControls && (
          <div className="space-y-3">
            {/* Acts Controls */}
            <div className="space-y-2">
              <h5 className="text-xs text-gray-400 font-medium">Acts</h5>
              <div className="flex items-center justify-between">
                <button
                  onClick={onExpandAllActs}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-1"
                >
                  Expand All Acts
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={onCollapseAllActs}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-1"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Chapters Controls */}
            <div className="space-y-2">
              <h5 className="text-xs text-gray-400 font-medium">Chapters</h5>
              <div className="flex items-center justify-between">
                <button
                  onClick={onExpandAllChapters}
                  disabled={!getCurrentlySelectedAct()}
                  className={`text-xs transition-colors px-1 ${
                    getCurrentlySelectedAct()
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Expand All Chapters
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={onCollapseAllChapters}
                  disabled={!getCurrentlySelectedAct()}
                  className={`text-xs transition-colors px-1 ${
                    getCurrentlySelectedAct()
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* ✨ NEW: Chapter Numbering Toggle */}
            <div className="space-y-2">
              <h5 className="text-xs text-gray-400 font-medium">
                Chapter Numbering
              </h5>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    Continuous numbering
                  </span>
                </div>
                <button
                  onClick={() =>
                    setContinuousChapterNumbering(!continuousChapterNumbering)
                  }
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    continuousChapterNumbering ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  title={
                    continuousChapterNumbering
                      ? "Switch to per-act numbering (ACT 1: Ch 1,2,3 ACT 2: Ch 1,2,3)"
                      : "Switch to continuous numbering (ACT 1: Ch 1,2,3 ACT 2: Ch 4,5,6)"
                  }
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      continuousChapterNumbering
                        ? "translate-x-3.5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Numbering explanation */}
              <div className="text-xs text-gray-500 pl-5">
                {continuousChapterNumbering ? (
                  <span>ACT 1: Ch 1,2,3 • ACT 2: Ch 4,5,6</span>
                ) : (
                  <span>ACT 1: Ch 1,2,3 • ACT 2: Ch 1,2,3</span>
                )}
              </div>
            </div>

            {/* Novel Stats */}
            <div className="flex items-center space-x-4 text-xs text-gray-400 pt-1 border-t border-gray-700">
              <span>{novel.acts?.length || 0} acts</span>
              <span className="text-gray-600">•</span>
              <span>
                {novel.acts?.flatMap((act) => act.chapters).length || 0}{" "}
                chapters
              </span>
              <span className="text-gray-600">•</span>
              <span>
                {novel.acts
                  ?.flatMap((act) => act.chapters)
                  .flatMap((ch) => ch.scenes).length || 0}{" "}
                scenes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Collapsible Auto-Save Details Section */}
      {showDetails && (
        <div className="pt-2 border-t border-gray-700 space-y-3">
          {/* Detailed Auto-Save Status */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Auto-Save Status:</span>
              <span
                className={autoSaveEnabled ? "text-green-400" : "text-gray-400"}
              >
                {autoSaveEnabled ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Content Status:</span>
              <span
                className={
                  isSavingContent
                    ? "text-blue-400"
                    : pendingChanges
                    ? "text-amber-400"
                    : "text-green-400"
                }
              >
                {isSavingContent
                  ? "Saving..."
                  : pendingChanges
                  ? "Unsaved changes"
                  : "All saved"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Saved:</span>
              <span className="text-gray-400">
                {formatLastSaved(lastSaved)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={onRefresh}
              className="w-full px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Refresh Novel
            </button>

            <DeleteAllManuscriptButton
              novelId={novelId}
              onSuccess={onRefresh}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
