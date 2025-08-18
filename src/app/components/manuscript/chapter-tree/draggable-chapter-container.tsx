// src/app/components/manuscript/chapter-tree/draggable-chapter-container.tsx
// Chapter container with drag handles and scene drop support

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Book, Plus, GripVertical } from "lucide-react";
import { Chapter, Scene } from "@/lib/novels";
import { DraggableSceneItem } from "./draggable-scene-item";
import { ToggleButton, WordCountDisplay } from "@/app/components/ui";

interface DraggableChapterContainerProps {
  chapter: Chapter;
  actId: string;
  isSelected: boolean;
  isExpanded: boolean;
  selectedSceneId?: string;
  onToggle: () => void;
  onSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onAddScene?: (chapterId: string) => void;
}

export const DraggableChapterContainer: React.FC<
  DraggableChapterContainerProps
> = ({
  chapter,
  actId,
  isSelected,
  isExpanded,
  selectedSceneId,
  onToggle,
  onSelect,
  onSceneSelect,
  onSceneDelete,
  onAddScene,
}) => {
  // ✅ Make chapter draggable
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chapter.id,
    data: {
      type: "chapter",
      chapter,
      actId,
      sourceIndex: chapter.order,
    },
  });

  // ✅ Make chapter droppable for both scenes AND chapters
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `chapter-${chapter.id}`,
    data: {
      type: "chapter",
      chapter,
      actId,
      accepts: ["scene", "chapter"], // ✅ Accept both scenes and chapters
    },
  });

  // ✅ Combine drag and drop refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sceneIds = chapter.scenes.map((scene) => scene.id);
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        space-y-1 transition-all duration-200
        ${isDragging ? "opacity-50 z-50" : ""}
      `}
    >
      {/* ✅ Chapter Header - Now with drag handle */}
      <div
        className={`
          group flex items-center space-x-2 py-2 px-3 rounded-md cursor-pointer transition-all
          ${
            isSelected
              ? "bg-red-900/30 border-l-2 border-red-500 text-white"
              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
          }
          ${isOver ? "bg-blue-900/20 border border-blue-500" : ""}
          ${isDragging ? "ring-2 ring-yellow-500 bg-yellow-900/20" : ""}
        `}
        onClick={() => onSelect(chapter)}
      >
        {/* ✅ Chapter Drag Handle */}
        <div
          {...dragAttributes}
          {...dragListeners}
          className={`
            opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing
            ${isDragging ? "opacity-100" : ""}
            ${isSelected ? "opacity-100" : ""}
            p-1 hover:bg-gray-600 rounded
          `}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder chapter"
        >
          <GripVertical className="w-3 h-3 text-gray-400" />
        </div>

        {/* Expand/Collapse Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <ToggleButton
            isExpanded={isExpanded}
            onToggle={onToggle}
            size="sm"
            variant="ghost"
            className="flex-shrink-0"
          />
        </div>

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

          {/* Chapter Stats */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-gray-500">
              {chapter.scenes.length} scenes
            </span>
            <span className="text-gray-500">•</span>
            <WordCountDisplay
              count={totalWords}
              variant="compact"
              className="text-gray-500"
            />
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

      {/* ✅ Scenes Container - Only visible when expanded */}
      {isExpanded && (
        <div
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
                actId={actId} // ✅ Pass actId for boundary checking
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
