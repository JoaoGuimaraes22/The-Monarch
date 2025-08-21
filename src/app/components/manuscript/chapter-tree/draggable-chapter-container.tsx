// src/app/components/manuscript/chapter-tree/draggable-chapter-container.tsx
// ✨ UPDATED: Fixed props to match new positioned adding system + improved 3-line layout

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
  const [isAddingScene, setIsAddingScene] = useState(false);

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

  // Handle add scene
  const handleAddScene = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddScene) return;

    setIsAddingScene(true);
    try {
      await onAddScene(chapter.id); // Add at end of chapter
    } catch (error) {
      console.error("Failed to add scene:", error);
    } finally {
      setIsAddingScene(false);
    }
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
      {/* ✨ IMPROVED: Chapter Header with 3-line layout */}
      <div
        className={`
          group py-2 px-3 rounded-md cursor-pointer transition-all
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
        {/* Line 1: Full width for title with controls */}
        <div className="flex items-center space-x-2 mb-2">
          {/* Drag Handle */}
          <div
            {...dragAttributes}
            {...dragListeners}
            className={`
              drag-handle transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0
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
            className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Chapter Icon */}
          <Book className="w-4 h-4 flex-shrink-0 text-yellow-400" />

          {/* Chapter Number */}
          <span className="text-xs font-medium text-gray-400 flex-shrink-0">
            CH{chapter.order}
          </span>

          {/* ✨ IMPROVED: Full width for title */}
          <div className="flex-1 min-w-0">
            <EditableText
              value={chapter.title}
              onSave={handleUpdateChapterName}
              placeholder="Chapter name"
              className="text-sm font-medium"
              maxLength={100}
              showButtons={false} // Hide inline edit buttons
            />
          </div>
        </div>

        {/* Line 2: Action buttons - only show on hover */}
        <div
          className={`flex items-center justify-between mb-1 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center space-x-1">
            {/* Add Scene Button */}
            {onAddScene && (
              <button
                onClick={handleAddScene}
                disabled={isAddingScene}
                className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                  isAddingScene
                    ? "bg-gray-600 text-gray-400"
                    : "bg-blue-600 hover:bg-blue-500 text-blue-100"
                }`}
                title="Add scene to this chapter"
              >
                <Plus className="w-3 h-3 inline mr-0.5" />
                Scene
              </button>
            )}

            {/* Add Chapter Button */}
            {onAddChapter && (
              <button
                onClick={handleAddChapter}
                disabled={isAddingChapter}
                className={`px-1.5 py-0.5 rounded text-xs transition-colors ${
                  isAddingChapter
                    ? "bg-gray-600 text-gray-400"
                    : "bg-yellow-600 hover:bg-yellow-500 text-yellow-100"
                }`}
                title="Add chapter after this one"
              >
                <Plus className="w-3 h-3 inline mr-0.5" />
                Chapter
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Delete Chapter Button */}
            {onDeleteChapter && (
              <button
                onClick={handleDeleteChapter}
                className="p-1 rounded text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                title="Delete this chapter"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Line 3: Chapter metadata (only in detailed view) */}
        {viewDensity === "detailed" && (
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>
              {chapter.scenes.length} scene
              {chapter.scenes.length !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-600">•</span>
            <WordCountDisplay count={totalWords} variant="compact" />
          </div>
        )}
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
                  onAddScene={onAddScene}
                  viewDensity={viewDensity}
                />
              ))}
          </SortableContext>

          {/* Add Scene at End Button - Show when empty or always available */}
          {chapter.scenes.length === 0 && (
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
                <span>Add first scene</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
