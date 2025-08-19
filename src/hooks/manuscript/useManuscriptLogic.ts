// src/hooks/manuscript/useManuscriptLogic.ts
// ✨ PHASE 3: Complete modular hook architecture - NO MORE PAGE REFRESHES!

import { useEffect, useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { useAutoSave } from "./useAutoSave";
import { useManuscriptState } from "./useManuscriptState";
import { useManuscriptCRUD } from "./useManuscriptCRUD";

export interface ManuscriptLogicReturn {
  // State
  novel: NovelWithStructure | null;
  loading: boolean;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: "document" | "grid";

  // Auto-save state
  isSavingContent: boolean;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
  pendingChanges: boolean;

  // UI Actions
  setViewMode: (mode: ViewMode) => void;
  setContentDisplayMode: (mode: "document" | "grid") => void;
  handleViewModeChange: (newViewMode: ViewMode) => void;
  handleContentDisplayModeChange: (newMode: "document" | "grid") => void;

  // Selection Handlers
  handleSceneSelect: (sceneId: string, scene: Scene) => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleActSelect: (act: Act) => void;

  // CRUD Handlers (now from useManuscriptCRUD - NO MORE PAGE REFRESHES!)
  handleAddScene: (chapterId: string, afterSceneId?: string) => Promise<void>;
  handleAddChapter: (actId: string, afterChapterId?: string) => Promise<void>;
  handleAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
  handleDeleteScene: (sceneId: string) => Promise<void>;
  handleDeleteChapter: (chapterId: string) => Promise<void>;
  handleDeleteAct: (actId: string) => Promise<void>;

  // Update Handlers
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
  // ✨ PHASE 2: Use dedicated state management hook
  const { state, actions } = useManuscriptState();

  // ✨ PHASE 1: Use dedicated auto-save hook
  const autoSave = useAutoSave({
    novelId,
    selectedScene: state.selectedScene,
    delay: 2000,
  });

  // ✨ PHASE 3: Use dedicated CRUD operations hook
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

  // ===== NOVEL STRUCTURE LOADING (Updated for new API format) =====
  const loadNovelStructure = useCallback(
    async (id: string) => {
      console.log("🔄 API CALL: loadNovelStructure called");
      try {
        actions.setLoading(true);

        const response = await fetch(`/api/novels/${id}/structure`);

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success && result.data) {
            console.log("✅ Novel structure loaded:", result.data.novel);
            actions.setNovel(result.data.novel);
          } else {
            throw new Error(result.error || "Failed to load novel structure");
          }
        } else {
          const error = await response.json();
          console.error("Failed to load novel structure:", error);
          throw new Error(error.error || "Failed to load novel structure");
        }
      } catch (error) {
        console.error("Error loading novel structure:", error);
        actions.setNovel(null);
        // Handle error appropriately - don't throw if you want to continue
      } finally {
        actions.setLoading(false);
      }
    },
    [actions]
  );

  // ===== UI ACTION HANDLERS =====
  const handleContentDisplayModeChange = useCallback(
    (newMode: "document" | "grid") => {
      actions.setContentDisplayMode(newMode);
    },
    [actions]
  );

  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      if (state.selectedScene && state.novel?.acts) {
        if (newViewMode === "chapter") {
          for (const act of state.novel.acts) {
            for (const chapter of act.chapters) {
              if (
                chapter.scenes.some(
                  (scene) => scene.id === state.selectedScene!.id
                )
              ) {
                console.log("Auto-selecting chapter:", chapter.title);
                actions.setSelectedChapter(chapter);
                actions.setSelectedAct(null);
                actions.setViewMode("chapter");
                return;
              }
            }
          }
        } else if (newViewMode === "act") {
          for (const act of state.novel.acts) {
            for (const chapter of act.chapters) {
              if (
                chapter.scenes.some(
                  (scene) => scene.id === state.selectedScene!.id
                )
              ) {
                console.log("Auto-selecting act:", act.title);
                actions.setSelectedAct(act);
                actions.setSelectedChapter(null);
                actions.setViewMode("act");
                return;
              }
            }
          }
        } else if (newViewMode === "scene") {
          actions.setSelectedChapter(null);
          actions.setSelectedAct(null);
          actions.setViewMode("scene");
          return;
        }
      }
      actions.setViewMode(newViewMode);
    },
    [state.selectedScene, state.novel, actions]
  );

  // ===== SELECTION HANDLERS =====
  const handleSceneSelect = useCallback(
    (sceneId: string, scene: Scene) => {
      console.log("🖱️ Scene selected:", scene.title);
      actions.setSelectedScene(scene);
      actions.setViewMode("scene");
      actions.setSelectedChapter(null);
      actions.setSelectedAct(null);
    },
    [actions]
  );

  const handleChapterSelect = useCallback(
    (chapter: Chapter) => {
      console.log("🖱️ Chapter selected:", chapter.title);
      actions.setSelectedChapter(chapter);
      actions.setViewMode("chapter");
      actions.setSelectedAct(null);
      if (state.selectedScene) {
        const sceneInChapter = chapter.scenes.some(
          (s) => s.id === state.selectedScene!.id
        );
        if (!sceneInChapter) {
          actions.setSelectedScene(null);
        }
      }
    },
    [state.selectedScene, actions]
  );

  const handleActSelect = useCallback(
    (act: Act) => {
      console.log("🖱️ Act selected:", act.title);
      actions.setSelectedAct(act);
      actions.setViewMode("act");
      actions.setSelectedChapter(null);
      if (state.selectedScene) {
        const sceneInAct = act.chapters.some((chapter) =>
          chapter.scenes.some((scene) => scene.id === state.selectedScene!.id)
        );
        if (!sceneInAct) {
          actions.setSelectedScene(null);
        }
      }
    },
    [state.selectedScene, actions]
  );

  // UPDATED: Fixed update handlers to work with new standardized API response format

  // ===== UPDATE HANDLERS (Updated for new API format) =====

  const handleUpdateActName = useCallback(
    async (actId: string, newTitle: string) => {
      if (!novelId) return;
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success) {
            console.log("✅ Act name updated:", newTitle);
            actions.updateNovel((prevNovel) => {
              if (!prevNovel) return prevNovel;
              return {
                ...prevNovel,
                acts: prevNovel.acts.map((act) =>
                  act.id === actId ? { ...act, title: newTitle } : act
                ),
              };
            });
          } else {
            throw new Error(result.error || "Failed to update act name");
          }
        } else {
          const error = await response.json();
          console.error("Failed to update act name:", error);
          throw new Error(error.error || "Failed to update act name");
        }
      } catch (error) {
        console.error("Error updating act name:", error);
        throw error;
      }
    },
    [novelId, actions]
  );

  const handleUpdateChapterName = useCallback(
    async (chapterId: string, newTitle: string) => {
      if (!novelId) return;
      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success) {
            console.log("✅ Chapter name updated:", newTitle);
            actions.updateNovel((prevNovel) => {
              if (!prevNovel) return prevNovel;
              return {
                ...prevNovel,
                acts: prevNovel.acts.map((act) => ({
                  ...act,
                  chapters: act.chapters.map((chapter) =>
                    chapter.id === chapterId
                      ? { ...chapter, title: newTitle }
                      : chapter
                  ),
                })),
              };
            });
          } else {
            throw new Error(result.error || "Failed to update chapter name");
          }
        } else {
          const error = await response.json();
          console.error("Failed to update chapter name:", error);
          throw new Error(error.error || "Failed to update chapter name");
        }
      } catch (error) {
        console.error("Error updating chapter name:", error);
        throw error;
      }
    },
    [novelId, actions]
  );

  const handleUpdateSceneName = useCallback(
    async (sceneId: string, newTitle: string) => {
      if (!novelId) return;
      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (response.ok) {
          // ✅ UPDATED: Handle new standardized response format
          const result = await response.json();

          if (result.success) {
            console.log("✅ Scene name updated:", newTitle);

            // Update the novel state
            actions.updateNovel((prevNovel) => {
              if (!prevNovel) return prevNovel;
              return {
                ...prevNovel,
                acts: prevNovel.acts.map((act) => ({
                  ...act,
                  chapters: act.chapters.map((chapter) => ({
                    ...chapter,
                    scenes: chapter.scenes.map((scene) =>
                      scene.id === sceneId
                        ? { ...scene, title: newTitle }
                        : scene
                    ),
                  })),
                })),
              };
            });

            // Update selected scene directly
            if (state.selectedScene?.id === sceneId) {
              actions.setSelectedScene({
                ...state.selectedScene,
                title: newTitle,
              });
            }
          } else {
            throw new Error(result.error || "Failed to update scene name");
          }
        } else {
          const error = await response.json();
          console.error("Failed to update scene name:", error);
          throw new Error(error.error || "Failed to update scene name");
        }
      } catch (error) {
        console.error("Error updating scene name:", error);
        throw error;
      }
    },
    [novelId, state.selectedScene, actions]
  );

  // ===== UTILITY FUNCTIONS =====

  const handleRefresh = useCallback(() => {
    console.log("🔄 EXPLICIT REFRESH: User action triggered refresh");
    loadNovelStructure(novelId);
  }, [loadNovelStructure, novelId]);

  // ===== INITIALIZATION =====

  useEffect(() => {
    if (novelId) {
      loadNovelStructure(novelId);
    }
  }, [novelId, loadNovelStructure]);

  // ===== COMPUTED VALUES =====

  const hasStructure =
    state.novel && state.novel.acts && state.novel.acts.length > 0;

  // ===== RETURN INTERFACE (unchanged - components don't need to change) =====

  return {
    // ✨ State from useManuscriptState hook
    ...state,

    // Auto-save state from useAutoSave hook
    isSavingContent: autoSave.state.isSaving,
    lastSaved: autoSave.state.lastSaved,
    autoSaveEnabled: autoSave.state.enabled,
    pendingChanges: autoSave.state.pendingChanges,

    // UI Actions (direct pass-through)
    setViewMode: actions.setViewMode,
    setContentDisplayMode: actions.setContentDisplayMode,
    handleViewModeChange,
    handleContentDisplayModeChange,

    // Selection Handlers
    handleSceneSelect,
    handleChapterSelect,
    handleActSelect,

    // ✨ CRUD Handlers from useManuscriptCRUD hook (NO MORE PAGE REFRESHES!)
    ...crud,

    // Update Handlers
    handleUpdateActName,
    handleUpdateChapterName,
    handleUpdateSceneName,

    // Auto-save handlers from useAutoSave hook
    handleSceneContentChange: autoSave.actions.handleContentChange,
    setAutoSaveEnabled: autoSave.actions.setEnabled,
    handleManualSave: async () => {
      await autoSave.actions.handleManualSave();
    },

    // Utility
    handleRefresh,
    loadNovelStructure,
    hasStructure: !!hasStructure,
  };
}

/*
===== CHANGES MADE =====

✅ UPDATED: All update operations now handle new standardized response format
✅ UPDATED: loadNovelStructure now handles { success, data: { novel, stats } } format
✅ UPDATED: Error handling updated for new response structure
✅ MAINTAINED: All existing local state update logic
✅ MAINTAINED: Auto-selection and UI state management

===== NEW RESPONSE HANDLING =====

All API responses now follow this format:
{
  "success": true,
  "data": {  actual response data },
  "message": "Operation completed successfully", 
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}

Update operations check result.success and use result.data
Error responses provide result.error for user-friendly messages
*/
