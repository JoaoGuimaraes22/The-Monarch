// src/app/components/manuscript/chapter-tree/draggable-scene-item.tsx
// ✨ UPDATED: Replaced Edit3 button with + button for adding scenes + transparent add button styling

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, Trash2, Plus } from "lucide-react";
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
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
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
  onAddScene,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingScene, setIsAddingScene] = useState(false);

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
  const handleDeleteScene = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sceneTitle = scene.title || `Scene ${scene.order}`;
    if (window.confirm(`Delete "${sceneTitle}"?`)) {
      onDelete(scene.id, sceneTitle);
    }
  };

  // Handle add scene after this scene
  const handleAddScene = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddScene) return;

    setIsAddingScene(true);
    try {
      await onAddScene(chapterId, scene.id); // Add scene after this scene
    } catch (error) {
      console.error("Failed to add scene:", error);
    } finally {
      setIsAddingScene(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative py-1.5 px-2 rounded-md transition-all duration-200
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
      {/* ✨ IMPROVED: 3-line layout for better title space */}
      {/* Line 1: Full width for title with drag handle and status */}
      <div className="flex items-center space-x-2 mb-1">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`
            drag-handle transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0
            ${
              isDragging || isSelected || isHovered
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }
            p-0.5 hover:bg-gray-600 rounded
          `}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder scene"
        >
          <GripVertical className="w-2.5 h-2.5 text-gray-400" />
        </div>

        {/* Scene Status Icon */}
        <StatusIndicator
          status={scene.status}
          variant="compact"
          showIcon
          showText={false}
          className="flex-shrink-0"
        />

        {/* Scene Number */}
        <span className="text-xs font-medium text-gray-400 flex-shrink-0">
          SC{scene.order}
        </span>

        {/* ✨ IMPROVED: Full width for title */}
        <div className="flex-1 min-w-0">
          <EditableText
            value={scene.title || `Scene ${scene.order}`}
            onSave={handleUpdateSceneName}
            placeholder="Scene name"
            className="text-xs font-medium"
            maxLength={50}
            showButtons={false} // Hide inline edit buttons
          />
        </div>
      </div>

      {/* Line 2: Action buttons - always visible with transparent/dotted style */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          {/* Add Scene Button */}
          {onAddScene && (
            <button
              onClick={handleAddScene}
              disabled={isAddingScene}
              className={`flex items-center space-x-1 px-1.5 py-0.5 text-xs rounded transition-all duration-200 border ${
                isHovered || isAddingScene
                  ? "bg-blue-600 hover:bg-blue-500 text-blue-100 border-blue-600"
                  : "bg-transparent text-blue-400 border-blue-400 border-dashed hover:bg-blue-600 hover:text-blue-100 hover:border-blue-600 hover:border-solid"
              }`}
              title="Add scene after this one"
            >
              <Plus className="w-2.5 h-2.5" />
              <span className="text-xs">
                {isAddingScene ? "Adding..." : "Scene"}
              </span>
            </button>
          )}
        </div>

        {/* Delete Scene Button - still only show on hover */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleDeleteScene}
            className={`p-0.5 rounded text-red-400 hover:bg-red-400 hover:text-white transition-all duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            title="Delete this scene"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Line 3: Scene metadata (only in detailed view) */}
      {viewDensity === "detailed" && (
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <WordCountDisplay
            count={scene.wordCount}
            variant="compact"
            className="text-gray-500"
          />

          {scene.povCharacter && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 truncate text-xs">
                POV: {scene.povCharacter}
              </span>
            </>
          )}

          {scene.sceneType && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 truncate text-xs">
                {scene.sceneType}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
