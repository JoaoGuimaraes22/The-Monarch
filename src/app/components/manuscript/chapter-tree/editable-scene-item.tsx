// ==========================================
// FILE: src/app/components/manuscript/chapter-tree/editable-scene-item.tsx
// ==========================================

import React from "react";
import { TreeItem } from "./tree-item";
import { Scene } from "@/lib/novels";
import { formatWordCount, getSceneStatus } from "./utils";
import { EditableText } from "@/app/components/ui/editable-text";
import { Plus, Trash2 } from "lucide-react";

interface EditableSceneItemProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: (sceneId: string, scene: Scene) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  chapterId: string;
  novelId: string;
}

export const EditableSceneItem: React.FC<EditableSceneItemProps> = ({
  scene,
  isSelected,
  onSelect,
  onAddScene,
  onDeleteScene,
  onUpdateSceneName,
  chapterId,
  novelId,
}) => {
  const status = getSceneStatus(scene);

  const handleUpdateSceneName = async (newTitle: string) => {
    if (onUpdateSceneName) {
      await onUpdateSceneName(scene.id, newTitle);
    } else {
      // Fallback to direct API call
      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${scene.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update scene name");
        }
      } catch (error) {
        console.error("❌ Error updating scene name:", error);
        throw error;
      }
    }
  };

  // Action buttons for add/delete
  const actions = (
    <div className="flex items-center space-x-1">
      {onAddScene && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddScene(chapterId, scene.id);
          }}
          className="p-1 text-green-400 hover:text-green-300 transition-colors"
          title="Add scene after this one"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}
      {onDeleteScene && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteScene(scene.id);
          }}
          className="p-1 text-red-400 hover:text-red-300 transition-colors"
          title="Delete scene"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div
        className={`flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
          isSelected
            ? "bg-red-900 text-white border border-red-700"
            : "hover:bg-gray-700 text-gray-300"
        }`}
        style={{ paddingLeft: `${3 * 16 + 8}px` }}
        onClick={() => onSelect(scene.id, scene)}
      >
        {/* Status Icon */}
        <span className={`text-sm ${status.color}`}>{status.icon}</span>

        {/* Editable Title */}
        <div className="flex-1 min-w-0">
          <EditableText
            value={scene.title || `Scene ${scene.order}`}
            onSave={handleUpdateSceneName}
            placeholder="Scene name"
            className="text-white font-medium"
            maxLength={50}
          />
        </div>

        {/* Word Count */}
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatWordCount(scene.wordCount)}
        </span>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      </div>
    </div>
  );
};
