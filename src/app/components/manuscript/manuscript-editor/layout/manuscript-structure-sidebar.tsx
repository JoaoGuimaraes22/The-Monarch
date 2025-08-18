// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// ✨ ENHANCED: Added view density toggle for clean vs detailed view

import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Eye, BarChart3 } from "lucide-react";
import { CollapsibleSidebar } from "@/app/components/ui";
import { DeleteAllManuscriptButton } from "./delete-all-button";
import { DraggableManuscriptTree } from "../../chapter-tree/draggable-manuscript-tree";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

export type ViewDensity = "clean" | "detailed";

interface ManuscriptStructureSidebarProps {
  novel: NovelWithStructure;
  selectedScene: Scene | null;
  selectedChapterId?: string;
  selectedActId?: string;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onRefresh: () => void;
  onAddScene: (chapterId: string) => Promise<void>;
  onAddChapter: (actId: string) => Promise<void>;
  onAddAct?: (title?: string, insertAfterActId?: string) => Promise<void>;
  onDeleteScene: (sceneId: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onDeleteAct: (actId: string) => Promise<void>;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  left: string;
  width: string;
}

export const ManuscriptStructureSidebar: React.FC<
  ManuscriptStructureSidebarProps
> = ({
  novel,
  selectedScene,
  selectedChapterId,
  selectedActId,
  onSceneSelect,
  onChapterSelect,
  onActSelect,
  onRefresh,
  onAddScene,
  onAddChapter,
  onAddAct,
  onDeleteScene,
  onDeleteChapter,
  onDeleteAct,
  onUpdateActName,
  onUpdateChapterName,
  onUpdateSceneName,
  isCollapsed,
  onToggleCollapse,
  left,
  width,
}) => {
  // ✅ Smart chapter expansion state management
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ✨ NEW: View density state
  const [viewDensity, setViewDensity] = useState<ViewDensity>("detailed");

  // ✅ Initialize with smart defaults
  useEffect(() => {
    if (!novel.acts || novel.acts.length === 0) return;

    const allChapterIds = novel.acts.flatMap((act) =>
      act.chapters.map((chapter) => chapter.id)
    );

    if (allChapterIds.length === 0) return;

    // Smart initialization strategy:
    // 1. If there's a selected scene, expand its chapter
    // 2. If there's a selected chapter, expand it
    // 3. Otherwise, expand the first chapter with scenes
    let targetChapterId: string | null = null;

    if (selectedScene) {
      // Find the chapter containing the selected scene
      for (const act of novel.acts) {
        for (const chapter of act.chapters) {
          if (chapter.scenes.some((scene) => scene.id === selectedScene.id)) {
            targetChapterId = chapter.id;
            break;
          }
        }
        if (targetChapterId) break;
      }
    } else if (selectedChapterId) {
      targetChapterId = selectedChapterId;
    } else if (isFirstLoad) {
      // Find first chapter with scenes
      for (const act of novel.acts) {
        for (const chapter of act.chapters) {
          if (chapter.scenes.length > 0) {
            targetChapterId = chapter.id;
            break;
          }
        }
        if (targetChapterId) break;
      }

      // If no chapter has scenes, just expand the first chapter
      if (!targetChapterId && allChapterIds.length > 0) {
        targetChapterId = allChapterIds[0];
      }
    }

    if (targetChapterId) {
      setExpandedChapters(new Set([targetChapterId]));
    }

    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [novel.acts, selectedScene, selectedChapterId, isFirstLoad]);

  // ✅ Chapter toggle handler
  const handleChapterToggle = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // ✅ Expand/Collapse all chapters
  const handleExpandAll = () => {
    const allChapterIds = novel.acts.flatMap((act) =>
      act.chapters.map((chapter) => chapter.id)
    );
    setExpandedChapters(new Set(allChapterIds));
  };

  const handleCollapseAll = () => {
    setExpandedChapters(new Set());
  };

  // ✨ NEW: Toggle view density
  const toggleViewDensity = () => {
    setViewDensity((prev) => (prev === "clean" ? "detailed" : "clean"));
  };

  // ✨ NEW: Enhanced delete handlers with proper confirmation
  const handleSceneDelete = async (sceneId: string, title: string) => {
    try {
      await onDeleteScene(sceneId);
    } catch (error) {
      console.error("Failed to delete scene:", error);
      alert("Failed to delete scene. Please try again.");
    }
  };

  const handleChapterDelete = async (chapterId: string) => {
    try {
      await onDeleteChapter(chapterId);
    } catch (error) {
      console.error("Failed to delete chapter:", error);
      alert("Failed to delete chapter. Please try again.");
    }
  };

  const handleActDelete = async (actId: string) => {
    try {
      await onDeleteAct(actId);
    } catch (error) {
      console.error("Failed to delete act:", error);
      alert("Failed to delete act. Please try again.");
    }
  };

  // ✅ Provide a default function for onChapterSelect if it's undefined
  const handleChapterSelect =
    onChapterSelect ||
    ((chapter: Chapter) => {
      console.log("Chapter selected:", chapter.title);
      // Auto-expand when selected
      if (!expandedChapters.has(chapter.id)) {
        handleChapterToggle(chapter.id);
      }
    });

  // Collapsed content - show when sidebar is collapsed
  const collapsedContent = (
    <button
      onClick={onToggleCollapse}
      className="p-2 text-gray-400 hover:text-white transition-colors"
      title="Expand Structure"
    >
      <FileText className="w-5 h-5" />
    </button>
  );

  return (
    <CollapsibleSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      title="Manuscript Structure"
      subtitle="Navigate your story • Drag to reorder"
      icon={BookOpen}
      position="left"
      width={width}
      left={left}
      collapsedContent={collapsedContent}
      className="z-20"
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ✅ Enhanced Tools Section */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              TOOLS
            </span>
            <div className="flex items-center space-x-2">
              {/* ✨ NEW: View Density Toggle */}
              <button
                onClick={toggleViewDensity}
                className={`p-1.5 rounded transition-colors text-xs flex items-center space-x-1 ${
                  viewDensity === "clean"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                title={
                  viewDensity === "clean" ? "Show details" : "Hide details"
                }
              >
                {viewDensity === "clean" ? (
                  <>
                    <BarChart3 className="w-3 h-3" />
                    <span>Details</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Clean</span>
                  </>
                )}
              </button>

              {/* ✨ SMALLER: Delete All Button */}
              <DeleteAllManuscriptButton
                novelId={novel.id}
                onSuccess={onRefresh}
                size="sm"
              />
            </div>
          </div>

          {/* ✅ Chapter Expansion Controls - Only show in detailed view */}
          {viewDensity === "detailed" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {expandedChapters.size} of{" "}
                {novel.acts.flatMap((act) => act.chapters).length} chapters
                expanded
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleExpandAll}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Expand All
                </button>
                <span className="text-gray-500">•</span>
                <button
                  onClick={handleCollapseAll}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Enhanced Manuscript Tree */}
        <div className="flex-1 overflow-y-auto p-4">
          <DraggableManuscriptTree
            novel={novel}
            selectedSceneId={selectedScene?.id}
            selectedChapterId={selectedChapterId}
            selectedActId={selectedActId}
            expandedChapters={expandedChapters}
            viewDensity={viewDensity} // ✨ NEW: Pass view density to tree
            onSceneSelect={onSceneSelect}
            onChapterSelect={handleChapterSelect}
            onActSelect={onActSelect}
            onChapterToggle={handleChapterToggle}
            onSceneDelete={handleSceneDelete}
            onChapterDelete={handleChapterDelete}
            onActDelete={handleActDelete}
            onAddScene={onAddScene}
            onAddChapter={onAddChapter}
            onUpdateActName={onUpdateActName}
            onUpdateChapterName={onUpdateChapterName}
            onUpdateSceneName={onUpdateSceneName}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </CollapsibleSidebar>
  );
};
