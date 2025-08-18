// src/app/components/manuscript/chapter-tree/draggable-scene-item.tsx
// Enhanced scene item with drag-and-drop functionality

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";
import { Scene } from "@/lib/novels";
import { formatWordCount, getSceneStatus } from "./utils";

interface DraggableSceneItemProps {
  scene: Scene;
  chapterId: string;
  isSelected: boolean;
  onSelect: (sceneId: string, scene: Scene) => void;
  onDelete: (sceneId: string, title: string) => void;
  onEditName?: (sceneId: string, currentTitle: string) => void;
}

export const DraggableSceneItem: React.FC<DraggableSceneItemProps> = ({
  scene,
  chapterId,
  isSelected,
  onSelect,
  onDelete,
  onEditName,
}) => {
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
      sourceIndex: scene.order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sceneStatus = getSceneStatus(scene);

  return (
    <div
      ref={setNodeRef}
      style={style}
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
        cursor-pointer select-none
      `}
      onClick={() => onSelect(scene.id, scene)} // ✅ Fixed: Pass scene object, not scene.id
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`
          opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing
          ${isDragging ? "opacity-100" : ""}
          ${isSelected ? "opacity-100" : ""}
          p-1 hover:bg-gray-600 rounded
        `}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      {/* Scene Icon */}
      <FileText
        className={`w-4 h-4 flex-shrink-0 ${
          isDragging ? "text-blue-400" : "text-blue-400"
        }`}
      />

      {/* Scene Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          {/* Scene Number */}
          <span className="text-xs font-medium text-gray-400">
            SC{scene.order}
          </span>

          {/* Scene Title */}
          <span className="text-sm truncate font-medium">
            {scene.title || `Scene ${scene.order}`}
          </span>

          {/* Status Indicator */}
          <span className={`text-xs ${sceneStatus.color}`}>
            {sceneStatus.icon}
          </span>
        </div>

        {/* Word Count */}
        <div className="text-xs text-gray-500">
          {formatWordCount(scene.wordCount)}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        {onEditName && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditName(scene.id, scene.title || `Scene ${scene.order}`);
            }}
            className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
            title="Edit scene name"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(scene.id, scene.title || `Scene ${scene.order}`);
          }}
          className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-red-300 transition-colors"
          title="Delete scene"
        >
          <Trash2 className="w-3 h-3" />
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>

      {/* Enhanced Drag Visual Indicators */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 border border-blue-500 rounded-md pointer-events-none" />
      )}

      {/* Drop Indicator */}
      {isOver && !isDragging && (
        <div className="absolute left-0 top-0 w-1 h-full bg-blue-400 rounded-r" />
      )}
    </div>
  );
};
