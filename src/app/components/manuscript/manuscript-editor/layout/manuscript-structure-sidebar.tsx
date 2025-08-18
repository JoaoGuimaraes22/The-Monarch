// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// Updated to use shared CollapsibleSidebar component

import React from "react";
import { BookOpen, FileText } from "lucide-react";
import { CollapsibleSidebar } from "@/app/components/ui";
import { EnhancedChapterTree } from "../../chapter-tree/enhanced-chapter-tree";
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
      subtitle="Navigate your story"
      icon={BookOpen}
      position="left"
      width={width}
      left={left}
      collapsedContent={collapsedContent}
      className="z-20"
    >
      {/* Main content when expanded */}
      <div className="p-4">
        <EnhancedChapterTree
          novel={novel}
          selectedSceneId={selectedScene?.id}
          selectedChapterId={selectedChapterId}
          selectedActId={selectedActId}
          onSceneSelect={onSceneSelect}
          onChapterSelect={onChapterSelect}
          onActSelect={onActSelect}
          onRefresh={onRefresh}
          onAddScene={onAddScene}
          onAddChapter={onAddChapter}
          onAddAct={onAddAct}
          onDeleteScene={onDeleteScene}
          onDeleteChapter={onDeleteChapter}
          onDeleteAct={onDeleteAct}
          onUpdateActName={onUpdateActName}
          onUpdateChapterName={onUpdateChapterName}
          onUpdateSceneName={onUpdateSceneName}
          novelId={novel.id}
        />
      </div>
    </CollapsibleSidebar>
  );
};
