// src/app/components/manuscript/chapter-tree/draggable-chapter-container.tsx
// ✨ UPDATED: Fixed props to match new positioned adding system + dynamic chapter numbering

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
import { Chapter, Scene, NovelWithStructure } from "@/lib/novels";
import { DraggableSceneItem } from "./draggable-scene-item";
import {
  ToggleButton,
  WordCountDisplay,
  EditableText,
} from "@/app/components/ui";
import { useChapterNumbering } from "@/hooks/manuscript/useChapterNumbering"; // ✨ NEW

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
  // ✨ NEW: Add props for dynamic numbering
  novel?: NovelWithStructure;
  continuousChapterNumbering?: boolean;
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
  novel, // ✨ NEW
  continuousChapterNumbering = false, // ✨ NEW
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingScene, setIsAddingScene] = useState(false);

  // ✨ NEW: Use the chapter numbering hook
  const chapterNumbering = useChapterNumbering(
    novel,
    continuousChapterNumbering
  );

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
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleChapterHeaderClick = () => {
    onSelect(chapter);
  };

  const handleUpdateChapterName = async (newTitle: string) => {
    if (onUpdateChapterName) {
      await onUpdateChapterName(chapter.id, newTitle);
    }
  };

  const handleDeleteChapter = async () => {
    if (!onDeleteChapter) return;

    const confirmMessage = `Delete "${chapter.title}" and all its scenes?`;
    if (window.confirm(confirmMessage)) {
      onDeleteChapter(chapter.id);
    }
  };

  const handleAddChapter = async () => {
    if (!onAddChapter) return;

    setIsAddingChapter(true);
    try {
      await onAddChapter(actId, chapter.id);
    } catch (error) {
      console.error("Failed to add chapter:", error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  const handleAddScene = async () => {
    if (!onAddScene) return;

    setIsAddingScene(true);
    try {
      await onAddScene(chapter.id);
    } catch (error) {
      console.error("Failed to add scene:", error);
    } finally {
      setIsAddingScene(false);
    }
  };

  // Calculate totals
  const totalScenes = chapter.scenes.length;
  const totalWords = chapter.scenes.reduce(
    (sum, scene) => sum + scene.wordCount,
    0
  );

  const sceneIds = chapter.scenes.map((scene) => scene.id);

  return (
    <div className="draggable-chapter-container">
      <div
        ref={(node) => {
          setNodeRef(node);
          setDropNodeRef(node);
        }}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
        ${isDragging ? "opacity-50 z-50" : ""}
        ${isOver ? "bg-blue-900/20 border border-blue-500 rounded" : ""}
      `}
      >
        {/* ✨ IMPROVED: Chapter Header with 3-line layout and dynamic numbering */}
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
          <div className="flex items-center space-x-2 mb-1">
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
              <GripVertical className="w-2.5 h-2.5 text-yellow-400" />
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
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>

            {/* Chapter Icon */}
            <Book className="w-3 h-3 flex-shrink-0 text-yellow-400" />

            {/* ✨ UPDATED: Dynamic Chapter Number */}
            <span className="text-xs font-medium text-gray-400 flex-shrink-0">
              {chapterNumbering.formatDisplay(chapter)}
            </span>

            {/* ✨ IMPROVED: Full width for title */}
            <div className="flex-1 min-w-0">
              <EditableText
                value={chapter.title}
                onSave={handleUpdateChapterName}
                placeholder="Chapter name"
                className="text-xs font-medium"
                maxLength={100}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddScene();
                  }}
                  disabled={isAddingScene}
                  className={`flex items-center space-x-1 px-1.5 py-0.5 text-xs rounded transition-all duration-200 border ${
                    isHovered || isAddingScene
                      ? "bg-green-700 hover:bg-green-600 text-green-100 border-green-700"
                      : "bg-transparent text-green-400 border-green-400 border-dashed hover:bg-green-700 hover:text-green-100 hover:border-green-700 hover:border-solid"
                  }`}
                  title="Add scene to this chapter"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span className="text-xs">
                    {isAddingScene ? "Adding..." : "Scene"}
                  </span>
                </button>
              )}

              {/* Add Chapter Button */}
              {onAddChapter && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddChapter();
                  }}
                  disabled={isAddingChapter}
                  className={`flex items-center space-x-1 px-1.5 py-0.5 text-xs rounded transition-all duration-200 border ${
                    isHovered || isAddingChapter
                      ? "bg-yellow-700 hover:bg-yellow-600 text-yellow-100 border-yellow-700"
                      : "bg-transparent text-yellow-400 border-yellow-400 border-dashed hover:bg-yellow-700 hover:text-yellow-100 hover:border-yellow-700 hover:border-solid"
                  }`}
                  title="Add chapter after this one"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span className="text-xs">
                    {isAddingChapter ? "Adding..." : "Chapter"}
                  </span>
                </button>
              )}
            </div>

            {/* Delete Button - still only show on hover */}
            {onDeleteChapter && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChapter();
                }}
                className={`p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-all duration-200 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                title="Delete this chapter"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Line 3: Stats */}
          {viewDensity === "detailed" && (
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="text-xs">
                {totalScenes} scene{totalScenes !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-600">•</span>
              <WordCountDisplay count={totalWords} variant="compact" />
            </div>
          )}
        </div>

        {/* Thin separator line */}
        <div className="border-b border-gray-600 mx-2"></div>

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
              <div className="ml-2 py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddScene) {
                      onAddScene(chapter.id); // Add at end of chapter
                    }
                  }}
                  className="flex items-center space-x-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span className="text-xs">Add first scene</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
