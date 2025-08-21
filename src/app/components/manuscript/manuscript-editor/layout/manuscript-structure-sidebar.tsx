// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// ✨ SIMPLIFIED: All tools functionality moved to CompactAutoSaveTools + Chapter Numbering

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
  // ✨ Contextual import prop
  onOpenContextualImport?: () => void;
  // ✨ NEW: Chapter numbering props
  continuousChapterNumbering: boolean;
  setContinuousChapterNumbering: (enabled: boolean) => void;
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
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isSavingContent,
  lastSaved,
  onOpenContextualImport,
  // ✨ NEW: Destructure chapter numbering props
  continuousChapterNumbering,
  setContinuousChapterNumbering,
}) => {
  const [viewDensity, setViewDensity] = useState<ViewDensity>("detailed");
  const [expandedActs, setExpandedActs] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false);

  // Smart initialization based on novel size and selected scene
  useEffect(() => {
    if (novel.acts?.length && isFirstLoad) {
      const allActIds = novel.acts.map((act) => act.id);
      const allChapterIds = novel.acts.flatMap((act) =>
        act.chapters.map((ch) => ch.id)
      );

      if (selectedScene) {
        // Expand to show selected scene
        const selectedChapter = novel.acts
          .flatMap((act) => act.chapters)
          .find((chapter) =>
            chapter.scenes.some((scene) => scene.id === selectedScene.id)
          );

        if (selectedChapter) {
          // Find the act containing this chapter
          const selectedAct = novel.acts.find((act) =>
            act.chapters.some((ch) => ch.id === selectedChapter.id)
          );

          if (selectedAct) {
            setExpandedActs(new Set([selectedAct.id]));
            setExpandedChapters(new Set([selectedChapter.id]));
          }
        }
      } else {
        // Smart defaults based on novel size
        if (allActIds.length <= 3) {
          // Auto-expand all acts if few acts
          setExpandedActs(new Set(allActIds));

          if (allChapterIds.length <= 8) {
            // Auto-expand all chapters if few chapters total
            setExpandedChapters(new Set(allChapterIds));
          } else {
            // Expand only first chapter of each act
            const firstChapters = novel.acts
              .map((act) => act.chapters[0]?.id)
              .filter(Boolean);
            setExpandedChapters(new Set(firstChapters));
          }
        } else {
          // Expand only first act
          setExpandedActs(new Set([allActIds[0]]));
          // Expand only first chapter
          setExpandedChapters(new Set([allChapterIds[0]]));
        }
      }
      setIsFirstLoad(false);
    }
  }, [novel.acts, selectedScene, isFirstLoad]);

  // Act toggle handler
  const handleActToggle = (actId: string) => {
    const newExpanded = new Set(expandedActs);
    if (newExpanded.has(actId)) {
      newExpanded.delete(actId);
      // Also collapse all chapters in this act
      const actChapterIds =
        novel.acts
          .find((act) => act.id === actId)
          ?.chapters.map((ch) => ch.id) || [];
      const newExpandedChapters = new Set(expandedChapters);
      actChapterIds.forEach((chId) => newExpandedChapters.delete(chId));
      setExpandedChapters(newExpandedChapters);
    } else {
      newExpanded.add(actId);
    }
    setExpandedActs(newExpanded);
  };

  // Enhanced chapter toggle handler
  const handleChapterToggle = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);

      // Auto-expand parent act if not already expanded
      const parentAct = novel.acts.find((act) =>
        act.chapters.some((ch) => ch.id === chapterId)
      );
      if (parentAct && !expandedActs.has(parentAct.id)) {
        const newExpandedActs = new Set(expandedActs);
        newExpandedActs.add(parentAct.id);
        setExpandedActs(newExpandedActs);
      }
    }
    setExpandedChapters(newExpanded);
  };

  // ✨ MOVED: All expand/collapse functions now in CompactAutoSaveTools
  const expandAllActs = () => {
    const allActIds = novel.acts?.map((act) => act.id) || [];
    setExpandedActs(new Set(allActIds));
  };

  const collapseAllActs = () => {
    setExpandedActs(new Set());
    setExpandedChapters(new Set()); // Also collapse all chapters
  };

  // Get the currently selected act (the one being worked on)
  const getCurrentlySelectedAct = (): Act | null => {
    if (selectedActId) {
      return novel.acts.find((act) => act.id === selectedActId) || null;
    }

    // If no direct act selection, find act from selected scene/chapter
    if (selectedScene) {
      const chapter = novel.acts
        .flatMap((act) => act.chapters)
        .find((ch) => ch.scenes.some((scene) => scene.id === selectedScene.id));

      if (chapter) {
        return (
          novel.acts.find((act) =>
            act.chapters.some((ch) => ch.id === chapter.id)
          ) || null
        );
      }
    }

    if (selectedChapterId) {
      const chapter = novel.acts
        .flatMap((act) => act.chapters)
        .find((ch) => ch.id === selectedChapterId);

      if (chapter) {
        return (
          novel.acts.find((act) =>
            act.chapters.some((ch) => ch.id === chapter.id)
          ) || null
        );
      }
    }

    return null;
  };

  // Chapter expand/collapse functions for selected act only
  const expandAllChapters = () => {
    const currentAct = getCurrentlySelectedAct();
    if (!currentAct) return;

    // Only expand chapters in the currently selected act
    const chaptersInSelectedAct = currentAct.chapters.map((ch) => ch.id);

    const newExpandedChapters = new Set(expandedChapters);
    chaptersInSelectedAct.forEach((chId) => newExpandedChapters.add(chId));
    setExpandedChapters(newExpandedChapters);

    // Also ensure the selected act is expanded to show its chapters
    if (!expandedActs.has(currentAct.id)) {
      const newExpandedActs = new Set(expandedActs);
      newExpandedActs.add(currentAct.id);
      setExpandedActs(newExpandedActs);
    }
  };

  const collapseAllChapters = () => {
    const currentAct = getCurrentlySelectedAct();
    if (!currentAct) return;

    // Only collapse chapters in the currently selected act
    const chaptersInSelectedAct = currentAct.chapters.map((ch) => ch.id);

    const newExpandedChapters = new Set(expandedChapters);
    chaptersInSelectedAct.forEach((chId) => newExpandedChapters.delete(chId));
    setExpandedChapters(newExpandedChapters);
  };

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
      {/* Enhanced container structure for scrolling */}
      <div className="h-full flex flex-col">
        {/* ✨ SIMPLIFIED HEADER: Just view density toggle and tools */}
        <div className="flex-shrink-0 border-b border-gray-700 bg-gray-800">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">TOOLS</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsToolsCollapsed(!isToolsCollapsed)}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title={isToolsCollapsed ? "Expand tools" : "Collapse tools"}
                >
                  {isToolsCollapsed ? "Expand" : "Collapse"}
                </button>
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

            {/* ✨ COLLAPSIBLE: CompactAutoSaveTools section */}
            {!isToolsCollapsed && (
              <CompactAutoSaveTools
                // Auto-save props
                autoSaveEnabled={autoSaveEnabled}
                setAutoSaveEnabled={setAutoSaveEnabled}
                handleManualSave={handleManualSave}
                pendingChanges={pendingChanges}
                isSavingContent={isSavingContent}
                lastSaved={lastSaved}
                novelId={novel.id}
                onRefresh={onRefresh}
                onOpenContextualImport={onOpenContextualImport}
                // Structure control props
                novel={novel}
                selectedScene={selectedScene}
                selectedChapterId={selectedChapterId}
                selectedActId={selectedActId}
                expandedActs={expandedActs}
                expandedChapters={expandedChapters}
                onExpandAllActs={expandAllActs}
                onCollapseAllActs={collapseAllActs}
                onExpandAllChapters={expandAllChapters}
                onCollapseAllChapters={collapseAllChapters}
                getCurrentlySelectedAct={getCurrentlySelectedAct}
                // ✨ NEW: Pass chapter numbering props
                continuousChapterNumbering={continuousChapterNumbering}
                setContinuousChapterNumbering={setContinuousChapterNumbering}
              />
            )}
          </div>

          {/* Add Act button - only show when tools not collapsed */}
          {onAddAct && !isToolsCollapsed && (
            <div className="px-3 pb-3">
              <button
                onClick={() => onAddAct()}
                className="w-full px-2 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded transition-colors flex items-center justify-center space-x-1"
              >
                <span>Add Act</span>
              </button>
            </div>
          )}
        </div>

        {/* Main scrollable tree area */}
        <div className="flex-1 overflow-y-auto manuscript-sidebar-scroll smooth-scroll scroll-pt-safe">
          <div className="p-2">
            <DraggableManuscriptTree
              novel={novel}
              selectedSceneId={selectedScene?.id}
              selectedChapterId={selectedChapterId}
              selectedActId={selectedActId}
              expandedActs={expandedActs}
              expandedChapters={expandedChapters}
              onActToggle={handleActToggle}
              onChapterToggle={handleChapterToggle}
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
