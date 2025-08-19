// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// ✨ UPDATED: Compact auto-save design with hide/show details functionality

import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { CollapsibleSidebar } from "@/app/components/ui";
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

  // Collapsed content
  const collapsedContent = (
    <button
      onClick={onToggleCollapse}
      className="p-2 text-gray-400 hover:text-white transition-colors"
      title="Expand Structure"
    >
      <BookOpen className="w-5 h-5" />
    </button>
  );

  return (
    <CollapsibleSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      title="Structure"
      subtitle="Acts, chapters & scenes"
      icon={BookOpen}
      position="left"
      width={width}
      left={left}
      collapsedContent={collapsedContent}
      className="z-30"
    >
      <div className="flex flex-col h-full">
        {/* ✨ COMPACT: Tools Section with 2-line design */}
        <div className="border-b border-gray-700 bg-gray-800">
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

            {/* ✨ NEW: Compact Auto-Save Tools */}
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

        {/* Chapter Tree */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
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
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Expand All
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={() => setExpandedChapters(new Set())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
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
              onUpdateSceneName={onUpdateSceneName || (() => Promise.resolve())}
              onRefresh={onRefresh}
              viewDensity={viewDensity}
            />
          </div>
        </div>
      </div>
    </CollapsibleSidebar>
  );
};
