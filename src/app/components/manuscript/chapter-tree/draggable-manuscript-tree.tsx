// src/app/components/manuscript/chapter-tree/draggable-manuscript-tree.tsx
// ✨ ENHANCED: Added act collapse/expand functionality

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Crown, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { DraggableChapterContainer } from "./draggable-chapter-container";
import { DraggableSceneItem } from "./draggable-scene-item";
import { EditableText, WordCountDisplay } from "@/app/components/ui";

// ✨ NEW: Act container component with collapse/expand
interface ActContainerProps {
  act: Act;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onActSelect?: (act: Act) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onDeleteAct?: (actId: string) => void;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  viewDensity?: "clean" | "detailed";
  children?: React.ReactNode;
}

const ActContainer: React.FC<ActContainerProps> = ({
  act,
  isSelected,
  isExpanded,
  onToggle,
  onActSelect,
  onAddChapter,
  onDeleteAct,
  onUpdateActName,
  viewDensity = "detailed",
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  const handleActClick = () => {
    if (onActSelect) {
      onActSelect(act);
    }
  };

  const handleAddChapter = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddChapter) return;

    setIsAddingChapter(true);
    try {
      await onAddChapter(act.id);
    } catch (error) {
      console.error("Failed to add chapter:", error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  const handleDeleteAct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteAct) return;

    if (window.confirm(`Delete "${act.title}" and all its content?`)) {
      onDeleteAct(act.id);
    }
  };

  const handleUpdateActName = async (newTitle: string) => {
    if (onUpdateActName) {
      await onUpdateActName(act.id, newTitle);
    }
  };

  // Calculate totals
  const totalChapters = act.chapters.length;
  const totalScenes = act.chapters.reduce(
    (sum, ch) => sum + ch.scenes.length,
    0
  );
  const totalWords = act.chapters.reduce(
    (sum, ch) =>
      sum +
      ch.scenes.reduce((sceneSum, scene) => sceneSum + scene.wordCount, 0),
    0
  );

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group rounded-lg border transition-all duration-200
        ${
          isSelected
            ? "border-red-500 bg-red-500/10"
            : "border-gray-600 hover:border-gray-500"
        }
      `}
    >
      {/* ✨ IMPROVED: Three-line layout for better title space */}
      <div className="p-3">
        {/* Line 1: Full width for title with expand/collapse and icon */}
        <div
          className="flex items-center space-x-2 mb-2"
          onClick={handleActClick}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
            title={isExpanded ? "Collapse act" : "Expand act"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {/* Act Icon */}
          <Crown
            className={`w-5 h-5 flex-shrink-0 ${
              isSelected ? "text-red-400" : "text-purple-400"
            }`}
          />

          {/* ✨ IMPROVED: Full width for title */}
          <div className="flex-1 min-w-0">
            <EditableText
              value={act.title}
              onSave={handleUpdateActName}
              className="font-medium text-white text-base"
              placeholder="Act title..."
              showButtons={false} // Hide inline edit buttons
            />
          </div>
        </div>

        {/* Line 2: Action buttons - only show on hover */}
        <div
          className={`flex items-center justify-between mb-2 transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center space-x-1">
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
                title="Add chapter to this act"
              >
                <Plus className="w-3 h-3 inline mr-0.5" />
                Chapter
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Delete Act Button */}
            {onDeleteAct && (
              <button
                onClick={handleDeleteAct}
                className="p-1 rounded text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                title="Delete this act"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Line 3: Stats (only in detailed view) */}
        {viewDensity === "detailed" && (
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>{totalChapters} chapters</span>
            <span className="text-gray-600">•</span>
            <span>{totalScenes} scenes</span>
            <span className="text-gray-600">•</span>
            <WordCountDisplay count={totalWords} variant="compact" />
          </div>
        )}
      </div>

      {/* Children (chapters) */}
      {isExpanded && children}
    </div>
  );
};

// ✨ ENHANCED: Main component props with act expansion
interface DraggableManuscriptTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  expandedActs: Set<string>; // ✨ NEW: Expanded acts state
  expandedChapters: Set<string>;
  viewDensity?: "clean" | "detailed";
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onActToggle: (actId: string) => void; // ✨ NEW: Act toggle handler
  onChapterToggle: (chapterId: string) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onChapterDelete?: (chapterId: string) => void;
  onActDelete?: (actId: string) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  onRefresh: () => void;
}

export const DraggableManuscriptTree: React.FC<
  DraggableManuscriptTreeProps
> = ({
  novel,
  selectedSceneId,
  selectedChapterId,
  selectedActId,
  expandedActs, // ✨ NEW: Use expanded acts
  expandedChapters,
  viewDensity = "detailed",
  onSceneSelect,
  onChapterSelect,
  onActSelect,
  onActToggle, // ✨ NEW: Act toggle handler
  onChapterToggle,
  onSceneDelete,
  onChapterDelete,
  onActDelete,
  onAddScene,
  onAddChapter,
  onUpdateActName,
  onUpdateChapterName,
  onUpdateSceneName,
  onRefresh,
}) => {
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [dragType, setDragType] = useState<"scene" | "chapter" | null>(null);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    })
  );

  // Scene reordering with API call
  const reorderScene = async (
    sceneId: string,
    newChapterId: string,
    newOrder: number
  ) => {
    const response = await fetch(
      `/api/novels/${novel.id}/scenes/${sceneId}/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newOrder,
          ...(newChapterId && { newChapterId }),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reorder scene");
    }

    return response.json();
  };

  // Chapter reordering with API call
  const reorderChapter = async (
    chapterId: string,
    newActId: string,
    newOrder: number
  ) => {
    const response = await fetch(
      `/api/novels/${novel.id}/chapters/${chapterId}/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newOrder,
          ...(newActId && { newActId }),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reorder chapter");
    }

    return response.json();
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragData = active.data.current;

    if (dragData?.type === "scene") {
      setActiveScene(dragData.scene);
      setDragType("scene");
    } else if (dragData?.type === "chapter") {
      setActiveChapter(dragData.chapter);
      setDragType("chapter");
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveScene(null);
    setActiveChapter(null);
    setDragType(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    setIsReordering(true);

    try {
      // Handle scene reordering
      if (activeData.type === "scene" && overData.type === "scene") {
        const activeScene = activeData.scene;
        const overScene = overData.scene;

        if (activeScene.chapterId !== overScene.chapterId) {
          // Moving to different chapter
          await reorderScene(
            activeScene.id,
            overScene.chapterId,
            overScene.order
          );
        } else {
          // Same chapter reordering
          const newOrder = overScene.order;
          await reorderScene(activeScene.id, overScene.chapterId, newOrder);
        }
      }

      // Handle chapter reordering
      if (activeData.type === "chapter" && overData.type === "chapter") {
        const activeChapter = activeData.chapter;
        const overChapter = overData.chapter;

        if (activeData.actId !== overData.actId) {
          // Moving to different act
          await reorderChapter(
            activeChapter.id,
            overData.actId,
            overChapter.order
          );
        } else {
          // Same act reordering
          await reorderChapter(
            activeChapter.id,
            overData.actId,
            overChapter.order
          );
        }
      }

      // Refresh the tree after successful reorder
      onRefresh();
    } catch (error) {
      console.error("Reorder failed:", error);
      alert("Failed to reorder. Please try again.");
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div data-drag-type={dragType} className="space-y-4">
        {novel.acts.map((act) => (
          <ActContainer
            key={act.id}
            act={act}
            isSelected={selectedActId === act.id}
            isExpanded={expandedActs.has(act.id)} // ✨ NEW: Check if act is expanded
            onToggle={() => onActToggle(act.id)} // ✨ NEW: Toggle act expansion
            onActSelect={onActSelect}
            onAddChapter={onAddChapter}
            onDeleteAct={onActDelete}
            onUpdateActName={onUpdateActName}
            viewDensity={viewDensity}
          >
            {/* Chapters in SortableContext (only shown when act is expanded) */}
            <div className="p-2 space-y-1">
              <SortableContext
                items={act.chapters.map((chapter) => chapter.id)}
                strategy={verticalListSortingStrategy}
              >
                {act.chapters.map((chapter) => (
                  <DraggableChapterContainer
                    key={chapter.id}
                    chapter={chapter}
                    actId={act.id}
                    isSelected={selectedChapterId === chapter.id}
                    isExpanded={expandedChapters.has(chapter.id)}
                    selectedSceneId={selectedSceneId}
                    onToggle={() => onChapterToggle(chapter.id)}
                    onSelect={onChapterSelect}
                    onSceneSelect={onSceneSelect}
                    onSceneDelete={onSceneDelete}
                    onAddScene={onAddScene}
                    onAddChapter={onAddChapter}
                    onDeleteChapter={onChapterDelete}
                    onUpdateChapterName={onUpdateChapterName}
                    onUpdateSceneName={onUpdateSceneName}
                    viewDensity={viewDensity}
                  />
                ))}
              </SortableContext>
            </div>
          </ActContainer>
        ))}

        {/* Loading Overlay */}
        {isReordering && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-white">Reordering...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Drag Overlay */}
      <DragOverlay>
        {activeScene ? (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">
                {activeScene.title || `Scene ${activeScene.order}`}
              </span>
            </div>
          </div>
        ) : activeChapter ? (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">{activeChapter.title}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
