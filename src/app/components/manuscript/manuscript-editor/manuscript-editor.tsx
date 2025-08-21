// src/app/components/manuscript/manuscript-editor/manuscript-editor.tsx
// ✨ COMPLETE: Fixed props and added content saving functionality + Chapter Numbering

import React, { useState, useCallback, useMemo } from "react";
import {
  ManuscriptHeader,
  ManuscriptStructureSidebar,
  ManuscriptMetadataSidebar,
  ManuscriptContentArea,
  ViewMode,
  ViewInfo,
  ContentDisplayMode,
  contentAggregationService,
} from "@/app/components/manuscript/manuscript-editor";

import { ContextualImportDialog } from "@/app/components/manuscript/contextual-import";
import { NavigationContext } from "@/hooks/manuscript/navigation/types";
import type { ImportContext } from "@/app/components/manuscript/contextual-import";
// ✅ ONLY NEW IMPORT NEEDED
import { ManuscriptNavigationBar } from "./layout/manuscript-navigation-bar";

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
  // ✨ UPDATED: Complete auto-save functionality
  onSceneContentChange: (sceneId: string, content: string) => void;
  isSavingContent: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isMainSidebarCollapsed: boolean;
  onAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
  // ✅ UPDATED: Navigation component prop
  navigationComponent?: React.ReactNode;
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
  // ✨ UPDATED: All auto-save props
  onSceneContentChange,
  isSavingContent,
  lastSaved,
  autoSaveEnabled,
  setAutoSaveEnabled,
  handleManualSave,
  pendingChanges,
  isMainSidebarCollapsed,
  // ✅ UPDATED: Navigation component prop
  navigationComponent,
}) => {
  // State management - these are for the MANUSCRIPT sidebars, separate from main workspace sidebar
  const [isStructureSidebarCollapsed, setIsStructureSidebarCollapsed] =
    useState(false);
  const [isMetadataSidebarCollapsed, setIsMetadataSidebarCollapsed] =
    useState(false);

  const [contextualImportOpen, setContextualImportOpen] = useState(false);

  // ✨ NEW: Chapter numbering state
  const [continuousChapterNumbering, setContinuousChapterNumbering] =
    useState(false);

  // 3. CREATE A SIMPLE MOCK CONTEXT (we'll make this real in the next step):
  const mockImportContext: ImportContext = {
    novelId: novel.id,
    novelTitle: novel.title,
    availableActs: novel.acts.map((act) => ({
      id: act.id,
      title: act.title,
      order: act.order,
      chapters: act.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        scenes: chapter.scenes.map((scene) => ({
          id: scene.id,
          title: scene.title || `Scene ${scene.order}`,
          order: scene.order,
        })),
      })),
    })),
  };

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
        wordCount: selectedScene.wordCount || 0,
        sceneCount: 1,
      };
    }

    if (viewMode === "chapter" && selectedChapter) {
      return {
        title: selectedChapter.title,
        subtitle: "Chapter view",
        wordCount: selectedChapter.scenes.reduce(
          (sum, scene) => sum + (scene.wordCount || 0),
          0
        ),
        sceneCount: selectedChapter.scenes.length,
      };
    }

    if (viewMode === "act" && selectedAct) {
      const totalScenes = selectedAct.chapters.reduce(
        (sum, chapter) => sum + (chapter.scenes?.length || 0),
        0
      );
      const totalWords = selectedAct.chapters.reduce(
        (sum, chapter) =>
          sum +
          (chapter.scenes?.reduce(
            (chapterSum, scene) => chapterSum + (scene.wordCount || 0),
            0
          ) || 0),
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

  // ✨ UPDATED: Handle scene content changes (now non-async)
  const handleSceneContentChange = useCallback(
    (content: string) => {
      if (!selectedScene) return;
      onSceneContentChange(selectedScene.id, content);
    },
    [selectedScene, onSceneContentChange]
  );

  // ✨ UPDATED: Handler for individual scene changes in document views (now non-async)
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
  const formattedSubtitle = `${viewInfo.subtitle} • ${(
    viewInfo.wordCount || 0
  ).toLocaleString()} words${
    viewInfo.sceneCount > 1 ? ` • ${viewInfo.sceneCount} scenes` : ""
  }`;

  return (
    <>
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
          // ✨ NEW: Auto-save props passed to sidebar
          autoSaveEnabled={autoSaveEnabled}
          setAutoSaveEnabled={setAutoSaveEnabled}
          handleManualSave={handleManualSave}
          pendingChanges={pendingChanges}
          isSavingContent={isSavingContent}
          lastSaved={lastSaved}
          // ✨ NEW: Chapter numbering props
          continuousChapterNumbering={continuousChapterNumbering}
          setContinuousChapterNumbering={setContinuousChapterNumbering}
          isCollapsed={isStructureSidebarCollapsed}
          onToggleCollapse={() =>
            setIsStructureSidebarCollapsed(!isStructureSidebarCollapsed)
          }
          left={structureSidebarLeft}
          width={structureSidebarWidth}
          onOpenContextualImport={() => setContextualImportOpen(true)}
        />

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col"
          style={{
            marginLeft: structureSidebarWidth,
            marginRight: metadataSidebarWidth,
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
            // ✅ UPDATED: Pass navigation component to header
            navigationComponent={navigationComponent}
          />

          {/* ✅ REMOVED: Separate navigation bar since it's now in the header */}

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
            onChapterClick={onChapterSelect}
            // ✨ NEW: Pass the individual scene change handler
            onIndividualSceneChange={handleIndividualSceneChange}
            // ✨ NEW: Pass chapter numbering mode
            continuousChapterNumbering={continuousChapterNumbering}
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

      {/* ✨ CONTEXTUAL IMPORT DIALOG */}
      <ContextualImportDialog
        isOpen={contextualImportOpen}
        onClose={() => setContextualImportOpen(false)}
        context={mockImportContext}
        onImportSuccess={() => {
          setContextualImportOpen(false);
          onRefresh(); // This should refresh your manuscript data
          // Optional: show success message
        }}
      />
    </>
  );
};

/*
===== CHAPTER NUMBERING CHANGES MADE =====

✅ ADDED:
1. State: const [continuousChapterNumbering, setContinuousChapterNumbering] = useState(false);
2. Props to ManuscriptStructureSidebar:
   - continuousChapterNumbering={continuousChapterNumbering}
   - setContinuousChapterNumbering={setContinuousChapterNumbering}
3. Prop to ManuscriptContentArea:
   - continuousChapterNumbering={continuousChapterNumbering}

✅ WHAT THIS FIXES:
- The "setContinuousChapterNumbering is not a function" error
- Enables the chapter numbering toggle to work properly
- Passes the state down through the component chain correctly

✅ NO OTHER CHANGES:
- All existing functionality preserved
- All existing props intact
- Minimal addition for maximum functionality

The toggle should now work correctly!
*/
