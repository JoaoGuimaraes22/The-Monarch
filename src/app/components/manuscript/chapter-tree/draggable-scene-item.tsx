// src/app/components/manuscript/chapter-tree/draggable-scene-item.tsx
// Updated to include actId for boundary checking

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
import { StatusIndicator, WordCountDisplay } from "@/app/components/ui";

interface DraggableSceneItemProps {
  scene: Scene;
  chapterId: string;
  actId: string; // ✅ NEW: For act boundary checking
  isSelected: boolean;
  onSelect: (sceneId: string, scene: Scene) => void;
  onDelete: (sceneId: string, title: string) => void;
  onEditName?: (sceneId: string, currentTitle: string) => void;
}

export const DraggableSceneItem: React.FC<DraggableSceneItemProps> = ({
  scene,
  chapterId,
  actId,
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
      actId, // ✅ Include actId in drag data
      sourceIndex: scene.order,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      onClick={() => onSelect(scene.id, scene)}
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
        title="Drag to reorder scene"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      {/* Scene Icon */}
      <FileText className="w-4 h-4 flex-shrink-0 text-blue-400" />

      {/* Scene Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-400">
            SC{scene.order}
          </span>
          <span className="text-sm truncate">
            {scene.title || `Scene ${scene.order}`}
          </span>
        </div>

        {/* Scene metadata */}
        <div className="flex items-center space-x-2 text-xs">
          <StatusIndicator status={scene.status} variant="compact" />
          <span className="text-gray-500">•</span>
          <WordCountDisplay
            count={scene.wordCount}
            variant="compact"
            className="text-gray-500"
          />
          {scene.povCharacter && (
            <>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 truncate">
                {scene.povCharacter}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Scene Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
        {onEditName && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditName(scene.id, scene.title);
            }}
            className="p-1 hover:bg-blue-600 rounded text-gray-400 hover:text-blue-300"
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
          className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-red-300"
          title="Delete scene"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
