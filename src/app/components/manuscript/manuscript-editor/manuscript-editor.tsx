// src/app/components/manuscript/manuscript-editor/manuscript-editor.tsx
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
import { contentAggregationService } from "@/app/components/manuscript/content-aggregation-service";
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
  onAddScene: (chapterId: string) => Promise<void>; // ✨ Add handlers
  onAddChapter: (actId: string) => Promise<void>; // ✨ Add handlers
  onDeleteScene: (sceneId: string) => Promise<void>; // ✨ NEW: Delete handlers
  onDeleteChapter: (chapterId: string) => Promise<void>; // ✨ NEW: Delete handlers
  onDeleteAct: (actId: string) => Promise<void>; // ✨ NEW: Delete handlers
  isMainSidebarCollapsed: boolean;
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
  onAddScene, // ✨ Add handlers
  onAddChapter, // ✨ Add handlers
  onDeleteScene, // ✨ NEW: Delete handlers
  onDeleteChapter, // ✨ NEW: Delete handlers
  onDeleteAct, // ✨ NEW: Delete handlers
  isMainSidebarCollapsed,
}) => {
  // State management
  const [isStructureSidebarCollapsed, setIsStructureSidebarCollapsed] =
    useState(false);
  const [isMetadataSidebarCollapsed, setIsMetadataSidebarCollapsed] =
    useState(false);

  // ✨ DEBUG: Log when view mode prop changes
  React.useEffect(() => {
    console.log("ManuscriptEditor: View mode prop updated to:", viewMode);
  }, [viewMode]);

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

  // Calculate view-specific display information
  const viewInfo: ViewInfo = useMemo(() => {
    if (!aggregatedContent || !selectedScene) {
      return {
        title: "Content Editor",
        subtitle: "Select a scene to view content",
        wordCount: 0,
        sceneCount: 0,
      };
    }

    const section = aggregatedContent.sections[0];
    const sceneCount = section.scenes.length;

    switch (viewMode) {
      case "scene":
        return {
          title: `Scene ${selectedScene.order}`,
          subtitle: selectedScene.status,
          wordCount: selectedScene.wordCount,
          sceneCount: 1,
        };
      case "chapter":
        return {
          title: section.title,
          subtitle: `Chapter with ${sceneCount} scenes`,
          wordCount: aggregatedContent.totalWordCount,
          sceneCount,
        };
      case "act":
        return {
          title: section.title,
          subtitle: `Act with ${sceneCount} scenes`,
          wordCount: aggregatedContent.totalWordCount,
          sceneCount,
        };
      default:
        return {
          title: "Content Editor",
          subtitle: "Select content to view",
          wordCount: 0,
          sceneCount: 0,
        };
    }
  }, [aggregatedContent, selectedScene, viewMode]);

  // Event handlers
  const handleSceneContentChange = useCallback(
    async (newContent: string) => {
      if (!selectedScene || viewMode !== "scene") return;

      // ✨ Skip saving for temporary scenes (optimistic updates)
      if (selectedScene.id.startsWith("temp_")) {
        console.log("Skipping save for temporary scene:", selectedScene.id);
        return;
      }

      try {
        const response = await fetch(
          `/api/novels/${novel.id}/scenes/${selectedScene.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newContent }),
          }
        );

        if (response.ok) {
          console.log("Scene saved successfully");
        } else {
          console.error("Failed to save scene content");
        }
      } catch (error) {
        console.error("Error saving scene content:", error);
      }
    },
    [selectedScene, novel.id, viewMode]
  );

  // Calculate layout positioning
  const structureSidebarLeft = isMainSidebarCollapsed ? "64px" : "256px";
  const structureSidebarWidth = isStructureSidebarCollapsed ? "64px" : "320px";
  const metadataSidebarWidth = isMetadataSidebarCollapsed ? "64px" : "320px";
  const contentLeft = isStructureSidebarCollapsed ? "65px" : "321px";
  const contentRight = isMetadataSidebarCollapsed ? "65px" : "321px";

  // Create formatted subtitle with word count and scene count
  const formattedSubtitle = `${
    viewInfo.subtitle
  } • ${viewInfo.wordCount.toLocaleString()} words${
    viewInfo.sceneCount > 1 ? ` • ${viewInfo.sceneCount} scenes` : ""
  }`;

  return (
    <div className="h-screen flex bg-gray-900 relative">
      {/* Left Sidebar - Manuscript Structure */}
      <ManuscriptStructureSidebar
        novel={novel}
        selectedScene={selectedScene}
        selectedChapterId={selectedChapter?.id}
        selectedActId={selectedAct?.id}
        onSceneSelect={onSceneSelect}
        onChapterSelect={onChapterSelect}
        onActSelect={onActSelect}
        onRefresh={onRefresh}
        onAddScene={onAddScene} // ✨ Add handlers
        onAddChapter={onAddChapter} // ✨ Add handlers
        onDeleteScene={onDeleteScene} // ✨ NEW: Pass through delete handlers
        onDeleteChapter={onDeleteChapter} // ✨ NEW: Pass through delete handlers
        onDeleteAct={onDeleteAct} // ✨ NEW: Pass through delete handlers
        isCollapsed={isStructureSidebarCollapsed}
        onToggleCollapse={() =>
          setIsStructureSidebarCollapsed(!isStructureSidebarCollapsed)
        }
        left={structureSidebarLeft}
        width={structureSidebarWidth}
      />

      {/* Center Panel - Header + Content */}
      <div
        className="flex flex-col transition-all duration-300"
        style={{
          marginLeft: contentLeft,
          marginRight: contentRight,
        }}
      >
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
          onAddScene={onAddScene} // ✨ Pass add scene handler
          onAddChapter={onAddChapter} // ✨ Pass add chapter handler
          novel={novel} // ✨ NEW: Pass novel data for structure info
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
        width={metadataSidebarWidth}
      />
    </div>
  );
};
