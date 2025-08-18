// src/app/components/manuscript/chapter-tree/draggable-manuscript-tree.tsx
// Main component that provides drag-and-drop context for the manuscript tree

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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FileText } from "lucide-react";
import { NovelWithStructure, Scene, Chapter } from "@/lib/novels";
import { SortableChapterContainer } from "./sortable-chapter-container";

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
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This is where we'd handle cross-container moves
    // For now, we'll keep it simple and handle in dragEnd
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveScene(null);

    if (!over || active.id === over.id) {
      return; // No change needed
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "scene") {
      return; // Only handle scene dragging for now
    }

    const activeScene = activeData.scene as Scene;
    const sourceChapterId = activeData.chapterId as string;

    try {
      setIsReordering(true);

      // Case 1: Dropping on another scene (reorder within same chapter or move to different chapter)
      if (overData?.type === "scene") {
        const targetScene = overData.scene as Scene;
        const targetChapterId = overData.chapterId as string;

        console.log("🎯 Scene-to-scene drop:", {
          activeScene: activeScene.id,
          targetScene: targetScene.id,
          sourceChapter: sourceChapterId,
          targetChapter: targetChapterId,
        });

        // Determine new order based on target scene's position
        const newOrder = targetScene.order;

        await reorderScene(activeScene.id, targetChapterId, newOrder);
      }

      // Case 2: Dropping on a chapter container (move to end of chapter)
      else if (overData?.type === "chapter") {
        const targetChapter = overData.chapter as Chapter;
        const targetChapterId = targetChapter.id;

        console.log("🎯 Scene-to-chapter drop:", {
          activeScene: activeScene.id,
          sourceChapter: sourceChapterId,
          targetChapter: targetChapterId,
        });

        // Add to end of target chapter
        const newOrder = targetChapter.scenes.length + 1;

        await reorderScene(activeScene.id, targetChapterId, newOrder);
      }
    } catch (error) {
      console.error("❌ Drag and drop failed:", error);
      alert("Failed to reorder scene. Please try again.");
    } finally {
      setIsReordering(false);
    }
  };

  const reorderScene = async (
    sceneId: string,
    targetChapterId: string,
    newOrder: number
  ) => {
    try {
      console.log("🔄 API call: Reordering scene", {
        sceneId,
        targetChapterId,
        newOrder,
      });

      const response = await fetch(
        `/api/novels/${novel.id}/scenes/${sceneId}/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newChapterId: targetChapterId,
            newOrder,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reorder scene");
      }

      const result = await response.json();
      console.log("✅ Scene reordered successfully:", result);

      // Refresh the manuscript structure
      onRefresh();
    } catch (error) {
      console.error("❌ Scene reorder API failed:", error);
      throw error;
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
      <div className="space-y-4">
        {novel.acts.map((act) => (
          <div key={act.id} className="space-y-2">
            {/* Act Header - Not draggable yet */}
            <div className="flex items-center space-x-2 py-2 px-3 bg-gray-800 rounded-md">
              <span className="text-sm font-bold text-white">{act.title}</span>
              <span className="text-xs text-gray-400">
                {act.chapters.length} chapters
              </span>
            </div>

            {/* Chapters */}
            <div className="ml-4 space-y-1">
              {act.chapters.map((chapter) => (
                <SortableChapterContainer
                  key={chapter.id}
                  chapter={chapter}
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

      {/* Drag Overlay */}
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
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
