// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// Updated with smart chapter expansion - start with first chapter expanded

import React, { useState, useEffect } from "react";
import { BookOpen, FileText } from "lucide-react";
import { CollapsibleSidebar } from "@/app/components/ui";
import { DraggableManuscriptTree } from "../../chapter-tree/draggable-manuscript-tree";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

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

  // ✅ Initialize with smart defaults
  useEffect(() => {
    const allChapterIds = novel.acts.flatMap((act) =>
      act.chapters.map((chapter) => chapter.id)
    );

    // Smart initialization strategy:
    // 1. If there's a selected scene, expand its chapter
    // 2. If there's a selected chapter, expand it
    // 3. Otherwise, expand the first chapter (for discoverability)
    const initialExpanded = new Set<string>();

    if (selectedScene && selectedChapterId) {
      // Expand the chapter containing the selected scene
      initialExpanded.add(selectedChapterId);
    } else if (selectedChapterId) {
      // Expand the selected chapter
      initialExpanded.add(selectedChapterId);
    } else if (allChapterIds.length > 0) {
      // Expand the first chapter for discoverability
      initialExpanded.add(allChapterIds[0]);
    }

    setExpandedChapters(initialExpanded);
  }, [novel.acts, selectedScene, selectedChapterId]);

  // ✅ Handle chapter toggle
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

  // ✅ Auto-expand chapter when scene is selected from elsewhere
  useEffect(() => {
    if (
      selectedScene &&
      selectedChapterId &&
      !expandedChapters.has(selectedChapterId)
    ) {
      setExpandedChapters((prev) => new Set([...prev, selectedChapterId]));
    }
  }, [selectedScene, selectedChapterId, expandedChapters]);

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
      {/* Main content when expanded - WITH SMART CHAPTER EXPANSION */}
      <div className="p-4">
        {/* ✨ Quick Expand/Collapse All Button */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {expandedChapters.size} of{" "}
            {novel.acts.flatMap((act) => act.chapters).length} chapters expanded
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const allChapterIds = novel.acts.flatMap((act) =>
                  act.chapters.map((chapter) => chapter.id)
                );
                setExpandedChapters(new Set(allChapterIds));
              }}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              title="Expand all chapters"
            >
              Expand All
            </button>
            <span className="text-xs text-gray-600">•</span>
            <button
              onClick={() => setExpandedChapters(new Set())}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              title="Collapse all chapters"
            >
              Collapse All
            </button>
          </div>
        </div>

        <DraggableManuscriptTree
          novel={novel}
          selectedSceneId={selectedScene?.id}
          selectedChapterId={selectedChapterId}
          selectedActId={selectedActId}
          expandedChapters={expandedChapters} // ✅ Now properly managed
          onSceneSelect={onSceneSelect}
          onChapterSelect={handleChapterSelect}
          onChapterToggle={handleChapterToggle} // ✅ Now properly handled
          onSceneDelete={async (sceneId: string, title: string) => {
            if (
              window.confirm(`Delete scene "${title}"? This cannot be undone.`)
            ) {
              await onDeleteScene(sceneId);
            }
          }}
          onAddScene={onAddScene}
          onRefresh={onRefresh}
        />
      </div>
    </CollapsibleSidebar>
  );
};
