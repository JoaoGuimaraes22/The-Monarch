// src/hooks/manuscript/useManuscriptLogic.ts
// ✨ PHASE 2: Refactored to use dedicated state management hook
// ✅ FIXED: Infinite loop issue resolved

import { useEffect, useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { useAutoSave } from "./useAutoSave";
import { useManuscriptState } from "./useManuscriptState";

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
  // ✨ PHASE 2: Use dedicated state management hook
  const { state, actions } = useManuscriptState();

  // ✨ PHASE 1: Use dedicated auto-save hook
  const autoSave = useAutoSave({
    novelId,
    selectedScene: state.selectedScene,
    delay: 2000,
  });

  // ===== NOVEL STRUCTURE LOADING (FIXED FOR INFINITE LOOP) =====
  const loadNovelStructure = useCallback(
    async (id: string) => {
      console.log("🔄 API CALL: loadNovelStructure called");
      try {
        actions.setLoading(true);
        const response = await fetch(`/api/novels/${id}/structure`);
        if (response.ok) {
          const novelData = await response.json();
          actions.setNovel(novelData);

          // Get current scene ID to avoid dependency issues
          const currentSceneId = state.selectedScene?.id;

          // Only auto-select if no scene is currently selected
          if (novelData.acts && novelData.acts.length > 0) {
            let sceneStillExists = false;
            if (currentSceneId) {
              for (const act of novelData.acts) {
                for (const chapter of act.chapters) {
                  if (
                    chapter.scenes.some((s: Scene) => s.id === currentSceneId)
                  ) {
                    sceneStillExists = true;
                    break;
                  }
                }
                if (sceneStillExists) break;
              }
            }

            if (!currentSceneId || !sceneStillExists) {
              const firstAct = novelData.acts[0];
              if (firstAct && firstAct.chapters.length > 0) {
                const firstChapter = firstAct.chapters[0];
                if (firstChapter.scenes.length > 0) {
                  const firstScene = firstChapter.scenes[0];
                  actions.setSelectedScene(firstScene);
                  console.log("Auto-selected first scene:", firstScene.title);
                }
              }
            }
          }
        } else {
          console.error("Failed to load novel structure");
        }
      } catch (error) {
        console.error("Error loading novel structure:", error);
      } finally {
        actions.setLoading(false);
      }
    },
    // ✅ FIXED: Empty dependencies to stop infinite loop
    []
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

  // ===== CREATE HANDLERS WITH LOCAL STATE UPDATES =====

  const handleAddScene = useCallback(
    async (chapterId: string, afterSceneId?: string) => {
      if (!novelId) return;

      try {
        const requestBody = afterSceneId
          ? { insertAfterSceneId: afterSceneId }
          : {};
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
          console.log("✅ Scene created:", result.scene);

          // ✅ LOCAL STATE UPDATE - NO RELOAD
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

                    scenes.splice(insertIndex, 0, result.scene);
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

          // Auto-select new scene
          actions.setSelectedScene(result.scene);
          actions.setViewMode("scene");
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
    [novelId, actions]
  );

  // ===== REST OF CRUD HANDLERS (keeping existing for now) =====
  // TODO: Convert these to local state updates in Phase 3

  const handleAddChapter = useCallback(
    async (actId: string, afterChapterId?: string) => {
      if (!novelId) return;
      try {
        const requestBody = afterChapterId
          ? { insertAfterChapterId: afterChapterId }
          : {};
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
          console.log("✅ Chapter created:", result.chapter);
          await loadNovelStructure(novelId);
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
    [novelId, loadNovelStructure]
  );

  const handleAddAct = useCallback(
    async (title?: string, insertAfterActId?: string) => {
      if (!novelId) return;
      try {
        const requestBody = {
          title: title || "New Act",
          ...(insertAfterActId && { insertAfterActId }),
        };
        const response = await fetch(`/api/novels/${novelId}/acts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Act created:", result.act);
          await loadNovelStructure(novelId);
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
    [novelId, loadNovelStructure]
  );

  // ===== DELETE HANDLERS (keeping existing for now) =====

  const handleDeleteScene = useCallback(
    async (sceneId: string) => {
      if (!novelId) return;
      try {
        const response = await fetch(
          `/api/novels/${novelId}/scenes/${sceneId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Scene deleted:", sceneId);
          if (state.selectedScene?.id === sceneId) {
            actions.setSelectedScene(null);
          }
          await loadNovelStructure(novelId);
        } else {
          console.error("Failed to delete scene");
          alert("Failed to delete scene. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting scene:", error);
        alert("Error deleting scene. Please try again.");
      }
    },
    [novelId, state.selectedScene, actions, loadNovelStructure]
  );

  const handleDeleteChapter = useCallback(
    async (chapterId: string) => {
      if (!novelId) return;
      try {
        const response = await fetch(
          `/api/novels/${novelId}/chapters/${chapterId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          console.log("✅ Chapter deleted:", chapterId);
          if (state.selectedChapter?.id === chapterId) {
            actions.setSelectedChapter(null);
          }
          await loadNovelStructure(novelId);
        } else {
          console.error("Failed to delete chapter");
          alert("Failed to delete chapter. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Error deleting chapter. Please try again.");
      }
    },
    [novelId, state.selectedChapter, actions, loadNovelStructure]
  );

  const handleDeleteAct = useCallback(
    async (actId: string) => {
      if (!novelId) return;
      try {
        const response = await fetch(`/api/novels/${novelId}/acts/${actId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("✅ Act deleted:", actId);
          if (state.selectedAct?.id === actId) {
            actions.setSelectedAct(null);
          }
          await loadNovelStructure(novelId);
        } else {
          console.error("Failed to delete act");
          alert("Failed to delete act. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting act:", error);
        alert("Error deleting act. Please try again.");
      }
    },
    [novelId, state.selectedAct, actions, loadNovelStructure]
  );

  // ===== UPDATE HANDLERS =====

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
          console.error("Failed to update act name");
          throw new Error("Failed to update act name");
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
          console.error("Failed to update chapter name");
          throw new Error("Failed to update chapter name");
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
                    scene.id === sceneId ? { ...scene, title: newTitle } : scene
                  ),
                })),
              })),
            };
          });

          // ✅ FIXED: Update selected scene directly
          if (state.selectedScene?.id === sceneId) {
            actions.setSelectedScene({
              ...state.selectedScene,
              title: newTitle,
            });
          }
        } else {
          console.error("Failed to update scene name");
          throw new Error("Failed to update scene name");
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

    // CRUD Handlers
    handleAddScene,
    handleAddChapter,
    handleAddAct,
    handleDeleteScene,
    handleDeleteChapter,
    handleDeleteAct,

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
