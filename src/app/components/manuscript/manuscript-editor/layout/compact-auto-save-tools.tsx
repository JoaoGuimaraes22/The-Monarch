// src/app/components/manuscript/manuscript-editor/layout/compact-auto-save-tools.tsx
// ✨ NEW: Compact 2-line auto-save tools design

import React, { useState } from "react";
import {
  Save,
  Power,
  PowerOff,
  Clock,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { DeleteAllManuscriptButton } from "./delete-all-button";

interface CompactAutoSaveToolsProps {
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isSavingContent: boolean;
  lastSaved: Date | null;
  novelId: string;
  onRefresh: () => void;
  onOpenContextualImport?: () => void; // ADD THIS LINE
}

export const CompactAutoSaveTools: React.FC<CompactAutoSaveToolsProps> = ({
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isSavingContent,
  lastSaved,
  novelId,
  onRefresh,
  onOpenContextualImport,
}) => {
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  return (
    <div className="space-y-2">
      <button
        onClick={onOpenContextualImport}
        className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
      >
        <Upload className="w-3 h-3" />
        <span>Import</span>
      </button>
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

      {/* Line 2: Last Saved + Unsaved Changes + Details Toggle + Delete */}
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
                <span>Unsaved changes</span>
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

      {/* Collapsible Details Section */}
      {showDetails && (
        <div className="pt-2 border-t border-gray-700 space-y-3">
          {/* Detailed Auto-Save Status */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Auto-Save Status:</span>
              <span
                className={autoSaveEnabled ? "text-green-400" : "text-gray-400"}
              >
                {autoSaveEnabled ? "Enabled (2s delay)" : "Disabled"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Last Action:</span>
              <span className="text-gray-300">
                {isSavingContent ? "Saving..." : "Idle"}
              </span>
            </div>

            {lastSaved && (
              <div className="flex justify-between">
                <span className="text-gray-400">Last Save Time:</span>
                <span className="text-gray-300">
                  {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {/* Manual Save Actions */}
          <div className="space-y-2">
            <button
              onClick={handleManualSaveClick}
              disabled={isManualSaving || isSavingContent || !pendingChanges}
              className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                pendingChanges && !isSavingContent && !isManualSaving
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Force Save Now</span>
            </button>

            {/* Additional controls can go here */}
            <div className="text-xs text-gray-500 text-center">
              Changes auto-save every 2 seconds when enabled
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
