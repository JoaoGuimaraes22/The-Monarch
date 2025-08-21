// src/hooks/manuscript/useManuscriptLogic.ts
// ✅ REFACTORED: Clean orchestrator using modular hook architecture

import { useCallback, useEffect } from "react";
import { useManuscriptState } from "./useManuscriptState";
import { useManuscriptCRUD } from "./useManuscriptCRUD";
import { useAutoSave } from "./useAutoSave";
import { useManuscriptSelection } from "./useManuscriptSelection";
import { useManuscriptNavigation } from "./useManuscriptNavigation";
import { useManuscriptUpdates } from "./useManuscriptUpdates";
import { useManuscriptUtils } from "./useManuscriptUtils";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";
import { NavigationContext } from "./useManuscriptNavigation";

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

  // Navigation Handlers (from useManuscriptNavigation)
  handlePreviousNavigation: () => void;
  handleNextNavigation: () => void;
  handleNavigationSelect: (
    itemId: string,
    level?: "primary" | "secondary"
  ) => void;
  getNavigationContext: () => NavigationContext;

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
      if (!novelId) return;

      try {
        console.log("➕ Adding scene to chapter:", chapterId);

        const requestBody = {
          title: "New Scene",
          chapterId,
          ...(afterSceneId && { insertAfterSceneId: afterSceneId }),
        };

        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}/scenes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const newScene = result.data;
            console.log("✅ Scene created:", newScene);

            // Update local state
            actions.updateNovel((prevNovel) => {
              if (!prevNovel) return prevNovel;

              return {
                ...prevNovel,
                acts: prevNovel.acts.map((act) => ({
                  ...act,
                  chapters: act.chapters.map((chapter) => {
                    if (chapter.id === chapterId) {
                      const scenes = [...chapter.scenes];
                      let insertIndex = scenes.length;

                      if (afterSceneId) {
                        const afterIndex = scenes.findIndex(
                          (s) => s.id === afterSceneId
                        );
                        if (afterIndex >= 0) {
                          insertIndex = afterIndex + 1;
                        }
                      }

                      scenes.splice(insertIndex, 0, newScene);
                      scenes.forEach((scene, index) => {
                        scene.order = index + 1;
                      });

                      return { ...chapter, scenes };
                    }
                    return chapter;
                  }),
                })),
              };
            });

            // Smart selection based on current view mode
            if (
              utils.isInDocumentView() &&
              (state.viewMode === "chapter" || state.viewMode === "act")
            ) {
              // Document view: preserve view mode, update selected scene
              console.log(
                "📄 Document view: Preserving view mode, updating selected scene"
              );
              actions.setSelectedScene(newScene);
            } else {
              // Grid view or sidebar: traditional behavior
              console.log("🎯 Grid view or sidebar: Selecting new scene");
              actions.setSelectedScene(newScene);
              actions.setViewMode("scene");
            }
          } else {
            throw new Error(result.error || "Failed to create scene");
          }
        } else {
          const error = await response.json();
          console.error("Failed to create scene:", error);
          alert("Failed to create scene: " + (error.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error creating scene:", error);
        alert("Error creating scene. Please try again.");
      }
    },
    [novelId, actions, state.viewMode, utils]
  );

  const handleAddChapter = useCallback(
    async (actId: string, afterChapterId?: string) => {
      if (!novelId) return;

      try {
        console.log("➕ Adding chapter to act:", actId);

        const requestBody = {
          title: "New Chapter",
          actId,
          ...(afterChapterId && { insertAfterChapterId: afterChapterId }),
        };

        const response = await fetch(
          `/api/novels/${novelId}/acts/${actId}/chapters`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const newChapter = result.data;
            console.log("✅ Chapter created with auto-scene:", newChapter);

            // Update local state
            actions.updateNovel((prevNovel) => {
              if (!prevNovel) return prevNovel;

              return {
                ...prevNovel,
                acts: prevNovel.acts.map((act) => {
                  if (act.id === actId) {
                    const chapters = [...act.chapters];
                    let insertIndex = chapters.length;

                    if (afterChapterId) {
                      const afterIndex = chapters.findIndex(
                        (c) => c.id === afterChapterId
                      );
                      if (afterIndex >= 0) {
                        insertIndex = afterIndex + 1;
                      }
                    }

                    chapters.splice(insertIndex, 0, newChapter);
                    chapters.forEach((chapter, index) => {
                      chapter.order = index + 1;
                    });

                    return { ...act, chapters };
                  }
                  return act;
                }),
              };
            });

            // Smart selection based on current view mode
            if (utils.isInDocumentView() && state.viewMode === "act") {
              // Act document view: stay in act view, update selections
              console.log(
                "📄 Act document view: Preserving act view, updating selections"
              );
              const firstScene =
                selection.utils.findFirstSceneInChapter(newChapter);
              if (firstScene) {
                actions.setSelectedScene(firstScene);
                actions.setSelectedChapter(newChapter);
              }
            } else {
              // Other views: traditional behavior
              console.log("🎯 Other view: Selecting new chapter");
              actions.setSelectedChapter(newChapter);
              actions.setViewMode("chapter");

              const firstScene =
                selection.utils.findFirstSceneInChapter(newChapter);
              if (firstScene) {
                actions.setSelectedScene(firstScene);
              }
            }
          } else {
            throw new Error(result.error || "Failed to create chapter");
          }
        } else {
          const error = await response.json();
          console.error("Failed to create chapter:", error);
          alert(
            "Failed to create chapter: " + (error.error || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error creating chapter:", error);
        alert("Error creating chapter. Please try again.");
      }
    },
    [novelId, actions, state.viewMode, utils, selection.utils]
  );

  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      if (!novelId) return;

      try {
        console.log("➕ Adding act to novel:", novelId);

        const requestBody = {
          title: title || "New Act",
          novelId,
          ...(insertAfterActId && { insertAfterActId }),
        };

        const response = await fetch(`/api/novels/${novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const newAct = result.data;
            console.log("✅ Act created:", newAct);

            // Update local state
            actions.updateNovel((prevNovel) => {
              if (!prevNovel) return prevNovel;

              const acts = [...prevNovel.acts];
              let insertIndex = acts.length;

              if (insertAfterActId) {
                const afterIndex = acts.findIndex(
                  (a) => a.id === insertAfterActId
                );
                if (afterIndex >= 0) {
                  insertIndex = afterIndex + 1;
                }
              }

              acts.splice(insertIndex, 0, newAct);
              acts.forEach((act, index) => {
                act.order = index + 1;
              });

              return { ...prevNovel, acts };
            });

            // Select new act (traditional behavior)
            actions.setSelectedAct(newAct);
            actions.setViewMode("act");

            const firstScene = selection.utils.findFirstSceneInAct(newAct);
            if (firstScene) {
              actions.setSelectedScene(firstScene);
              const parentChapter = newAct.chapters.find((chapter: Chapter) =>
                chapter.scenes.some((s: Scene) => s.id === firstScene.id)
              );
              if (parentChapter) {
                actions.setSelectedChapter(parentChapter);
              }
            }
          } else {
            throw new Error(result.error || "Failed to create act");
          }
        } else {
          const error = await response.json();
          console.error("Failed to create act:", error);
          alert("Failed to create act: " + (error.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error creating act:", error);
        alert("Error creating act. Please try again.");
      }
    },
    [novelId, actions, selection.utils]
  );

  // ===== INITIALIZATION =====
  useEffect(() => {
    if (novelId) {
      console.log("🚀 Initial load for novelId:", novelId);
      utils.loadNovelStructure(novelId);
    }
  }, [novelId, utils]);

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

    // Navigation Handlers (from useManuscriptNavigation)
    handlePreviousNavigation: navigation.handlePreviousNavigation,
    handleNextNavigation: navigation.handleNextNavigation,
    handleNavigationSelect: navigation.handleNavigationSelect,
    getNavigationContext: navigation.getNavigationContext,

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
===== REFACTORING ACHIEVEMENTS =====

✅ MODULAR ARCHITECTURE: Main logic now orchestrates focused sub-hooks
✅ CLEAN SEPARATION: Each hook has single responsibility
✅ NAVIGATION READY: Full navigation system integrated
✅ MAINTAINABLE: Easy to find and modify specific functionality
✅ TESTABLE: Individual hooks can be tested in isolation
✅ EXTENSIBLE: Easy to add new features to appropriate hooks

===== HOOK RESPONSIBILITIES =====

- useManuscriptLogic: Main orchestrator and enhanced CRUD operations
- useManuscriptState: Core state management
- useManuscriptSelection: Selection logic and parent-child relationships
- useManuscriptNavigation: Navigation behavior matrix implementation
- useManuscriptUpdates: API update handlers
- useManuscriptUtils: Utility functions and novel loading
- useManuscriptCRUD: Basic CRUD operations
- useAutoSave: Content persistence

===== BENEFITS FOR NAVIGATION =====

The navigation system is now fully integrated and provides:
- Scene navigation with cross-chapter boundaries
- Chapter navigation with cross-act boundaries  
- Act navigation with dual-level controls
- Smart scroll behavior for act document view
- Context-aware mode switching

Ready for UI components! 🎉
*/
