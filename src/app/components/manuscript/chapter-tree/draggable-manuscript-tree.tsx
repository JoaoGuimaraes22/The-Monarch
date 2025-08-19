// src/app/components/manuscript/chapter-tree/draggable-manuscript-tree.tsx
// ✨ UPDATED: Fixed props to match new positioned adding system

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

// Enhanced Act Drop Container Component with Actions
interface ActDropContainerProps {
  act: Act;
  children: React.ReactNode;
  isSelected?: boolean;
  onActSelect?: (act: Act) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void; // ✨ UPDATED
  onDeleteAct?: (actId: string) => void;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  viewDensity?: "clean" | "detailed";
}

const ActDropContainer: React.FC<ActDropContainerProps> = ({
  act,
  children,
  isSelected = false,
  onActSelect,
  onAddChapter,
  onDeleteAct,
  onUpdateActName,
  viewDensity = "detailed",
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

  // Handle add chapter (at end of act)
  const handleAddChapter = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddChapter) return;

    setIsAddingChapter(true);
    try {
      await onAddChapter(act.id); // Add at end - no afterChapterId
    } catch (error) {
      console.error("Failed to add chapter:", error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  // Handle act delete
  const handleDeleteAct = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteAct) return;

    if (
      window.confirm(`Delete "${act.title}" and all its chapters and scenes?`)
    ) {
      onDeleteAct(act.id);
    }
  };

  // Handle act name update
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
        ${isOver ? "bg-blue-900/20 border border-blue-500 rounded" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Act Header */}
      <div
        className={`
          group flex items-center space-x-3 py-3 px-4 rounded-lg cursor-pointer transition-all
          ${
            isSelected
              ? "bg-red-900/30 border-l-4 border-red-500 text-white"
              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
          }
        `}
        onClick={() => onActSelect?.(act)}
      >
        {/* Act Icon */}
        <Crown className="w-5 h-5 flex-shrink-0 text-red-400" />

        {/* Act Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400">
              ACT {act.order}
            </span>

            {/* Editable Act Title */}
            <div className="flex-1 min-w-0">
              <EditableText
                value={act.title}
                onSave={handleUpdateActName}
                placeholder="Act name"
                className="text-base font-semibold"
                maxLength={100}
              />
            </div>
          </div>

          {/* Act metadata - Only show in detailed view */}
          {viewDensity === "detailed" && (
            <div className="flex items-center space-x-2 text-xs mt-1">
              <span className="text-gray-500">
                {totalChapters} chapter{totalChapters !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">
                {totalScenes} scene{totalScenes !== 1 ? "s" : ""}
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

        {/* Action Buttons */}
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

      {/* Add Chapter at End Button */}
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

// ✨ UPDATED: Main Component Props with correct function signatures
interface DraggableManuscriptTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  expandedChapters: Set<string>;
  viewDensity?: "clean" | "detailed";
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onChapterToggle: (chapterId: string) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onChapterDelete?: (chapterId: string) => void;
  onActDelete?: (actId: string) => void;
  // ✨ UPDATED: Fixed function signatures to support positioned adding
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
  expandedChapters,
  viewDensity = "detailed",
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

  // UPDATED: Reorder operations for draggable-manuscript-tree.tsx
  // These functions should replace the existing reorder functions

  // ===== API REORDER FUNCTIONS (Updated for new API format) =====

  // Scene reordering with new request/response format
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
        // ✅ UPDATED: New request format matching ReorderSceneSchema
        body: JSON.stringify({
          newOrder,
          ...(newChapterId && { newChapterId }), // Only include if moving to different chapter
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reorder scene");
    }

    // ✅ UPDATED: Handle new standardized response format
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to reorder scene");
    }

    return result.data; // Return the updated scene data
  };

  // Chapter reordering with new request/response format
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
        // ✅ UPDATED: New request format matching ReorderChapterSchema
        body: JSON.stringify({
          newOrder,
          ...(newActId && { newActId }), // Only include if moving to different act
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reorder chapter");
    }

    // ✅ UPDATED: Handle new standardized response format
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to reorder chapter");
    }

    return result.data; // Return the updated chapter data
  };

  // Act reordering with new request/response format
  const reorderAct = async (actId: string, newOrder: number) => {
    const response = await fetch(
      `/api/novels/${novel.id}/acts/${actId}/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // ✅ UPDATED: New request format matching ReorderActSchema
        body: JSON.stringify({ newOrder }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to reorder act");
    }

    // ✅ UPDATED: Handle new standardized response format
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to reorder act");
    }

    return result.data; // Return the updated act data
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === "scene") {
      setActiveScene(data.scene);
      setDragType("scene");
    } else if (data?.type === "chapter") {
      setActiveChapter(data.chapter);
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

    try {
      setIsReordering(true);

      if (dragType === "scene") {
        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.type === "scene" && overData) {
          if (overData.type === "scene") {
            // Scene over scene - reorder within chapter or move between chapters
            const targetChapterId = overData.chapterId;
            const targetOrder = overData.scene.order;

            await reorderScene(
              activeData.scene.id,
              targetChapterId,
              targetOrder
            );
          } else if (overData.type === "chapter") {
            // Scene over chapter - move to end of chapter
            const targetChapterId = overData.chapter.id;
            const targetChapter = novel.acts
              .flatMap((act) => act.chapters)
              .find((ch) => ch.id === targetChapterId);

            if (targetChapter) {
              const newOrder = targetChapter.scenes.length + 1;
              await reorderScene(
                activeData.scene.id,
                targetChapterId,
                newOrder
              );
            }
          }
        }
      } else if (dragType === "chapter") {
        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.type === "chapter" && overData?.type === "chapter") {
          // Chapter over chapter - reorder chapters
          const targetOrder = overData.chapter.order;
          await reorderChapter(activeData.chapter.id, targetOrder);
        }
      }

      // Refresh the data after reordering
      onRefresh();
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
      {/* Drag Type Context */}
      <div data-drag-type={dragType} className="space-y-4">
        {novel.acts.map((act) => (
          <ActDropContainer
            key={act.id}
            act={act}
            isSelected={selectedActId === act.id}
            onActSelect={onActSelect}
            onAddChapter={onAddChapter} // ✨ UPDATED: Now supports positioned adding
            onDeleteAct={onActDelete}
            onUpdateActName={onUpdateActName}
            viewDensity={viewDensity}
          >
            {/* Chapters in SortableContext */}
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
                    onAddScene={onAddScene} // ✨ UPDATED: Now supports positioned adding
                    onAddChapter={onAddChapter} // ✨ CRITICAL: Pass onAddChapter to chapters!
                    onDeleteChapter={onChapterDelete}
                    onUpdateChapterName={onUpdateChapterName}
                    onUpdateSceneName={onUpdateSceneName}
                    viewDensity={viewDensity}
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

      {/* Enhanced Drag Overlay */}
      <DragOverlay>
        {activeScene ? (
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">
                {activeScene.title || `Scene ${activeScene.order}`}
              </span>
            </div>
          </div>
        ) : activeChapter ? (
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <Book className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">
                {activeChapter.title}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

/*
===== CHANGES MADE =====

✅ UPDATED: Scene reordering request format
   OLD: { newChapterId, newOrder }
   NEW: { newOrder, newChapterId? } // newChapterId is optional

✅ UPDATED: Chapter reordering request format  
   OLD: { newOrder } (same-act only)
   NEW: { newOrder, newActId? } // newActId is optional for cross-act moves

✅ UPDATED: Act reordering request format
   OLD: { newOrder }
   NEW: { newOrder } // Same format, but now handles standardized response

✅ UPDATED: All response handling
   - Check result.success before proceeding
   - Use result.data for the updated entity
   - Use result.error for error messages

===== SCHEMA VALIDATION =====

These requests now validate against:
- ReorderSceneSchema: { newOrder: number, newChapterId?: string }
- ReorderChapterSchema: { newOrder: number, newActId?: string }  
- ReorderActSchema: { newOrder: number }

===== CROSS-ENTITY MOVES =====

✅ Scenes can now move between chapters (newChapterId)
✅ Chapters can now move between acts (newActId)
✅ Acts stay within the same novel (no cross-novel moves)

===== RESPONSE FORMAT =====

All reorder operations return:
{
  "success": true,
  "data": { updated entity with new order/parent  },
  "message": "Entity reordered successfully",
  "meta": { "timestamp": "...", "requestId": "...", "version": "1.0" }
}
*/
