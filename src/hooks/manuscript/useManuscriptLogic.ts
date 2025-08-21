// src/hooks/manuscript/useManuscriptLogic.ts
// ✅ UPDATED: Integrating new clean navigation system

import { useCallback, useEffect } from "react";
import { useManuscriptState } from "./useManuscriptState";
import { useManuscriptCRUD } from "./useManuscriptCRUD";
import { useAutoSave } from "./useAutoSave";
import { useManuscriptSelection } from "./useManuscriptSelection";
import { useManuscriptNavigation } from "./navigation/useManuscriptNavigation";
import { useManuscriptUpdates } from "./useManuscriptUpdates";
import { useManuscriptUtils } from "./useManuscriptUtils";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";
import { NavigationContext } from "./navigation/types";

export interface ManuscriptLogicReturn {
  // State from useManuscriptState
  novel: NovelWithStructure | null;
  loading: boolean;
  error: string | null;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;

  // Auto-save state from useAutoSave
  isSavingContent: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  pendingChanges: boolean;

  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;
  handleViewModeChange: (mode: ViewMode) => void;
  handleContentDisplayModeChange: (mode: ContentDisplayMode) => void;

  // Selection Handlers (from useManuscriptSelection)
  handleSceneSelect: (sceneId: string, scene: Scene) => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleActSelect: (act: Act) => void;

  // ===== NEW NAVIGATION HANDLERS =====
  getNavigationContext: () => NavigationContext;
  // Primary selection handlers (change view focus)
  selectScene: (sceneId: string) => void;
  selectChapter: (chapterId: string) => void;
  selectAct: (actId: string) => void;
  // Secondary scroll handlers (just scroll within view)
  scrollToScene: (sceneId: string) => void;
  scrollToChapter: (chapterId: string) => void;

  // CRUD Handlers (enhanced + from useManuscriptCRUD)
  handleAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  handleAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
  handleAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
  handleDeleteScene: (sceneId: string) => Promise<void>;
  handleDeleteChapter: (chapterId: string) => Promise<void>;
  handleDeleteAct: (actId: string) => Promise<void>;

  // Update Handlers (from useManuscriptUpdates)
  handleUpdateActName: (actId: string, newTitle: string) => Promise<void>;
  handleUpdateChapterName: (
    chapterId: string,
    newTitle: string
  ) => Promise<void>;
  handleUpdateSceneName: (sceneId: string, newTitle: string) => Promise<void>;

  // Auto-save handlers
  handleSceneContentChange: (sceneId: string, content: string) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;

  // Utility
  handleRefresh: () => void;
  loadNovelStructure: (id: string) => Promise<void>;
  hasStructure: boolean;
}

export function useManuscriptLogic(novelId: string): ManuscriptLogicReturn {
  // ===== CORE HOOKS =====
  const { state, actions } = useManuscriptState();
  const autoSave = useAutoSave({
    novelId,
    selectedScene: state.selectedScene,
    delay: 2000,
  });

  // ===== MODULAR HOOKS =====
  const selection = useManuscriptSelection({
    novel: state.novel,
    actions,
  });

  // ===== NEW NAVIGATION SYSTEM =====
  const navigation = useManuscriptNavigation({
    novel: state.novel,
    selectedScene: state.selectedScene,
    selectedChapter: state.selectedChapter,
    selectedAct: state.selectedAct,
    viewMode: state.viewMode,
    contentDisplayMode: state.contentDisplayMode,
    actions,
    selectionHandlers: selection.handlers,
    selectionUtils: selection.utils,
  });

  const updates = useManuscriptUpdates({
    novelId,
    actions,
    currentSelections: {
      selectedScene: state.selectedScene,
      selectedChapter: state.selectedChapter,
      selectedAct: state.selectedAct,
    },
  });

  const utils = useManuscriptUtils({
    novelId,
    contentDisplayMode: state.contentDisplayMode,
    actions,
  });

  const crud = useManuscriptCRUD({
    novelId,
    onStateUpdate: actions.updateNovel,
    onSelectionUpdate: {
      setSelectedScene: actions.setSelectedScene,
      setSelectedChapter: actions.setSelectedChapter,
      setSelectedAct: actions.setSelectedAct,
      setViewMode: actions.setViewMode,
    },
    currentSelections: {
      selectedScene: state.selectedScene,
      selectedChapter: state.selectedChapter,
      selectedAct: state.selectedAct,
    },
  });

  // ===== VIEW MODE HANDLERS =====
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      actions.setViewMode(mode);
    },
    [actions]
  );

  const handleContentDisplayModeChange = useCallback(
    (mode: ContentDisplayMode) => {
      actions.setContentDisplayMode(mode);
    },
    [actions]
  );

  // ===== ENHANCED CRUD HANDLERS WITH VIEW MODE PRESERVATION =====
  const handleAddScene = useCallback(
    async (chapterId: string, afterSceneId?: string) => {
      try {
        await crud.handleAddScene(chapterId, afterSceneId);
        // Maintain current view mode - don't auto-switch to scene view
        console.log("✅ Scene added successfully, preserving view mode");
      } catch (error) {
        console.error("❌ Failed to add scene:", error);
        alert("Failed to add scene. Please try again.");
      }
    },
    [crud]
  );

  const handleAddChapter = useCallback(
    async (actId: string, afterChapterId?: string) => {
      try {
        await crud.handleAddChapter(actId, afterChapterId);
        // Maintain current view mode - don't auto-switch
        console.log("✅ Chapter added successfully, preserving view mode");
      } catch (error) {
        console.error("❌ Failed to add chapter:", error);
        alert("Failed to add chapter. Please try again.");
      }
    },
    [crud]
  );

  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      try {
        await crud.handleAddAct(title, insertAfterActId);
        console.log("✅ Act added successfully");
      } catch (error) {
        console.error("❌ Failed to add act:", error);
        alert("Failed to add act. Please try again.");
      }
    },
    [crud]
  );

  // ===== INITIALIZATION =====
  const { loadNovelStructure } = utils;
  useEffect(() => {
    if (novelId) {
      console.log("🚀 Initial load for novelId:", novelId);
      loadNovelStructure(novelId);
    }
  }, [novelId, loadNovelStructure]);

  // ===== COMPUTED VALUES =====
  const hasStructure = utils.hasStructure(state.novel);

  // ===== RETURN INTERFACE =====
  return {
    // State from useManuscriptState hook
    ...state,

    // Auto-save state from useAutoSave hook
    isSavingContent: autoSave.state.isSaving,
    lastSaved: autoSave.state.lastSaved,
    autoSaveEnabled: autoSave.state.enabled,
    pendingChanges: autoSave.state.pendingChanges,

    // UI Actions
    setViewMode: actions.setViewMode,
    setContentDisplayMode: actions.setContentDisplayMode,
    handleViewModeChange,
    handleContentDisplayModeChange,

    // Selection Handlers (from useManuscriptSelection)
    handleSceneSelect: selection.handlers.handleSceneSelect,
    handleChapterSelect: selection.handlers.handleChapterSelect,
    handleActSelect: selection.handlers.handleActSelect,

    // ===== NEW NAVIGATION HANDLERS =====
    getNavigationContext: navigation.getNavigationContext,
    // Primary selection handlers (change view focus)
    selectScene: navigation.selectScene,
    selectChapter: navigation.selectChapter,
    selectAct: navigation.selectAct,
    // Secondary scroll handlers (just scroll within view)
    scrollToScene: navigation.scrollToScene,
    scrollToChapter: navigation.scrollToChapter,

    // CRUD Handlers (enhanced + from useManuscriptCRUD)
    handleAddScene,
    handleAddChapter,
    handleAddAct,
    handleDeleteScene: crud.handleDeleteScene,
    handleDeleteChapter: crud.handleDeleteChapter,
    handleDeleteAct: crud.handleDeleteAct,

    // Update Handlers (from useManuscriptUpdates)
    handleUpdateActName: updates.handleUpdateActName,
    handleUpdateChapterName: updates.handleUpdateChapterName,
    handleUpdateSceneName: updates.handleUpdateSceneName,

    // Auto-save handlers from useAutoSave hook
    handleSceneContentChange: autoSave.actions.handleContentChange,
    setAutoSaveEnabled: autoSave.actions.setEnabled,
    handleManualSave: async () => {
      await autoSave.actions.handleManualSave();
    },

    // Utility
    handleRefresh: utils.handleRefresh,
    loadNovelStructure: utils.loadNovelStructure,
    hasStructure,
  };
}

/*
===== INTEGRATION UPDATES =====

✅ NEW NAVIGATION SYSTEM:
- Replaced old navigation with clean primary/secondary separation
- Updated import path to "./navigation/useManuscriptNavigation"
- Added all new navigation handlers to return interface

✅ CLEAR HANDLER SEPARATION:
- Primary handlers (selectScene/Chapter/Act) = Change view focus
- Secondary handlers (scrollToScene/Chapter) = Just scroll within view
- getNavigationContext provides view-specific navigation configs

✅ BACKWARD COMPATIBILITY:
- Kept existing selection handlers for components that still use them
- Enhanced CRUD handlers still work as before
- All other functionality preserved

✅ READY FOR TESTING:
- Navigation context provides clean data structure for UI
- Handlers are properly separated by function
- Type safety maintained throughout

This integration maintains all existing functionality while adding the new clean navigation system!
*/
