// src/hooks/manuscript/useManuscriptLogic.ts
// FIXED: Proper infinite loop prevention using stable ref pattern

import { useEffect, useCallback, useRef } from "react";
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

  // Create the actual load function
  loadNovelStructureRef.current = async (id: string) => {
    console.log("🔄 API CALL: loadNovelStructure called for novelId:", id);
    try {
      actions.setLoading(true);

      const response = await fetch(`/api/novels/${id}/structure`);

      if (response.ok) {
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
    } finally {
      actions.setLoading(false);
    }
  };

  // ===== STABLE WRAPPER FUNCTION =====
  const loadNovelStructure = useCallback(
    (id: string) => {
      if (loadNovelStructureRef.current) {
        return loadNovelStructureRef.current(id);
      }
      return Promise.resolve();
    },
    [] // ✅ EMPTY DEPENDENCIES - function is stable
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
                console.log("🔄 Auto-selecting chapter for scene");
                actions.setSelectedChapter(chapter);
                break;
              }
            }
          }
        } else if (newViewMode === "act") {
          for (const act of state.novel.acts) {
            if (
              act.chapters.some((chapter) =>
                chapter.scenes.some(
                  (scene) => scene.id === state.selectedScene!.id
                )
              )
            ) {
              console.log("🔄 Auto-selecting act for scene");
              actions.setSelectedAct(act);
              break;
            }
          }
        }
      }
      actions.setViewMode(newViewMode);
    },
    [state.selectedScene, state.novel?.acts, actions]
  );

  // ===== SELECTION HANDLERS =====
  const handleSceneSelect = useCallback(
    (sceneId: string, scene: Scene) => {
      console.log("🎯 Scene selected:", sceneId);
      actions.setSelectedScene(scene);
      actions.setViewMode("scene");
    },
    [actions]
  );

  const handleChapterSelect = useCallback(
    (chapter: Chapter) => {
      console.log("📖 Chapter selected:", chapter.id);
      actions.setSelectedChapter(chapter);
      actions.setViewMode("chapter");
    },
    [actions]
  );

  const handleActSelect = useCallback(
    (act: Act) => {
      console.log("🎭 Act selected:", act.id);
      actions.setSelectedAct(act);
      actions.setViewMode("act");
    },
    [actions]
  );

  // ===== UPDATE HANDLERS =====
  const handleUpdateActName = useCallback(
    async (actId: string, newTitle: string) => {
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            console.log("✅ Act name updated:", actId);

            // Update local state
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
              actions.setSelectedAct({
                ...state.selectedAct,
                title: newTitle,
              });
            }
          } else {
            throw new Error(result.error || "Failed to update act name");
          }
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to update act name");
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

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            console.log("✅ Chapter name updated:", chapterId);

            // Update local state
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
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to update chapter name");
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

        if (response.ok) {
          const result = await response.json();

          if (result.success) {
            console.log("✅ Scene name updated:", sceneId);

            // Update local state
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

  // ===== INITIALIZATION - FIXED: Only run once per novelId =====
  useEffect(() => {
    if (novelId) {
      console.log("🚀 Initial load for novelId:", novelId);
      loadNovelStructure(novelId);
    }
  }, [novelId, loadNovelStructure]); // ✅ Stable loadNovelStructure won't cause loops

  // ===== COMPUTED VALUES =====
  const hasStructure =
    state.novel && state.novel.acts && state.novel.acts.length > 0;

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
===== STABLE REF PATTERN SOLUTION =====

✅ ELIMINATED INFINITE LOOP: Using ref to store the actual function
✅ STABLE WRAPPER: loadNovelStructure has empty dependencies []
✅ ESLint COMPLIANT: All dependencies properly included
✅ MAINTAINS FUNCTIONALITY: All features work exactly the same

===== HOW THIS WORKS =====

1. STORE FUNCTION IN REF: loadNovelStructureRef.current holds the actual implementation
2. STABLE WRAPPER: loadNovelStructure is a stable function that calls the ref
3. UPDATE REF ON RENDER: The ref is updated on every render with fresh closure
4. NO DEPENDENCY ISSUES: The wrapper has empty deps, ref is always current

===== LOAD BEHAVIOR =====

- ✅ Once per novelId change (useEffect runs once per novelId)
- ✅ Manual refresh via handleRefresh
- ✅ Explicit calls from components
- ❌ No infinite loops (stable wrapper function)

This is a common React pattern for breaking dependency cycles while maintaining ESLint compliance!
*/
