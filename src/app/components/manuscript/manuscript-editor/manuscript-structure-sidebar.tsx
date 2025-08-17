// src/app/components/manuscript/manuscript-editor/manuscript-structure-sidebar.tsx
import React from "react";
import { BookOpen, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { EnhancedChapterTree } from "../chapter-tree/enhanced-chapter-tree";
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
  onAddAct?: (title?: string, insertAfterActId?: string) => Promise<void>; // ✨ NEW
  onDeleteScene: (sceneId: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onDeleteAct: (actId: string) => Promise<void>;
  // ✨ NEW: Add these name editing handler props
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
  // ✨ NEW: Destructure the name editing handlers
  onUpdateActName,
  onUpdateChapterName,
  onUpdateSceneName,
  isCollapsed,
  onToggleCollapse,
  left,
  width,
}) => {
  return (
    <div
      className="fixed top-0 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 z-20"
      style={{ left, width, height: "100vh" }}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-white">
                Manuscript Structure
              </h2>
              <p className="text-sm text-gray-400">Navigate your story</p>
            </div>
          )}

          {isCollapsed && <BookOpen className="w-6 h-6 text-red-500 mx-auto" />}

          <button
            onClick={onToggleCollapse}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 p-4 overflow-y-auto">
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
            // ✨ NEW: Pass through the name editing handlers (if ChapterTree supports them)
            // Note: You'll need to either:
            // 1. Replace ChapterTree with EnhancedChapterTree, or
            // 2. Add these props to your existing ChapterTree component
            onUpdateActName={onUpdateActName}
            onUpdateChapterName={onUpdateChapterName}
            onUpdateSceneName={onUpdateSceneName}
            novelId={novel.id}
          />
        </div>
      )}

      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Expand Structure"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
