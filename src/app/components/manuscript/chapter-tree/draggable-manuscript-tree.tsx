// src/app/components/manuscript/chapter-tree/draggable-manuscript-tree.tsx
// ✨ ENHANCED: Complete drag-and-drop with all missing functionality

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FileText, Book, Crown, Plus, Trash2 } from "lucide-react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { DraggableChapterContainer } from "./draggable-chapter-container";
import { EditableText, WordCountDisplay } from "@/app/components/ui";

// ✅ Enhanced Act Drop Container Component with Actions
interface ActDropContainerProps {
  act: Act;
  children: React.ReactNode;
  isSelected?: boolean;
  onActSelect?: (act: Act) => void;
  onAddChapter?: (actId: string) => void;
  onDeleteAct?: (actId: string) => void;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  viewDensity?: "clean" | "detailed"; // ✨ NEW: Control metadata display
}

const ActDropContainer: React.FC<ActDropContainerProps> = ({
  act,
  children,
  isSelected = false,
  onActSelect,
  onAddChapter,
  onDeleteAct,
  onUpdateActName,
  viewDensity = "detailed", // ✨ NEW: Control metadata display
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `act-${act.id}`,
    data: {
      type: "act",
      act,
      accepts: ["chapter"],
    },
  });

  // ✨ NEW: Handle add chapter
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

  // ✨ NEW: Handle act delete
  const handleDeleteAct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteAct) return;

    if (
      window.confirm(`Delete "${act.title}" and all its chapters and scenes?`)
    ) {
      onDeleteAct(act.id);
    }
  };

  // ✨ NEW: Handle act name update
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
      sum + ch.scenes.reduce((chSum, scene) => chSum + scene.wordCount, 0),
    0
  );

  return (
    <div
      ref={setNodeRef}
      className={`
        space-y-2 transition-all duration-200
        ${
          isOver
            ? "bg-gray-700/30 border border-dashed border-yellow-500 rounded-md p-2"
            : ""
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ✨ ENHANCED: Act Header with Actions */}
      <div
        className={`
          group flex items-center space-x-2 py-3 px-4 rounded-md cursor-pointer transition-all
          ${
            isSelected
              ? "bg-amber-900/30 border-l-2 border-amber-500 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-750 hover:text-white"
          }
        `}
        onClick={() => onActSelect?.(act)}
      >
        {/* Act Icon */}
        <Crown className="w-5 h-5 flex-shrink-0 text-amber-400" />

        {/* ✨ NEW: Editable Act Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-amber-400">
              ACT {act.order}
            </span>

            <div className="flex-1 min-w-0">
              <EditableText
                value={act.title}
                onSave={handleUpdateActName}
                placeholder="Act name"
                className="text-lg font-bold"
                maxLength={150}
              />
            </div>
          </div>

          {/* ✨ ENHANCED: Act metadata - Only show in detailed view */}
          {viewDensity === "detailed" && (
            <div className="flex items-center space-x-2 text-xs mt-1">
              <span className="text-gray-400">
                {totalChapters} chapter{totalChapters !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">
                {totalScenes} scene{totalScenes !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500">•</span>
              <WordCountDisplay
                count={totalWords}
                variant="compact"
                className="text-gray-400"
              />
            </div>
          )}
        </div>

        {/* ✨ ENHANCED: Act Action Buttons */}
        <div
          className={`
          flex items-center space-x-1 transition-opacity
          ${
            isHovered || isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }
        `}
        >
          {/* Add Chapter Button */}
          {onAddChapter && (
            <button
              onClick={handleAddChapter}
              disabled={isAddingChapter}
              className={`p-1 rounded text-blue-400 hover:bg-blue-400 hover:text-white transition-colors ${
                isAddingChapter ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Add Chapter"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {/* Delete Act Button */}
          {onDeleteAct && (
            <button
              onClick={handleDeleteAct}
              className="p-1 rounded text-red-400 hover:bg-red-400 hover:text-white transition-colors"
              title="Delete Act"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chapters */}
      {children}

      {/* ✨ NEW: Add Chapter at End Button - Reduced indentation */}
      {(totalChapters === 0 || (isHovered && onAddChapter)) && (
        <div className="ml-2 py-2">
          <button
            onClick={handleAddChapter}
            disabled={isAddingChapter}
            className={`flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors ${
              isAddingChapter ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {isAddingChapter
                ? "Adding chapter..."
                : totalChapters === 0
                ? "Add first chapter"
                : "Add chapter"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

// ✨ ENHANCED: Main Component Props with View Density
interface DraggableManuscriptTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  expandedChapters: Set<string>;
  viewDensity?: "clean" | "detailed"; // ✨ NEW: Control metadata display
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void; // ✨ NEW
  onChapterToggle: (chapterId: string) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onChapterDelete?: (chapterId: string) => void; // ✨ NEW
  onActDelete?: (actId: string) => void; // ✨ NEW
  onAddScene?: (chapterId: string) => void;
  onAddChapter?: (actId: string) => void; // ✨ NEW
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>; // ✨ NEW
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>; // ✨ NEW
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>; // ✨ NEW
  onRefresh: () => void;
}

export const DraggableManuscriptTree: React.FC<
  DraggableManuscriptTreeProps
> = ({
  novel,
  selectedSceneId,
  selectedChapterId,
  selectedActId,
  expandedChapters,
  viewDensity = "detailed", // ✨ NEW: Default to detailed view
  onSceneSelect,
  onChapterSelect,
  onActSelect,
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

  // ✨ API functions (these would typically come from props or hooks)
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
        body: JSON.stringify({ chapterId: newChapterId, newOrder }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reorder scene");
    }

    onRefresh();
  };

  const reorderChapter = async (chapterId: string, newOrder: number) => {
    const response = await fetch(
      `/api/novels/${novel.id}/chapters/${chapterId}/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOrder }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reorder chapter");
    }

    onRefresh();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "scene") {
      setActiveScene(active.data.current.scene);
      setActiveChapter(null);
      setDragType("scene");
    } else if (active.data.current?.type === "chapter") {
      setActiveChapter(active.data.current.chapter);
      setActiveScene(null);
      setDragType("chapter");
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current) return;

    const activeType = active.data.current.type;
    const overType = over.data.current?.type;

    // Add visual feedback based on drag type
    if (activeType === "chapter" && overType === "chapter") {
      console.log("Chapter hovering over chapter");
    } else if (activeType === "scene" && overType === "scene") {
      console.log("Scene hovering over scene");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveScene(null);
    setActiveChapter(null);
    setDragType(null);

    if (!over || active.id === over.id) {
      return; // No change needed
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) {
      return;
    }

    try {
      setIsReordering(true);

      // ✅ SCENE DRAGGING (with act boundary checking)
      if (activeData.type === "scene") {
        const activeScene = activeData.scene as Scene;
        const sourceChapterId = activeData.chapterId as string;
        const sourceActId = activeData.actId as string;

        // Case 1: Scene dropped on another scene
        if (overData.type === "scene") {
          const targetScene = overData.scene as Scene;
          const targetChapterId = overData.chapterId as string;
          const targetActId = overData.actId as string;

          // ✅ CHECK: Prevent cross-act moves
          if (sourceActId !== targetActId) {
            alert(
              "Scenes cannot be moved between acts. Use the move function instead."
            );
            return;
          }

          await reorderScene(
            activeScene.id,
            targetChapterId,
            targetScene.order
          );
        }

        // Case 2: Scene dropped on chapter container
        else if (overData.type === "chapter") {
          const targetChapter = overData.chapter as Chapter;
          const targetActId = overData.actId as string;

          // ✅ CHECK: Prevent cross-act moves
          if (sourceActId !== targetActId) {
            alert(
              "Scenes cannot be moved between acts. Use the move function instead."
            );
            return;
          }

          // Add to end of target chapter
          const newOrder = targetChapter.scenes.length + 1;
          await reorderScene(activeScene.id, targetChapter.id, newOrder);
        }
      }

      // ✅ CHAPTER DRAGGING (within same act only)
      else if (activeData.type === "chapter") {
        const activeChapter = activeData.chapter as Chapter;
        const sourceActId = activeData.actId as string;

        // Case 1: Chapter dropped on another chapter
        if (overData.type === "chapter") {
          const targetChapter = overData.chapter as Chapter;
          const targetActId = overData.actId as string;

          // ✅ CHECK: Only allow within same act
          if (sourceActId !== targetActId) {
            alert(
              "Chapters cannot be moved between acts. Use the move function instead."
            );
            return;
          }

          await reorderChapter(activeChapter.id, targetChapter.order);
        }

        // Case 2: Chapter dropped on act container
        else if (overData.type === "act") {
          const targetActId = overData.actId as string;

          // ✅ CHECK: Only allow within same act
          if (sourceActId !== targetActId) {
            alert(
              "Chapters cannot be moved between acts. Use the move function instead."
            );
            return;
          }

          // Add to end of act
          const targetAct = novel.acts.find((act) => act.id === targetActId);
          if (targetAct) {
            const newOrder = targetAct.chapters.length + 1;
            await reorderChapter(activeChapter.id, newOrder);
          }
        }
      }
    } catch (error) {
      console.error("❌ Drag and drop failed:", error);
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
      {/* ✅ Drag Type Context */}
      <div data-drag-type={dragType} className="space-y-4">
        {novel.acts.map((act) => (
          <ActDropContainer
            key={act.id}
            act={act}
            isSelected={selectedActId === act.id}
            onActSelect={onActSelect}
            onAddChapter={onAddChapter}
            onDeleteAct={onActDelete}
            onUpdateActName={onUpdateActName}
            viewDensity={viewDensity} // ✨ NEW: Pass view density down
          >
            {/* ✅ Chapters in SortableContext - Reduced indentation */}
            <div className="ml-2 space-y-1">
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
                    onDeleteChapter={onChapterDelete} // ✨ NEW
                    onUpdateChapterName={onUpdateChapterName} // ✨ NEW
                    onUpdateSceneName={onUpdateSceneName} // ✨ NEW
                    viewDensity={viewDensity} // ✨ NEW: Pass view density down
                  />
                ))}
              </SortableContext>
            </div>
          </ActDropContainer>
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

      {/* ✅ Enhanced Drag Overlay */}
      <DragOverlay>
        {activeScene ? (
          <div className="bg-gray-700 border border-blue-500 rounded-md p-3 shadow-lg opacity-90">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">
                {activeScene.title || `Scene ${activeScene.order}`}
              </span>
            </div>
          </div>
        ) : activeChapter ? (
          <div className="bg-gray-700 border border-yellow-500 rounded-md p-3 shadow-lg opacity-90">
            <div className="flex items-center space-x-2">
              <Book className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">{activeChapter.title}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
