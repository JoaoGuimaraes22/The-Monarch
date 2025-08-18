// src/app/components/manuscript/manuscript-editor/layout/manuscript-structure-sidebar.tsx
// Updated to use DraggableManuscriptTree for drag-and-drop functionality

import React from "react";
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
      {/* Main content when expanded - NOW WITH DRAG-AND-DROP */}
      <div className="p-4">
        <DraggableManuscriptTree
          novel={novel}
          selectedSceneId={selectedScene?.id}
          selectedChapterId={selectedChapterId}
          selectedActId={selectedActId}
          expandedChapters={new Set()} // You might want to manage this state
          onSceneSelect={onSceneSelect}
          onChapterSelect={onChapterSelect}
          onChapterToggle={(chapterId: string) => {
            // Handle chapter expand/collapse - you might want to manage this state
            console.log("Toggle chapter:", chapterId);
          }}
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
