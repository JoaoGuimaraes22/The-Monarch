// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// ✨ ENHANCED: Complete scrollable design with proper fixed/scrollable areas

import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { CollapsibleSidebar, WordCountDisplay } from "@/app/components/ui";
import { CompactAutoSaveTools } from "./compact-auto-save-tools";
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
  onAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  onAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
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
  // ✨ Auto-save props
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isSavingContent: boolean;
  lastSaved: Date | null;
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
  // Auto-save props
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isSavingContent,
  lastSaved,
}) => {
  // Smart chapter expansion state management
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // View density state
  const [viewDensity, setViewDensity] = useState<ViewDensity>("detailed");

  // Initialize with smart defaults
  useEffect(() => {
    if (!novel.acts || novel.acts.length === 0) return;

    const allChapterIds = novel.acts.flatMap((act) =>
      act.chapters.map((chapter) => chapter.id)
    );

    if (allChapterIds.length === 0) return;

    // Smart initialization strategy
    if (isFirstLoad) {
      if (selectedScene) {
        // Find and expand the chapter containing the selected scene
        const selectedChapter = novel.acts
          .flatMap((act) => act.chapters)
          .find((chapter) =>
            chapter.scenes.some((scene) => scene.id === selectedScene.id)
          );

        if (selectedChapter) {
          setExpandedChapters(new Set([selectedChapter.id]));
        }
      } else if (allChapterIds.length <= 5) {
        // Auto-expand if few chapters
        setExpandedChapters(new Set(allChapterIds));
      } else {
        // Expand only first chapter
        setExpandedChapters(new Set([allChapterIds[0]]));
      }
      setIsFirstLoad(false);
    }
  }, [novel.acts, selectedScene, isFirstLoad]);

  // Collapsed content for sidebar
  const collapsedContent = (
    <div className="flex flex-col items-center space-y-3">
      <BookOpen className="w-6 h-6 text-gray-400" />
      <WordCountDisplay
        count={novel.wordCount || 0}
        variant="compact"
        className="text-xs"
      />
    </div>
  );

  return (
    <CollapsibleSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      left={left}
      width={width}
      title="Structure"
      collapsedContent={collapsedContent}
      position="left"
    >
      {/* ✅ ENHANCED: Better container structure for scrolling */}
      <div className="h-full flex flex-col">
        {/* ✅ FIXED HEADER: This stays at the top, doesn't scroll */}
        <div className="flex-shrink-0 border-b border-gray-700 bg-gray-800">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">TOOLS</h3>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() =>
                    setViewDensity(
                      viewDensity === "clean" ? "detailed" : "clean"
                    )
                  }
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title={`Switch to ${
                    viewDensity === "clean" ? "detailed" : "clean"
                  } view`}
                >
                  {viewDensity === "clean" ? "Detailed" : "Clean"}
                </button>
              </div>
            </div>

            {/* ✅ Auto-Save Tools - Fixed at top */}
            <CompactAutoSaveTools
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              handleManualSave={handleManualSave}
              pendingChanges={pendingChanges}
              isSavingContent={isSavingContent}
              lastSaved={lastSaved}
              novelId={novel.id}
              onRefresh={onRefresh}
            />
          </div>
        </div>

        {/* ✅ SCROLLABLE CONTENT AREA: This is the main scrolling container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* ✅ CHAPTER STATS: Fixed below header */}
          <div className="flex-shrink-0 p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">
                {expandedChapters.size} of{" "}
                {novel.acts?.flatMap((act) => act.chapters).length || 0}{" "}
                chapters expanded
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const allChapterIds =
                      novel.acts?.flatMap((act) =>
                        act.chapters.map((c) => c.id)
                      ) || [];
                    setExpandedChapters(new Set(allChapterIds));
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Expand All
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={() => setExpandedChapters(new Set())}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* ✅ NOVEL STATS: Quick overview */}
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>{novel.acts?.length || 0} acts</span>
              <span className="text-gray-600">•</span>
              <span>
                {novel.acts?.flatMap((act) => act.chapters).length || 0}{" "}
                chapters
              </span>
              <span className="text-gray-600">•</span>
              <span>
                {novel.acts
                  ?.flatMap((act) => act.chapters)
                  .flatMap((ch) => ch.scenes).length || 0}{" "}
                scenes
              </span>
            </div>
          </div>

          {/* ✅ MAIN SCROLLABLE TREE AREA */}
          <div className="flex-1 overflow-y-auto manuscript-sidebar-scroll smooth-scroll scroll-pt-safe">
            <div className="p-2">
              <DraggableManuscriptTree
                novel={novel}
                selectedSceneId={selectedScene?.id}
                selectedChapterId={selectedChapterId}
                selectedActId={selectedActId}
                expandedChapters={expandedChapters}
                onChapterToggle={(chapterId) => {
                  const newExpanded = new Set(expandedChapters);
                  if (newExpanded.has(chapterId)) {
                    newExpanded.delete(chapterId);
                  } else {
                    newExpanded.add(chapterId);
                  }
                  setExpandedChapters(newExpanded);
                }}
                onSceneSelect={onSceneSelect}
                onChapterSelect={onChapterSelect || (() => {})}
                onActSelect={onActSelect || (() => {})}
                onSceneDelete={(sceneId: string, title: string) => {
                  if (window.confirm(`Delete "${title}"?`)) {
                    onDeleteScene(sceneId);
                  }
                }}
                onChapterDelete={onDeleteChapter}
                onActDelete={onDeleteAct}
                onAddScene={onAddScene}
                onAddChapter={onAddChapter}
                onUpdateActName={onUpdateActName || (() => Promise.resolve())}
                onUpdateChapterName={
                  onUpdateChapterName || (() => Promise.resolve())
                }
                onUpdateSceneName={
                  onUpdateSceneName || (() => Promise.resolve())
                }
                onRefresh={onRefresh}
                viewDensity={viewDensity}
              />
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSidebar>
  );
};
