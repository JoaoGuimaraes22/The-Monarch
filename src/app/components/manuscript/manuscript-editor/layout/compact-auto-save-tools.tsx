// src/app/components/manuscript/manuscript-editor/layout/compact-auto-save-tools.tsx
// ✨ ENHANCED: Now includes structure expand/collapse controls to reduce sidebar clutter

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

  // ✨ NEW: Structure control props
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
  chapterNumberingMode: "per-act" | "continuous";
  onChapterNumberingModeChange: (mode: "per-act" | "continuous") => void;
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
  chapterNumberingMode,
  onChapterNumberingModeChange,
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
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  // ✨ NEW: Get chapter stats for selected act
  const getSelectedActChapterStats = () => {
    const currentAct = getCurrentlySelectedAct();
    if (!currentAct) {
      return {
        expanded: 0,
        total: 0,
        actTitle: "No Act Selected",
      };
    }

    const chaptersInSelectedAct = currentAct.chapters;
    const expandedChaptersInSelectedAct = chaptersInSelectedAct.filter((ch) =>
      expandedChapters.has(ch.id)
    );

    return {
      expanded: expandedChaptersInSelectedAct.length,
      total: chaptersInSelectedAct.length,
      actTitle: currentAct.title,
    };
  };

  return (
    <div className="space-y-2">
      {/* ✨ Import Button - Top of tools */}
      {onOpenContextualImport && (
        <button
          onClick={onOpenContextualImport}
          className="w-full flex items-center justify-center space-x-1 px-2 py-1.5 text-xs bg-red-700 hover:bg-red-600 text-gray-200 hover:text-white border border-red-800 hover:border-red-700 rounded transition-colors"
          title="Import document content"
        >
          <Upload className="w-3 h-3" />
          <span>Import Document</span>
        </button>
      )}

      {/* Auto-Save Section */}
      <div className="space-y-2">
        {/* Line 1: Auto-Save Toggle + Save Now Button */}
        <div className="flex items-center justify-between space-x-2">
          {/* Auto-Save Toggle */}
          <div className="flex items-center space-x-2">
            {autoSaveEnabled ? (
              <Power className="w-3 h-3 text-green-400" />
            ) : (
              <PowerOff className="w-3 h-3 text-gray-400" />
            )}
            <span className="text-xs text-white">Auto-Save</span>
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                autoSaveEnabled ? "bg-green-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  autoSaveEnabled ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Save Now Button */}
          <button
            onClick={handleManualSaveClick}
            disabled={isManualSaving || isSavingContent || !pendingChanges}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              pendingChanges && !isSavingContent && !isManualSaving
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-3 h-3" />
            <span>
              {isManualSaving || isSavingContent
                ? "Saving..."
                : pendingChanges
                ? "Save Now"
                : "No Changes"}
            </span>
          </button>
        </div>

        {/* Line 2: Last Saved + Details Toggle + Delete */}
        <div className="flex items-center justify-between space-x-2">
          {/* Left side: Status info */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1 text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatLastSaved(lastSaved)}</span>
            </div>

            {pendingChanges && (
              <>
                <span className="text-gray-600">•</span>
                <div className="flex items-center space-x-1 text-amber-400">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  <span>Unsaved</span>
                </div>
              </>
            )}
          </div>

          {/* Right side: Details toggle + Delete */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
            >
              {showDetails ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              <span>Details</span>
            </button>

            <DeleteAllManuscriptButton
              novelId={novelId}
              onSuccess={onRefresh}
              size="xs"
            />
          </div>
        </div>
      </div>

      {/* ✨ NEW: Structure Controls Section */}
      <div className="border-t border-gray-700 pt-2">
        {/* Structure Controls Header */}
        <button
          onClick={() => setShowStructureControls(!showStructureControls)}
          className="w-full flex items-center justify-between text-xs text-gray-300 hover:text-white transition-colors mb-2"
        >
          <span className="font-medium">Structure Controls</span>
          {showStructureControls ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {/* Collapsible Structure Controls */}
        {showStructureControls && (
          <div className="space-y-2">
            {/* Acts Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {expandedActs.size} of {novel.acts?.length || 0} acts expanded
              </span>
              <div className="flex space-x-1">
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

            {/* Chapters Controls - Only for Selected Act */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {(() => {
                  const stats = getSelectedActChapterStats();
                  if (stats.total === 0) {
                    return "No act selected";
                  }
                  return `${stats.expanded} of ${stats.total} chapters in "${stats.actTitle}"`;
                })()}
              </span>
              <div className="flex space-x-1">
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
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 font-medium">
                  Chapter Numbering
                </span>
                <div className="flex items-center space-x-2">
                  {/* Toggle Switch */}
                  <button
                    onClick={() =>
                      onChapterNumberingModeChange(
                        chapterNumberingMode === "per-act"
                          ? "continuous"
                          : "per-act"
                      )
                    }
                    className={`
          relative inline-flex h-5 w-9 items-center rounded-full transition-colors 
          ${
            chapterNumberingMode === "continuous"
              ? "bg-blue-600"
              : "bg-gray-600"
          }
        `}
                    title={`Switch to ${
                      chapterNumberingMode === "per-act"
                        ? "continuous"
                        : "per-act"
                    } chapter numbering`}
                  >
                    <span
                      className={`
            inline-block h-3 w-3 transform rounded-full bg-white transition-transform
            ${
              chapterNumberingMode === "continuous"
                ? "translate-x-5"
                : "translate-x-1"
            }
          `}
                    />
                  </button>

                  {/* Current Mode Label */}
                  <span className="text-xs text-gray-400 min-w-0">
                    {chapterNumberingMode === "per-act"
                      ? "Per-Act"
                      : "Continuous"}
                  </span>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-1 text-xs text-gray-500">
                {chapterNumberingMode === "per-act"
                  ? "Each act starts at Chapter 1"
                  : "Chapters numbered 1, 2, 3... across all acts"}
              </div>

              {/* Example Preview */}
              <div className="mt-2 text-xs text-gray-500 bg-gray-800/50 rounded p-2">
                <div className="font-medium text-gray-400 mb-1">Example:</div>
                {chapterNumberingMode === "per-act" ? (
                  <div className="space-y-0.5">
                    <div>Act 1: Ch 1, 2, 3</div>
                    <div>Act 2: Ch 1, 2, 3</div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div>Act 1: Ch 1, 2, 3</div>
                    <div>Act 2: Ch 4, 5, 6</div>
                  </div>
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
              <span className="text-gray-300">
                {formatLastSaved(lastSaved)}
              </span>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-gray-800 rounded p-2">
            <p className="mb-1 font-medium">Auto-Save Info:</p>
            <p>
              Changes are automatically saved after 2 seconds of inactivity when
              auto-save is enabled. Use &#34;Save Now&#34; for immediate saves.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
