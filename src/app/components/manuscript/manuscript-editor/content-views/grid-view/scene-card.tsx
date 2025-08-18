// src/app/components/manuscript/manuscript-editor/content-views/grid-view/scene-card.tsx
// ✨ ENHANCED: Custom editing layout with buttons on word count line

import React, { useState, useRef, useEffect } from "react";
import { Scene } from "@/lib/novels";
import { Check, X, Edit2 } from "lucide-react";
import {
  formatWordCount,
  getSceneStatus,
} from "@/app/components/manuscript/chapter-tree/utils";

interface SceneCardProps {
  scene: Scene;
  onClick: () => void;
  onRename?: (sceneId: string, newTitle: string) => Promise<void>;
  showChapterContext?: boolean;
  chapterTitle?: string;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  onClick,
  onRename,
  showChapterContext = false,
  chapterTitle,
}) => {
  const status = getSceneStatus(scene);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get a preview of the scene content (first ~100 characters)
  const getContentPreview = (content: string): string => {
    const plainText = content.replace(/<[^>]*>/g, " ").trim();
    if (plainText.length <= 100) return plainText;

    const truncated = plainText.substring(0, 100);
    const lastSpace = truncated.lastIndexOf(" ");
    const lastPeriod = truncated.lastIndexOf(".");

    const breakPoint =
      lastPeriod > 80 ? lastPeriod + 1 : lastSpace > 80 ? lastSpace : 100;
    return plainText.substring(0, breakPoint) + "...";
  };

  const preview = getContentPreview(scene.content);
  const displayTitle = scene.title?.trim() || `Scene ${scene.order}`;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle edit start
  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRename) return;

    setIsEditing(true);
    setEditValue(displayTitle);
  };

  // Handle save
  const handleSave = async () => {
    if (!onRename) return;

    if (editValue.trim() === displayTitle.trim()) {
      setIsEditing(false);
      return;
    }

    if (editValue.trim() === "") {
      setEditValue(displayTitle);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onRename(scene.id, editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setEditValue(displayTitle);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditValue(displayTitle);
    setIsEditing(false);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest(".edit-controls")) return;
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-red-500 hover:bg-gray-750 group"
    >
      {/* Header */}
      <div className="mb-3">
        {/* Title Row */}
        <div className="flex items-center space-x-2 mb-1">
          {/* ✨ SMALLER ICON */}
          <span className={`text-xs ${status.color} flex-shrink-0`}>
            {status.icon}
          </span>

          {/* Title Area */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={100}
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                placeholder={`Scene ${scene.order}`}
                disabled={isSaving}
              />
            ) : (
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium text-sm truncate">
                  {displayTitle}
                </h4>
                {onRename && (
                  <button
                    onClick={handleStartEdit}
                    className="edit-controls opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all ml-2"
                    title="Edit name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ✨ WORD COUNT + BUTTONS ROW */}
        <div className="flex items-center justify-between">
          {/* ✨ SMALLER WORD COUNT */}
          <div className="text-xs text-gray-400">
            {formatWordCount(scene.wordCount)} words
          </div>

          {/* ✨ EDIT BUTTONS ON WORD COUNT LINE */}
          {isEditing && (
            <div className="edit-controls flex items-center space-x-1">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-1 text-green-400 hover:text-green-300 transition-colors"
                title="Save"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chapter context (for act view) */}
      {showChapterContext && chapterTitle && (
        <div className="text-xs text-blue-400 mb-2">{chapterTitle}</div>
      )}

      {/* Content preview */}
      <div className="text-sm text-gray-300 leading-relaxed mb-3 line-clamp-3">
        {preview || "No content yet..."}
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="capitalize">{scene.status}</span>
        {scene.povCharacter && <span>POV: {scene.povCharacter}</span>}
      </div>

      {/* Hover effect indicator */}
      <div className="mt-3 text-xs text-gray-500 group-hover:text-red-400 transition-colors">
        Click to edit →
      </div>
    </div>
  );
};
