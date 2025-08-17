// ==========================================
// FILE: src/app/components/manuscript/chapter-tree/enhanced-scene-item.tsx
// ==========================================

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Scene } from "@/lib/novels";
import { formatWordCount, getSceneStatus } from "./utils";
import { EditableText } from "@/app/components/ui/editable-text";

interface EnhancedSceneItemProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateSceneName: (sceneId: string, newTitle: string) => Promise<void>;
  chapterId: string;
  novelId: string;
}

export const EnhancedSceneItem: React.FC<EnhancedSceneItemProps> = ({
  scene,
  isSelected,
  onSelect,
  onDelete,
  onUpdateSceneName,
  chapterId,
  novelId,
}) => {
  const status = getSceneStatus(scene);

  // ✨ NEW: Handle scene name update
  const handleUpdateSceneName = async (newTitle: string) => {
    await onUpdateSceneName(scene.id, newTitle);
  };

  return (
    <div
      className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
        isSelected
          ? "bg-red-900 text-white border border-red-700"
          : "hover:bg-gray-700 text-gray-300"
      }`}
      style={{ paddingLeft: `${2 * 16 + 8}px` }}
      onClick={onSelect}
    >
      {/* Status Icon */}
      <span className={`text-sm ${status.color}`}>{status.icon}</span>

      {/* ✨ ENHANCED: Editable Scene Title */}
      <div className="flex-1 min-w-0">
        <EditableText
          value={scene.title || `Scene ${scene.order}`}
          onSave={handleUpdateSceneName}
          placeholder="Scene name"
          className="text-sm font-medium"
          maxLength={50}
        />
        <div className="text-xs text-gray-400">
          {formatWordCount(scene.wordCount)} words
        </div>
      </div>

      {/* Action Buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex space-x-1">
          <button className="p-0.5 hover:bg-gray-600 rounded">
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                window.confirm(
                  `Delete "${scene.title || `Scene ${scene.order}`}"?`
                )
              ) {
                onDelete();
              }
            }}
            className="p-0.5 hover:bg-gray-600 rounded text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
