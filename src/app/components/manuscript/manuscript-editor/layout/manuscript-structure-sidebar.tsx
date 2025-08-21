// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// ✨ ENHANCED: Added act collapse/expand functionality

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
  // Contextual import prop
  onOpenContextualImport,
}) => {
  // ✨ NEW: Act expansion state management
  const [expandedActs, setExpandedActs] = useState<Set<string>>(new Set());
  // Chapter expansion state management
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // View density state
  const [viewDensity, setViewDensity] = useState<ViewDensity>("detailed");

  // ✨ ENHANCED: Initialize with smart defaults for both acts and chapters
  useEffect(() => {
    if (!novel.acts || novel.acts.length === 0) return;

    const allActIds = novel.acts.map((act) => act.id);
    const allChapterIds = novel.acts.flatMap((act) =>
      act.chapters.map((chapter) => chapter.id)
    );

    if (allActIds.length === 0) return;

    // Smart initialization strategy
    if (isFirstLoad) {
      if (selectedScene) {
        // Find and expand the act and chapter containing the selected scene
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

  // ✨ NEW: Act toggle handler
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

  // ✨ NEW: Expand/collapse all functions
  const expandAllActs = () => {
    const allActIds = novel.acts?.map((act) => act.id) || [];
    setExpandedActs(new Set(allActIds));
  };

  const collapseAllActs = () => {
    setExpandedActs(new Set());
    setExpandedChapters(new Set()); // Also collapse all chapters
  };

  const expandAllChapters = () => {
    const allChapterIds =
      novel.acts?.flatMap((act) => act.chapters.map((ch) => ch.id)) || [];
    setExpandedChapters(new Set(allChapterIds));
    // Also expand all acts to show chapters
    expandAllActs();
  };

  const collapseAllChapters = () => {
    setExpandedChapters(new Set());
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
        {/* FIXED HEADER: This stays at the top, doesn't scroll */}
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

            {/* Auto-Save Tools - Fixed at top */}
            <CompactAutoSaveTools
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              handleManualSave={handleManualSave}
              pendingChanges={pendingChanges}
              isSavingContent={isSavingContent}
              lastSaved={lastSaved}
              novelId={novel.id}
              onRefresh={onRefresh}
              onOpenContextualImport={onOpenContextualImport}
            />
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* ✨ ENHANCED: Structure stats with act/chapter controls */}
          <div className="flex-shrink-0 p-4 bg-gray-800 border-b border-gray-700">
            {/* Acts Controls */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">
                {expandedActs.size} of {novel.acts?.length || 0} acts expanded
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={expandAllActs}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Expand All Acts
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={collapseAllActs}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Chapters Controls */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">
                {expandedChapters.size} of{" "}
                {novel.acts?.flatMap((act) => act.chapters).length || 0}{" "}
                chapters expanded
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={expandAllChapters}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Expand All Chapters
                </button>
                <span className="text-xs text-gray-600">•</span>
                <button
                  onClick={collapseAllChapters}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Collapse All Chapters
                </button>
              </div>
            </div>

            {/* Novel Stats */}
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

          {/* MAIN SCROLLABLE TREE AREA */}
          <div className="flex-1 overflow-y-auto manuscript-sidebar-scroll smooth-scroll scroll-pt-safe">
            <div className="p-2">
              <DraggableManuscriptTree
                novel={novel}
                selectedSceneId={selectedScene?.id}
                selectedChapterId={selectedChapterId}
                selectedActId={selectedActId}
                expandedActs={expandedActs} // ✨ NEW: Pass expanded acts
                expandedChapters={expandedChapters}
                onActToggle={handleActToggle} // ✨ NEW: Act toggle handler
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
