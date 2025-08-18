// src/app/components/manuscript/chapter-tree/draggable-scene-item.tsx
// ✨ UPDATED: Replaced Edit3 button with + button for adding scenes

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, Trash2, Plus } from "lucide-react"; // ✨ UPDATED: Removed Edit3, added Plus
import { Scene } from "@/lib/novels";
import {
  StatusIndicator,
  WordCountDisplay,
  EditableText,
} from "@/app/components/ui";

interface DraggableSceneItemProps {
  scene: Scene;
  chapterId: string;
  actId: string;
  isSelected: boolean;
  viewDensity?: "clean" | "detailed";
  onSelect: (sceneId: string, scene: Scene) => void;
  onDelete: (sceneId: string, title: string) => void;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void; // ✨ NEW: Add scene handler
}

export const DraggableSceneItem: React.FC<DraggableSceneItemProps> = ({
  scene,
  chapterId,
  actId,
  isSelected,
  viewDensity = "detailed",
  onSelect,
  onDelete,
  onUpdateSceneName,
  onAddScene, // ✨ NEW: Add scene handler
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: scene.id,
    data: {
      type: "scene",
      scene,
      chapterId,
      actId,
      sourceIndex: scene.order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle scene name update
  const handleUpdateSceneName = async (newTitle: string) => {
    if (onUpdateSceneName) {
      await onUpdateSceneName(scene.id, newTitle);
    }
  };

  // Handle delete with confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sceneTitle = scene.title || `Scene ${scene.order}`;
    if (window.confirm(`Delete "${sceneTitle}"?`)) {
      onDelete(scene.id, sceneTitle);
    }
  };

  // ✨ NEW: Handle add scene after this scene
  const handleAddScene = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddScene) {
      onAddScene(chapterId, scene.id); // Add scene after this scene
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex items-center space-x-2 py-2 px-3 rounded-md transition-all duration-200
        ${
          isDragging
            ? "opacity-50 bg-gray-700/50 shadow-lg z-50 ring-2 ring-blue-500"
            : ""
        }
        ${isOver ? "bg-blue-900/20 border-l-2 border-blue-400" : ""}
        ${
          isSelected
            ? "bg-red-900/30 border-l-2 border-red-500 text-white"
            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
        }
      `}
      onClick={() => onSelect(scene.id, scene)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`
          drag-handle transition-opacity cursor-grab active:cursor-grabbing
          ${
            isDragging || isSelected || isHovered
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }
          p-1 hover:bg-gray-600 rounded
        `}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder scene"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      {/* Scene Status Icon */}
      <StatusIndicator
        status={scene.status}
        variant="compact"
        showIcon
        showText={false}
        className="flex-shrink-0"
      />

      {/* Scene Content with Inline Editing */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-400">
            SC{scene.order}
          </span>

          {/* Editable Scene Title */}
          <div className="flex-1 min-w-0">
            <EditableText
              value={scene.title || `Scene ${scene.order}`}
              onSave={handleUpdateSceneName}
              placeholder="Scene name"
              className="text-sm font-medium"
              maxLength={50}
            />
          </div>
        </div>

        {/* Scene metadata - Only show in detailed view */}
        {viewDensity === "detailed" && (
          <div className="flex items-center space-x-2 text-xs mt-1">
            <WordCountDisplay
              count={scene.wordCount}
              variant="compact"
              className="text-gray-500"
            />

            {scene.povCharacter && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 truncate">
                  POV: {scene.povCharacter}
                </span>
              </>
            )}

            {scene.sceneType && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 truncate">
                  {scene.sceneType}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* ✨ UPDATED: Action Buttons - Replaced Edit3 with Add Scene */}
      <div
        className={`
        flex items-center space-x-1 transition-opacity
        ${
          isHovered || isSelected
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }
      `}
      >
        {/* ✨ NEW: Add Scene Button (replaces Edit3 button) */}
        {onAddScene && (
          <button
            onClick={handleAddScene}
            className="p-1 hover:bg-green-600 rounded text-gray-400 hover:text-green-300 transition-colors"
            title="Add scene after this"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-red-300 transition-colors"
          title="Delete scene"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
