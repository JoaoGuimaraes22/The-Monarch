// src/app/components/manuscript/manuscript-editor/content-views/grid-view/scene-card.tsx
// ✨ ENHANCED: Added inline scene name editing functionality

import React from "react";
import { Scene } from "@/lib/novels";
import {
  formatWordCount,
  getSceneStatus,
} from "@/app/components/manuscript/chapter-tree/utils";
import { EditableText } from "@/app/components/ui";

interface SceneCardProps {
  scene: Scene;
  onClick: () => void;
  onRename?: (sceneId: string, newTitle: string) => Promise<void>; // ✨ NEW: Rename handler
  showChapterContext?: boolean; // For act view - show which chapter this scene belongs to
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

  // Get a preview of the scene content (first ~100 characters)
  const getContentPreview = (content: string): string => {
    // Strip HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, " ").trim();
    if (plainText.length <= 100) return plainText;

    // Find a good break point (end of sentence or word)
    const truncated = plainText.substring(0, 100);
    const lastSpace = truncated.lastIndexOf(" ");
    const lastPeriod = truncated.lastIndexOf(".");

    const breakPoint =
      lastPeriod > 80 ? lastPeriod + 1 : lastSpace > 80 ? lastSpace : 100;
    return plainText.substring(0, breakPoint) + "...";
  };

  const preview = getContentPreview(scene.content);

  // ✨ NEW: Handle scene rename
  const handleRename = async (newTitle: string) => {
    if (onRename) {
      await onRename(scene.id, newTitle);
    }
  };

  // ✨ NEW: Handle card click (prevent propagation if editing title)
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if user is interacting with the editable text
    const target = e.target as HTMLElement;
    if (target.closest(".scene-title-editor")) {
      return;
    }
    onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-red-500 hover:bg-gray-750 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span className={`text-lg ${status.color}`}>{status.icon}</span>

          {/* ✨ ENHANCED: Editable Scene Title */}
          <div className="scene-title-editor flex-1 min-w-0">
            {onRename ? (
              <EditableText
                value={scene.title || `Scene ${scene.order}`}
                onSave={handleRename}
                placeholder={`Scene ${scene.order}`}
                className="text-white font-medium text-sm"
                maxLength={100}
              />
            ) : (
              <h4 className="text-white font-medium text-sm truncate">
                {scene.title || `Scene ${scene.order}`}
              </h4>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
          {formatWordCount(scene.wordCount)} words
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
