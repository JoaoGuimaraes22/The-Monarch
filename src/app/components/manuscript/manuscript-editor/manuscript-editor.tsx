// src/app/components/manuscript/manuscript-editor/manuscript-editor.tsx
// ✨ COMPLETE: Fixed props and added content saving functionality

import React, { useState, useCallback, useMemo } from "react";
import {
  ManuscriptHeader,
  ManuscriptStructureSidebar,
  ManuscriptMetadataSidebar,
  ManuscriptContentArea,
  ViewMode,
  ViewInfo,
  ContentDisplayMode,
} from "@/app/components/manuscript/manuscript-editor";
import { contentAggregationService } from "@/app/components/manuscript/manuscript-editor/services/content-aggregation-service";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

interface ManuscriptEditorProps {
  novel: NovelWithStructure;
  selectedScene: Scene | null;
  selectedChapter?: Chapter | null;
  selectedAct?: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;
  onViewModeChange: (mode: ViewMode) => void;
  onContentDisplayModeChange: (mode: ContentDisplayMode) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onRefresh: () => void;
  onAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  onAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
  onDeleteScene: (sceneId: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onDeleteAct: (actId: string) => Promise<void>;
  onUpdateActName?: (actId: string, newTitle: string) => Promise<void>;
  onUpdateChapterName?: (chapterId: string, newTitle: string) => Promise<void>;
  onUpdateSceneName?: (sceneId: string, newTitle: string) => Promise<void>;
  // ✨ NEW: Content saving
  onSceneContentChange: (sceneId: string, content: string) => Promise<void>;
  isSavingContent: boolean;
  lastSaved: Date | null;
  isMainSidebarCollapsed: boolean;
  onAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
}

export const ManuscriptEditor: React.FC<ManuscriptEditorProps> = ({
  novel,
  selectedScene,
  selectedChapter,
  selectedAct,
  viewMode,
  contentDisplayMode,
  onViewModeChange,
  onContentDisplayModeChange,
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
  // ✨ NEW: Content saving props
  onSceneContentChange,
  isSavingContent,
  lastSaved,
  isMainSidebarCollapsed,
}) => {
  // State management - these are for the MANUSCRIPT sidebars, separate from main workspace sidebar
  const [isStructureSidebarCollapsed, setIsStructureSidebarCollapsed] =
    useState(false);
  const [isMetadataSidebarCollapsed, setIsMetadataSidebarCollapsed] =
    useState(false);

  // Generate aggregated content based on current view mode and selection
  const aggregatedContent = useMemo(() => {
    if (!selectedScene) return null;
    return contentAggregationService.aggregateContent(
      novel,
      viewMode,
      selectedScene,
      contentDisplayMode
    );
  }, [novel, viewMode, selectedScene, contentDisplayMode]);

  // Generate view info based on current view mode and selection
  const viewInfo = useMemo((): ViewInfo => {
    if (viewMode === "scene" && selectedScene) {
      return {
        title: selectedScene.title || `Scene ${selectedScene.order}`,
        subtitle: "Scene view",
        wordCount: selectedScene.wordCount,
        sceneCount: 1,
      };
    }

    if (viewMode === "chapter" && selectedChapter) {
      return {
        title: selectedChapter.title,
        subtitle: "Chapter view",
        wordCount: selectedChapter.scenes.reduce(
          (sum, scene) => sum + scene.wordCount,
          0
        ),
        sceneCount: selectedChapter.scenes.length,
      };
    }

    if (viewMode === "act" && selectedAct) {
      const totalScenes = selectedAct.chapters.reduce(
        (sum, chapter) => sum + chapter.scenes.length,
        0
      );
      const totalWords = selectedAct.chapters.reduce(
        (sum, chapter) =>
          sum +
          chapter.scenes.reduce(
            (sceneSum, scene) => sceneSum + scene.wordCount,
            0
          ),
        0
      );

      return {
        title: selectedAct.title,
        subtitle: "Act view",
        wordCount: totalWords,
        sceneCount: totalScenes,
      };
    }

    // Default fallback
    return {
      title: "Manuscript",
      subtitle: "No selection",
      wordCount: 0,
      sceneCount: 0,
    };
  }, [viewMode, selectedScene, selectedChapter, selectedAct]);

  // ✨ UPDATED: Handle scene content changes with proper saving
  const handleSceneContentChange = useCallback(
    (content: string) => {
      if (!selectedScene) return;
      onSceneContentChange(selectedScene.id, content);
    },
    [selectedScene, onSceneContentChange]
  );

  // ✨ NEW: Handler for individual scene changes in document views
  const handleIndividualSceneChange = useCallback(
    (sceneId: string, content: string) => {
      onSceneContentChange(sceneId, content);
    },
    [onSceneContentChange]
  );

  // Calculate sidebar positions and dimensions
  const workspaceSidebarWidth = isMainSidebarCollapsed ? "64px" : "256px";
  const structureSidebarLeft = workspaceSidebarWidth; // Start after workspace sidebar
  const structureSidebarWidth = isStructureSidebarCollapsed ? "64px" : "320px";
  const metadataSidebarWidth = isMetadataSidebarCollapsed ? "64px" : "320px";
  const metadataSidebarRight = "0px";

  // Create formatted subtitle with word count and scene count
  const formattedSubtitle = `${
    viewInfo.subtitle
  } • ${viewInfo.wordCount.toLocaleString()} words${
    viewInfo.sceneCount > 1 ? ` • ${viewInfo.sceneCount} scenes` : ""
  }`;

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left Sidebar - Structure */}
      <ManuscriptStructureSidebar
        novel={novel}
        // ✅ FIXED: Use the correct prop names that match the interface
        selectedScene={selectedScene}
        selectedChapterId={selectedChapter?.id}
        selectedActId={selectedAct?.id}
        onSceneSelect={onSceneSelect}
        onChapterSelect={onChapterSelect}
        onActSelect={onActSelect}
        onAddScene={onAddScene}
        onAddChapter={onAddChapter}
        onAddAct={onAddAct}
        onDeleteScene={onDeleteScene}
        onDeleteChapter={onDeleteChapter}
        onDeleteAct={onDeleteAct}
        onUpdateActName={onUpdateActName}
        onUpdateChapterName={onUpdateChapterName}
        onUpdateSceneName={onUpdateSceneName}
        onRefresh={onRefresh}
        isCollapsed={isStructureSidebarCollapsed}
        onToggleCollapse={() =>
          setIsStructureSidebarCollapsed(!isStructureSidebarCollapsed)
        }
        left={structureSidebarLeft}
        width={structureSidebarWidth}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ManuscriptHeader
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          contentDisplayMode={contentDisplayMode}
          onContentDisplayModeChange={onContentDisplayModeChange}
          title={viewInfo.title}
          subtitle={formattedSubtitle}
          hasSelectedScene={!!selectedScene}
          isReadOnly={viewMode !== "scene"}
        />

        {/* Content Area */}
        <ManuscriptContentArea
          aggregatedContent={aggregatedContent}
          viewMode={viewMode}
          contentDisplayMode={contentDisplayMode}
          onContentChange={handleSceneContentChange}
          onSceneClick={onSceneSelect}
          onSceneRename={onUpdateSceneName}
          onChapterRename={onUpdateChapterName}
          onActRename={onUpdateActName}
          onAddScene={onAddScene}
          onAddChapter={onAddChapter}
          novel={novel}
          // ✨ NEW: Pass the individual scene change handler
          onIndividualSceneChange={handleIndividualSceneChange}
          marginLeft="0"
          marginRight="0"
        />
      </div>

      {/* Right Sidebar - Metadata */}
      <ManuscriptMetadataSidebar
        selectedScene={selectedScene}
        viewMode={viewMode}
        viewInfo={viewInfo}
        isCollapsed={isMetadataSidebarCollapsed}
        onToggleCollapse={() =>
          setIsMetadataSidebarCollapsed(!isMetadataSidebarCollapsed)
        }
        right={metadataSidebarRight}
        width={metadataSidebarWidth}
      />
    </div>
  );
};
