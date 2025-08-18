// src/app/components/manuscript/chapter-tree/draggable-manuscript-tree.tsx
// Enhanced drag-and-drop for both scenes and chapters

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
import { FileText, Book } from "lucide-react";
import { NovelWithStructure, Scene, Chapter } from "@/lib/novels";
import { DraggableChapterContainer } from "./draggable-chapter-container";

// ✅ Act Drop Container Component
interface ActDropContainerProps {
  actId: string;
  children: React.ReactNode;
}

const ActDropContainer: React.FC<ActDropContainerProps> = ({
  actId,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `act-${actId}`,
    data: {
      type: "act",
      actId,
      accepts: ["chapter"],
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        transition-all duration-200
        ${
          isOver
            ? "bg-gray-700/30 border border-dashed border-yellow-500 rounded-md"
            : ""
        }
      `}
    >
      {children}
    </div>
  );
};

interface DraggableManuscriptTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  expandedChapters: Set<string>;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onChapterToggle: (chapterId: string) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
  onAddScene?: (chapterId: string) => void;
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
  onSceneSelect,
  onChapterSelect,
  onChapterToggle,
  onSceneDelete,
  onAddScene,
  onRefresh,
}) => {
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "scene") {
      setActiveScene(active.data.current.scene);
      setActiveChapter(null);
    } else if (active.data.current?.type === "chapter") {
      setActiveChapter(active.data.current.chapter);
      setActiveScene(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveScene(null);
    setActiveChapter(null);

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

          console.log("🎯 Scene-to-scene drop:", {
            activeScene: activeScene.id,
            targetScene: targetScene.id,
            sourceChapter: sourceChapterId,
            targetChapter: targetChapterId,
          });

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

          console.log("🎯 Scene-to-chapter drop:", {
            activeScene: activeScene.id,
            targetChapter: targetChapter.id,
          });

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

          console.log("🎯 Chapter-to-chapter drop:", {
            activeChapter: activeChapter.id,
            targetChapter: targetChapter.id,
            sameAct: sourceActId === targetActId,
          });

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

          console.log("🎯 Chapter-to-act drop:", {
            activeChapter: activeChapter.id,
            targetAct: targetActId,
          });

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

  // ✅ Scene reorder API call
  const reorderScene = async (
    sceneId: string,
    targetChapterId: string,
    newOrder: number
  ) => {
    const response = await fetch(
      `/api/novels/${novel.id}/scenes/${sceneId}/reorder`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newChapterId: targetChapterId, newOrder }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reorder scene");
    }

    console.log("✅ Scene reordered successfully");
    onRefresh();
  };

  // ✅ Chapter reorder API call
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
      const error = await response.json();
      throw new Error(error.message || "Failed to reorder chapter");
    }

    console.log("✅ Chapter reordered successfully");
    onRefresh();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {novel.acts.map((act) => (
          <div key={act.id} className="space-y-2">
            {/* ✅ Act Header - Now droppable for chapters */}
            <ActDropContainer actId={act.id}>
              <div className="flex items-center space-x-2 py-2 px-3 bg-gray-800 rounded-md">
                <span className="text-sm font-bold text-white">
                  {act.title}
                </span>
                <span className="text-xs text-gray-400">
                  {act.chapters.length} chapters
                </span>
              </div>
            </ActDropContainer>

            {/* ✅ Chapters - Now draggable */}
            <div className="ml-4 space-y-1">
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
                />
              ))}
            </div>
          </div>
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
