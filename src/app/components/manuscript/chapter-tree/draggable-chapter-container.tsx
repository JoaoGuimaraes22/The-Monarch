// src/app/components/manuscript/chapter-tree/draggable-chapter-container.tsx
// ✨ ENHANCED: Added inline editing, add/delete buttons, and improved UX

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
  viewDensity?: "clean" | "detailed"; // ✨ NEW: Control metadata display
  onToggle: () => void;
  onSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onAddScene?: (chapterId: string) => void;
  onDeleteChapter?: (chapterId: string) => void; // ✨ NEW: Delete chapter
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>; // ✨ NEW: Inline editing
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>; // ✨ NEW: Pass through to scenes
}

export const DraggableChapterContainer: React.FC<
  DraggableChapterContainerProps
> = ({
  chapter,
  actId,
  isSelected,
  isExpanded,
  selectedSceneId,
  viewDensity = "detailed", // ✨ NEW: Default to detailed view
  onToggle,
  onSelect,
  onSceneSelect,
  onSceneDelete,
  onAddScene,
  onDeleteChapter,
  onUpdateChapterName,
  onUpdateSceneName,
}) => {
  const [isHovered, setIsHovered] = useState(false); // ✨ NEW: Hover state
  const [isAddingScene, setIsAddingScene] = useState(false); // ✨ NEW: Loading state

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
      accepts: ["scene", "chapter"],
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

  // ✨ NEW: Handle add scene with loading state
  const handleAddScene = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // ✨ NEW: Handle chapter delete with confirmation
  const handleDeleteChapter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteChapter) return;

    const chapterTitle = chapter.title;
    if (window.confirm(`Delete "${chapterTitle}" and all its scenes?`)) {
      onDeleteChapter(chapter.id);
    }
  };

  // ✨ NEW: Handle chapter name update
  const handleUpdateChapterName = async (newTitle: string) => {
    if (onUpdateChapterName) {
      await onUpdateChapterName(chapter.id, newTitle);
    }
  };

  // ✨ NEW: Handle chapter header click (select + toggle)
  const handleChapterHeaderClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons or drag handle
    if ((e.target as HTMLElement).closest(".chapter-actions, .drag-handle")) {
      return;
    }

    onSelect(chapter);
    onToggle();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        space-y-1 transition-all duration-200
        ${isDragging ? "opacity-50 z-50" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)} // ✨ NEW: Track hover
      onMouseLeave={() => setIsHovered(false)} // ✨ NEW: Track hover
    >
      {/* ✅ Enhanced Chapter Header */}
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
        {/* ✨ ENHANCED: Drag Handle - Show on hover or when selected */}
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

        {/* ✨ ENHANCED: Expand/Collapse Toggle */}
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

        {/* ✨ ENHANCED: Chapter Content with Inline Editing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">
              CH{chapter.order}
            </span>

            {/* ✨ NEW: Editable Chapter Title */}
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

          {/* ✨ ENHANCED: Chapter metadata - Only show in detailed view */}
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

        {/* ✨ ENHANCED: Action Buttons - Show on hover or when selected */}
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
          {/* Add Scene Button */}
          {onAddScene && (
            <button
              onClick={handleAddScene}
              disabled={isAddingScene}
              className={`p-1 rounded text-green-400 hover:bg-green-400 hover:text-white transition-colors ${
                isAddingScene ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Add Scene"
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

      {/* ✅ Enhanced Scenes List - Reduced indentation */}
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
                  onUpdateSceneName={onUpdateSceneName} // ✨ NEW: Pass through editing
                  viewDensity={viewDensity} // ✨ NEW: Pass view density to scenes
                />
              ))}
          </SortableContext>

          {/* ✨ ENHANCED: Add Scene at End Button - Show when empty or always available */}
          {(chapter.scenes.length === 0 || (isHovered && onAddScene)) && (
            <div className="ml-2 py-2">
              <button
                onClick={handleAddScene}
                disabled={isAddingScene}
                className={`flex items-center space-x-2 text-sm text-green-400 hover:text-green-300 transition-colors ${
                  isAddingScene ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {isAddingScene
                    ? "Adding scene..."
                    : chapter.scenes.length === 0
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
