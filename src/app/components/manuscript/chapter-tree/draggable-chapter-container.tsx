// src/app/components/manuscript/chapter-tree/draggable-chapter-container.tsx
// ✨ UPDATED: Fixed props to match new positioned adding system

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Book,
  Plus,
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Chapter, Scene } from "@/lib/novels";
import { DraggableSceneItem } from "./draggable-scene-item";
import {
  ToggleButton,
  WordCountDisplay,
  EditableText,
} from "@/app/components/ui";

interface DraggableChapterContainerProps {
  chapter: Chapter;
  actId: string;
  isSelected: boolean;
  isExpanded: boolean;
  selectedSceneId?: string;
  viewDensity?: "clean" | "detailed";
  onToggle: () => void;
  onSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  // ✨ UPDATED: Fixed function signatures to support positioned adding
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onDeleteChapter?: (chapterId: string) => void;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
}

export const DraggableChapterContainer: React.FC<
  DraggableChapterContainerProps
> = ({
  chapter,
  actId,
  isSelected,
  isExpanded,
  selectedSceneId,
  viewDensity = "detailed",
  onToggle,
  onSelect,
  onSceneSelect,
  onSceneDelete,
  onAddScene,
  onAddChapter,
  onDeleteChapter,
  onUpdateChapterName,
  onUpdateSceneName,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: chapter.id,
    data: {
      type: "chapter",
      chapter,
      actId,
      sourceIndex: chapter.order,
    },
  });

  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: `chapter-${chapter.id}`,
    data: {
      type: "chapter",
      chapter,
      actId,
      accepts: ["scene"],
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // ✨ UPDATED: Handle add chapter (changed from add scene)
  const handleAddChapter = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddChapter) return;

    setIsAddingChapter(true);
    try {
      await onAddChapter(actId, chapter.id); // ✨ Add chapter after this chapter
    } catch (error) {
      console.error("Failed to add chapter:", error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  // Handle delete chapter
  const handleDeleteChapter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteChapter) return;

    if (window.confirm(`Delete "${chapter.title}" and all its scenes?`)) {
      onDeleteChapter(chapter.id);
    }
  };

  // Handle chapter name update
  const handleUpdateChapterName = async (newTitle: string) => {
    if (onUpdateChapterName) {
      await onUpdateChapterName(chapter.id, newTitle);
    }
  };

  // Handle chapter header click
  const handleChapterHeaderClick = () => {
    onSelect(chapter);
  };

  // Scene IDs for sortable context
  const sceneIds = chapter.scenes.map((scene) => scene.id);

  // Calculate totals
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  // Combine node refs
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node);
    setDropNodeRef(node);
  };

  return (
    <div
      ref={combinedRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        transition-all duration-200
        ${isDragging ? "opacity-50 z-50" : ""}
        ${isOver ? "bg-blue-900/20 border border-blue-500 rounded" : ""}
      `}
    >
      {/* Chapter Header */}
      <div
        className={`
          group flex items-center space-x-2 py-2 px-3 rounded-md cursor-pointer transition-all
          ${
            isSelected
              ? "bg-red-900/30 border-l-2 border-red-500 text-white"
              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
          }
          ${isOver ? "bg-blue-900/20 border border-blue-500" : ""}
          ${isDragging ? "bg-yellow-900/20 border border-yellow-500" : ""}
        `}
        onClick={handleChapterHeaderClick}
      >
        {/* Drag Handle */}
        <div
          {...dragAttributes}
          {...dragListeners}
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
          title="Drag to reorder chapter"
        >
          <GripVertical className="w-3 h-3 text-yellow-400" />
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="p-1 hover:bg-gray-600 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Chapter Icon */}
        <Book className="w-4 h-4 flex-shrink-0 text-yellow-400" />

        {/* Chapter Content with Inline Editing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">
              CH{chapter.order}
            </span>

            {/* Editable Chapter Title */}
            <div className="flex-1 min-w-0">
              <EditableText
                value={chapter.title}
                onSave={handleUpdateChapterName}
                placeholder="Chapter name"
                className="text-sm font-medium"
                maxLength={100}
              />
            </div>
          </div>

          {/* Chapter metadata - Only show in detailed view */}
          {viewDensity === "detailed" && (
            <div className="flex items-center space-x-2 text-xs mt-1">
              <span className="text-gray-500">
                {chapter.scenes.length} scene
                {chapter.scenes.length !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500">•</span>
              <WordCountDisplay
                count={totalWords}
                variant="compact"
                className="text-gray-500"
              />
            </div>
          )}
        </div>

        {/* ✨ UPDATED: Action Buttons - + now adds chapter */}
        <div
          className={`
          chapter-actions flex items-center space-x-1 transition-opacity
          ${
            isHovered || isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }
        `}
        >
          {/* ✨ UPDATED: Add Chapter Button (was Add Scene) */}
          {onAddChapter && (
            <button
              onClick={handleAddChapter}
              disabled={isAddingChapter}
              className={`p-1 rounded text-blue-400 hover:bg-blue-400 hover:text-white transition-colors ${
                isAddingChapter ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Add Chapter After This"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Delete Chapter Button */}
          {onDeleteChapter && (
            <button
              onClick={handleDeleteChapter}
              className="p-1 rounded text-red-400 hover:bg-red-400 hover:text-white transition-colors"
              title="Delete Chapter"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scenes List */}
      {isExpanded && (
        <div className="ml-4 space-y-1">
          <SortableContext
            items={sceneIds}
            strategy={verticalListSortingStrategy}
          >
            {chapter.scenes
              .sort((a, b) => a.order - b.order)
              .map((scene) => (
                <DraggableSceneItem
                  key={scene.id}
                  scene={scene}
                  chapterId={chapter.id}
                  actId={actId}
                  isSelected={selectedSceneId === scene.id}
                  onSelect={onSceneSelect}
                  onDelete={onSceneDelete}
                  onUpdateSceneName={onUpdateSceneName}
                  onAddScene={onAddScene} // ✨ Pass add scene handler to scenes
                  viewDensity={viewDensity}
                />
              ))}
          </SortableContext>

          {/* ✨ KEPT: Add Scene at End Button - Show when empty or always available */}
          {(chapter.scenes.length === 0 || (isHovered && onAddScene)) && (
            <div className="ml-2 py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAddScene) {
                    onAddScene(chapter.id); // Add at end of chapter
                  }
                }}
                className="flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {chapter.scenes.length === 0
                    ? "Add first scene"
                    : "Add scene"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
