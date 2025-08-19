// src/hooks/manuscript/useManuscriptLogic.ts
// FIXED: Updated all API calls to use new standardized format

import { useRef, useCallback, useEffect } from "react";
import { useManuscriptState } from "./useManuscriptState";
import { useManuscriptCRUD } from "./useManuscriptCRUD";
import { useAutoSave } from "./useAutoSave";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";

export interface ManuscriptLogicReturn {
  // State from useManuscriptState
  novel: NovelWithStructure | null;
  loading: boolean;
  error: string | null; // ✅ ADDED: Missing error property
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

  // Selection Handlers
  handleSceneSelect: (sceneId: string, scene: Scene) => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleActSelect: (act: Act) => void;

  // CRUD Handlers
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
  // ✨ Use dedicated hooks
  const { state, actions } = useManuscriptState();
  const autoSave = useAutoSave({
    novelId,
    selectedScene: state.selectedScene,
    delay: 2000,
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

  // ✅ SOLUTION: Use ref to store the actual function, avoiding dependency issues
  const loadNovelStructureRef = useRef<((id: string) => Promise<void>) | null>(
    null
  );

  loadNovelStructureRef.current = async (id: string) => {
    console.log("🔄 API CALL: loadNovelStructure called for novelId:", id);
    try {
      actions.setLoading(true);

      const response = await fetch(`/api/novels/${id}/structure`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load novel structure");
      }

      const result = await response.json();

      if (result.success && result.data) {
        // ✅ FIX: Use result.data.novel instead of result.data
        actions.updateNovel(() => result.data.novel);
        console.log("✅ Novel structure loaded:", result.data.novel);
      } else {
        throw new Error(result.error || "Failed to load novel structure");
      }
    } catch (error) {
      console.error("❌ Error loading novel structure:", error);
      actions.setError(
        error instanceof Error ? error.message : "Failed to load novel"
      );
    } finally {
      actions.setLoading(false);
    }
  };

  // Create stable wrapper function
  const loadNovelStructure = useCallback(async (id: string) => {
    if (loadNovelStructureRef.current) {
      await loadNovelStructureRef.current(id);
    }
  }, []); // Empty dependencies - ref is always current

  // ===== SELECTION HANDLERS =====
  const handleSceneSelect = useCallback(
    (sceneId: string, scene: Scene) => {
      // ✅ Add sceneId parameter
      actions.setSelectedScene(scene);
      actions.setViewMode("scene");

      // Find and set parent chapter/act
      const parentChapter = state.novel?.acts
        .flatMap((act) => act.chapters)
        .find((chapter) => chapter.scenes.some((s) => s.id === scene.id));

      if (parentChapter) {
        actions.setSelectedChapter(parentChapter);

        const parentAct = state.novel?.acts.find((act) =>
          act.chapters.some((ch) => ch.id === parentChapter.id)
        );

        if (parentAct) {
          actions.setSelectedAct(parentAct);
        }
      }
    },
    [state.novel, actions]
  );

  const handleChapterSelect = useCallback(
    (chapter: Chapter) => {
      actions.setSelectedChapter(chapter);
      actions.setViewMode("chapter");

      // Find and set parent act
      const parentAct = state.novel?.acts.find((act) =>
        act.chapters.some((ch) => ch.id === chapter.id)
      );

      if (parentAct) {
        actions.setSelectedAct(parentAct);
      }
    },
    [state.novel, actions]
  );

  const handleActSelect = useCallback(
    (act: Act) => {
      actions.setSelectedAct(act);
      actions.setViewMode("act");
    },
    [actions]
  );

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

  // ===== UPDATE HANDLERS (Fixed for new API format) =====

  const handleUpdateActName = useCallback(
    async (actId: string, newTitle: string) => {
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        // ✅ FIXED: Check response.ok first
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update act name");
        }

        // ✅ FIXED: Handle new standardized response format
        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ Act name updated:", result.data);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          actions.updateNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) =>
                act.id === actId ? { ...act, title: newTitle } : act
              ),
            };
          });

          // Update selected act directly
          if (state.selectedAct?.id === actId) {
            actions.setSelectedAct({ ...state.selectedAct, title: newTitle });
          }
        } else {
          throw new Error(result.error || "Failed to update act name");
        }
      } catch (error) {
        console.error("Error updating act name:", error);
        throw error;
      }
    },
    [novelId, state.selectedAct, actions]
  );

  const handleUpdateChapterName = useCallback(
    async (chapterId: string, newTitle: string) => {
      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        // ✅ FIXED: Check response.ok first
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update chapter name");
        }

        // ✅ FIXED: Handle new standardized response format
        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ Chapter name updated:", result.data);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
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

          // Update selected chapter directly
          if (state.selectedChapter?.id === chapterId) {
            actions.setSelectedChapter({
              ...state.selectedChapter,
              title: newTitle,
            });
          }
        } else {
          throw new Error(result.error || "Failed to update chapter name");
        }
      } catch (error) {
        console.error("Error updating chapter name:", error);
        throw error;
      }
    },
    [novelId, state.selectedChapter, actions]
  );

  const handleUpdateSceneName = useCallback(
    async (sceneId: string, newTitle: string) => {
      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        // ✅ FIXED: Check response.ok first
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update scene name");
        }

        // ✅ FIXED: Handle new standardized response format
        const result = await response.json();

        if (result.success && result.data) {
          console.log("✅ Scene name updated:", result.data);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
          actions.updateNovel((prevNovel) => {
            if (!prevNovel) return prevNovel;

            return {
              ...prevNovel,
              acts: prevNovel.acts.map((act) => ({
                ...act,
                chapters: act.chapters.map((chapter) => ({
                  ...chapter,
                  scenes: chapter.scenes.map((scene) =>
                    scene.id === sceneId ? { ...scene, title: newTitle } : scene
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

  // ===== INITIALIZATION - FIXED: Only run once per novelId =====
  useEffect(() => {
    if (novelId) {
      console.log("🚀 Initial load for novelId:", novelId);
      loadNovelStructure(novelId);
    }
  }, [novelId, loadNovelStructure]); // ✅ Stable loadNovelStructure won't cause loops

  // ===== COMPUTED VALUES =====
  // Add this RIGHT BEFORE the return statement:
  console.log("🔍 COMPUTING hasStructure:");
  console.log("🔍 state.novel:", state.novel);
  console.log("🔍 state.novel?.acts:", state.novel?.acts);
  console.log("🔍 state.novel?.acts?.length:", state.novel?.acts?.length);

  const hasStructure =
    state.novel && state.novel.acts && state.novel.acts.length > 0;
  console.log("🔍 hasStructure computed value:", hasStructure);
  console.log("🔍 !!hasStructure:", !!hasStructure);

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

    // Selection Handlers
    handleSceneSelect,
    handleChapterSelect,
    handleActSelect,

    // CRUD Handlers from useManuscriptCRUD hook
    ...crud,

    // Update Handlers (Fixed for new API format)
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
===== FIXES APPLIED =====

✅ FIXED: loadNovelStructure now handles new standardized response format
   - Checks result.success before proceeding
   - Uses result.data for the novel structure
   - Uses result.error for error messages

✅ FIXED: All name update operations now handle new standardized response format
   - handleUpdateActName: Checks result.success and uses result.data
   - handleUpdateChapterName: Checks result.success and uses result.data  
   - handleUpdateSceneName: Checks result.success and uses result.data

✅ IMPROVED: Better error handling throughout
   - Check response.ok before parsing JSON
   - Proper error propagation with meaningful messages
   - Comprehensive try/catch blocks

✅ MAINTAINED: All existing functionality
   - Local state updates still work (no page refreshes)
   - Selection state management preserved
   - Auto-save integration unchanged

===== NEW API RESPONSE HANDLING =====

All operations now expect this response format:
{
  "success": true,
  "data": { actual data  },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2025-08-19T...",
    "requestId": "req_1692...",
    "version": "1.0"
  }
}

===== ERROR HANDLING =====

Handles both HTTP errors and API errors:
- HTTP errors: response.ok === false
- API errors: result.success === false
- Network errors: try/catch around fetch

This hook is now 100% compatible with the new standardized API format!
*/
