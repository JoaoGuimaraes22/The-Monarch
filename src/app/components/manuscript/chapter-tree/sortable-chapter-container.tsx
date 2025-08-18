// src/app/components/manuscript/chapter-tree/sortable-chapter-container.tsx
// Chapter container that supports scene drag-and-drop

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Book, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Chapter, Scene } from "@/lib/novels/";
import { DraggableSceneItem } from "./draggable-scene-item";
import { formatWordCount } from "./utils";

interface SortableChapterContainerProps {
  chapter: Chapter;
  isSelected: boolean;
  isExpanded: boolean;
  selectedSceneId?: string;
  onToggle: () => void;
  onSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onAddScene?: (chapterId: string) => void;
}

export const SortableChapterContainer: React.FC<
  SortableChapterContainerProps
> = ({
  chapter,
  isSelected,
  isExpanded,
  selectedSceneId,
  onToggle,
  onSelect,
  onSceneSelect,
  onSceneDelete,
  onAddScene,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `chapter-${chapter.id}`,
    data: {
      type: "chapter",
      chapter,
      accepts: ["scene"], // This chapter accepts scene drops
    },
  });

  const sceneIds = chapter.scenes.map((scene) => scene.id);
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  return (
    <div className="space-y-1">
      {/* Chapter Header */}
      <div
        className={`
          flex items-center space-x-2 py-2 px-3 rounded-md cursor-pointer transition-all
          ${
            isSelected
              ? "bg-red-900/30 border-l-2 border-red-500 text-white"
              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
          }
          ${isOver ? "bg-blue-900/20 border border-blue-500" : ""}
        `}
        onClick={() => onSelect(chapter)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-1 hover:bg-gray-600 rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Chapter Icon */}
        <Book className="w-4 h-4 text-yellow-400 flex-shrink-0" />

        {/* Chapter Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">
              CH{chapter.order}
            </span>
            <span className="text-sm font-medium truncate">
              {chapter.title}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {chapter.scenes.length} scenes • {formatWordCount(totalWords)}
          </div>
        </div>

        {/* Add Scene Button */}
        {onAddScene && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddScene(chapter.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-600 rounded text-gray-400 hover:text-green-300 transition-opacity"
            title="Add scene"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Scenes Container */}
      {isExpanded && (
        <div
          ref={setNodeRef}
          className={`
            ml-6 space-y-1 min-h-[2rem] transition-all
            ${
              isOver
                ? "bg-blue-900/10 border border-dashed border-blue-500 rounded-md p-2"
                : ""
            }
          `}
        >
          <SortableContext
            items={sceneIds}
            strategy={verticalListSortingStrategy}
          >
            {chapter.scenes.map((scene) => (
              <DraggableSceneItem
                key={scene.id}
                scene={scene}
                chapterId={chapter.id}
                isSelected={selectedSceneId === scene.id}
                onSelect={onSceneSelect}
                onDelete={onSceneDelete}
              />
            ))}
          </SortableContext>

          {/* Drop Zone Indicator */}
          {isOver && chapter.scenes.length === 0 && (
            <div className="text-center py-4 text-sm text-blue-400 bg-blue-900/10 border border-dashed border-blue-500 rounded-md">
              Drop scene here
            </div>
          )}

          {/* Empty State */}
          {!isOver && chapter.scenes.length === 0 && (
            <div className="text-center py-2 text-xs text-gray-500">
              No scenes yet
              {onAddScene && (
                <button
                  onClick={() => onAddScene(chapter.id)}
                  className="ml-2 text-green-400 hover:text-green-300"
                >
                  Add first scene
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
